const razorpay = require('../config/razorpay');
const Transaction = require('../models/Transaction');

const processRefund = async (application, reason) => {
  try {
    // GUARD 1: Basic validation
    if (!application.feePaid || !application.paymentId) {
      return { success: false, message: 'Application has no fee paid.' };
    }

    // GUARD 2: Check if already processed locally
    if (application.status === 'fee_refunded' || application.refundId) {
      return { success: false, message: 'Already refunded.' };
    }

    // GUARD 3: Check if forfeited
    if (application.status === 'fee_forfeited') {
      return { success: false, message: 'Fee was forfeited, not refundable.' };
    }

    let refundId = null;
    
    // Process actual refund if razorpay is configured
    if (razorpay) {
      try {
        const refund = await razorpay.payments.refund(application.paymentId, {
          amount: Math.round(application.feeAmount * 100), // Ensure integer paise
          notes: {
            reason: reason || 'system_refund',
            applicationId: application._id.toString()
          }
        });
        refundId = refund.id;
      } catch (rpError) {
        // Handle "Already refunded" from Razorpay
        if (rpError.statusCode === 400 && 
           (rpError.error?.description?.includes('already been refunded') || 
            rpError.message?.includes('already been refunded'))) {
          
          console.log(`[Refund] Payment ${application.paymentId} already refunded on Razorpay. Reconciling...`);
          
          application.status = 'fee_refunded';
          application.refundReason = reason || 'gateway_reconciled';
          application.refundProcessedAt = new Date();
          await application.save();

          return { success: true, message: 'Already refunded on gateway' };
        }
        throw rpError; // Re-throw other errors
      }
    } else {
      console.log(`[Mock] Processing Refund for Application ${application._id}`);
      refundId = `mock_ref_${Date.now()}`;
    }

    // Update Application
    application.status = 'fee_refunded';
    application.refundReason = reason;
    application.refundId = refundId;
    application.refundProcessedAt = new Date();
    await application.save();

    // Create Transaction Record
    await Transaction.create({
      application: application._id,
      candidate: application.candidate,
      type: 'refund',
      razorpayRefundId: refundId,
      amount: application.feeAmount,
      status: 'success',
      reason: reason
    });

    return { success: true, application };
  } catch (error) {
    console.error('Refund Processing Error:', error);
    
    // Log failed transaction if not already logged or refunded
    await Transaction.create({
      application: application._id,
      candidate: application.candidate,
      type: 'refund',
      amount: application.feeAmount,
      status: 'failed',
      reason: error.message || 'Razorpay API Error'
    });

    return { success: false, error: error.message };
  }
};

const processForfeit = async (application) => {
  if (!application.feePaid) return { success: false };

  application.status = 'fee_forfeited';
  application.refundReason = 'forfeited';
  await application.save();

  await Transaction.create({
    application: application._id,
    candidate: application.candidate,
    type: 'forfeit',
    amount: application.feeAmount,
    status: 'success',
    reason: 'Interview No-Show'
  });

  return { success: true, application };
};

module.exports = {
  processRefund,
  processForfeit
};
