const express = require('express');
const router = express.Router();
const parkingRecordController = require('../controllers/parkingRecordController');
const { authMiddleware } = require('../middleware/authMiddleware');

// Apply authentication middleware to all parking record routes
router.use(authMiddleware);

// Parking record routes
router.post('/', parkingRecordController.createParkingRecord);
router.put('/exit/:id', parkingRecordController.recordExit);
router.get('/', parkingRecordController.getAllParkingRecords);
router.get('/active', parkingRecordController.getActiveParkingRecords);
router.get('/completed', parkingRecordController.getCompletedParkingRecords);
router.get('/car/:carId', parkingRecordController.getParkingRecordsByCarId);
router.get('/daily/:date', parkingRecordController.getDailyParkingRecords);
router.get('/:id', parkingRecordController.getParkingRecordById);

module.exports = router;
