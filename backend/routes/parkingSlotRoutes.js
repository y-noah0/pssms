const express = require('express');
const router = express.Router();
const parkingSlotController = require('../controllers/parkingSlotController');
const { authMiddleware } = require('../middleware/authMiddleware');

// Apply authentication middleware to all parking slot routes
router.use(authMiddleware);

// Parking slot routes
router.post('/', parkingSlotController.createParkingSlot);
router.get('/', parkingSlotController.getAllParkingSlots);
router.get('/available', parkingSlotController.getAvailableParkingSlots);
router.get('/:id', parkingSlotController.getParkingSlotById);
router.put('/:id', parkingSlotController.updateParkingSlotStatus);
router.delete('/:id', parkingSlotController.deleteParkingSlot);

module.exports = router;
