const Application = require('../models/Application');
const Transaction = require('../models/Transaction');
const crypto = require('crypto');
const emailService = require('../services/emailService');
const notifications = require('../services/notificationService');

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
      await application.save();

      await Transaction.create({
        application: application._id,
        candidate: application.candidate._id,
        type: 'payment',
        razorpayPaymentId: razorpay_payment_id,
        amount: application.feeAmount,
        status: 'success'
      });

      emailService.sendFeeConfirmed(application.candidate.email, application.feeAmount);
      // Recruiter gets a priority application notification (and email)
      notifications.notifyPriorityApplication(
        application.job.postedBy,
        application.candidate.name || 'Candidate',
        application.job.title,
        application.feeAmount,
        { jobId: application.job._id, applicationId: application._id }
      ).catch(console.error);

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
