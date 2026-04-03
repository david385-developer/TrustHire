const express = require('express');
const router = express.Router();
const { verifyPayment } = require('../controllers/paymentController');
const auth = require('../middlewares/auth');
const roleCheck = require('../middlewares/roleCheck');

router.post('/verify', auth, roleCheck(['candidate']), verifyPayment);

module.exports = router;
