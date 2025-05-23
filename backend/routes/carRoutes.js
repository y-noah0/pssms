const express = require('express');
const router = express.Router();
const carController = require('../controllers/carController');
const { authMiddleware } = require('../middleware/authMiddleware');

// Apply authentication middleware to all car routes
router.use(authMiddleware);

// Car routes
router.post('/', carController.createCar);
router.get('/', carController.getAllCars);
router.get('/:id', carController.getCarById);
router.put('/:id', carController.updateCar);
router.delete('/:id', carController.deleteCar);

module.exports = router;
