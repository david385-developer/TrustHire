const express = require('express');
const router = express.Router();
const { verifyPayment, createOrder } = require('../controllers/paymentController');
const auth = require('../middlewares/auth');
const roleCheck = require('../middlewares/roleCheck');

router.post('/create-order', auth, roleCheck(['candidate']), createOrder);
router.post('/verify', auth, roleCheck(['candidate']), verifyPayment);

module.exports = router;
