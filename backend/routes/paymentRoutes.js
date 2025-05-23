const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { authMiddleware } = require('../middleware/authMiddleware');

// Apply authentication middleware to all payment routes
router.use(authMiddleware);

// Payment routes
router.post('/', paymentController.createPayment);
router.get('/', paymentController.getAllPayments);
router.get('/daily/:date', paymentController.getDailyPayments);
router.get('/record/:recordId', paymentController.getPaymentByRecordId);
router.get('/:id', paymentController.getPaymentById);

module.exports = router;
