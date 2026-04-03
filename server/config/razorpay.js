const Razorpay = require('razorpay');

let razorpayInstance = null;

try {
  if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
    razorpayInstance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
    console.log('Razorpay initialized');
  } else {
    console.warn('Razorpay keys not found in ENV. Payments/Refunds will mock or fail.');
  }
} catch (error) {
  console.error('Failed to initialize Razorpay', error);
}

module.exports = razorpayInstance;
