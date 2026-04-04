const Application = require('../models/Application');
const Transaction = require('../models/Transaction');
const crypto = require('crypto');
const { sendFeeConfirmed } = require('../services/emailService');
const { notifyPriorityApplication } = require('../services/notificationService');
const razorpay = require('../config/razorpay');

exports.createOrder = async (req, res) => {
  try {
    const { applicationId, amount } = req.body;

    const application = await Application.findById(applicationId);
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    if (!razorpay) {
      return res.status(503).json({ success: false, message: 'Payment gateway temporarily unavailable' });
    }

    const options = {
      amount: Math.round(amount * 100), // Razorpay handles in paise
      currency: 'INR',
      receipt: `app_${applicationId}`
    };

    const order = await razorpay.orders.create(options);
    
    application.orderId = order.id;
    await application.save();

    res.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      keyId: process.env.RAZORPAY_KEY_ID
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature, applicationId } = req.body;

    const application = await Application.findById(applicationId).populate('candidate').populate('job');
    if (!application) return res.status(404).json({ success: false, message: 'Application not found' });

    // Validate signature
    const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
    hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
    const expectedSignature = hmac.digest('hex');

    if (expectedSignature === razorpay_signature) {
      // Payment matches
      application.feePaid = true;
      application.isPriority = true;
      application.paymentId = razorpay_payment_id;
      application.feeAmount = application.job?.challengeFeeAmount || 0; // Final verify
      await application.save();

      const candidate = application.candidate;
      const job = application.job;

      await Transaction.create({
        application: application._id,
        candidate: candidate._id,
        type: 'payment',
        razorpayPaymentId: razorpay_payment_id,
        amount: application.feeAmount,
        status: 'success'
      });

      // Email for candidate
      try {
        await sendFeeConfirmed(candidate.email, application.feeAmount);
      } catch (e) { console.error('EMAIL FAIL:', e.message); }
      
      // Notification for recruiter (Priority application)
      try {
        await notifyPriorityApplication(
          job.postedBy,
          candidate.name || 'Candidate',
          job.title,
          application.feeAmount
        );
      } catch (e) { console.error('NOTIFY FAIL:', e.message); }

      return res.json({ success: true, message: 'Payment verified successfully', data: application });
    } else {
      // Signature mismatch
      await Transaction.create({
        application: application._id,
        candidate: application.candidate._id,
        type: 'payment',
        razorpayPaymentId: razorpay_payment_id,
        amount: application.feeAmount,
        status: 'failed',
        reason: 'Signature mismatch'
      });
      return res.status(400).json({ success: false, message: 'Invalid payment signature' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
