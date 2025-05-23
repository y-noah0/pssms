const Car = require('../model/Car');

// Create new car
exports.createCar = async (req, res) => {
    try {
        const { plateNumber, driverName, phoneNumber } = req.body;

        // Check if car already exists
        const carExists = await Car.findOne({ plateNumber });
        if (carExists) {
            return res.status(400).json({ success: false, message: 'Car with this plate number already exists' });
        }

        // Create new car
        const car = new Car({
            plateNumber,
            driverName,
            phoneNumber
        });

        await car.save();

        return res.status(201).json({ success: true, car });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// Get all cars
exports.getAllCars = async (req, res) => {
    try {
        const cars = await Car.find().sort({ createdAt: -1 });
        return res.status(200).json({ success: true, cars });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// Get car by ID
exports.getCarById = async (req, res) => {
    try {
        const car = await Car.findById(req.params.id);
        if (!car) {
            return res.status(404).json({ success: false, message: 'Car not found' });
        }
        return res.status(200).json({ success: true, car });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// Update car
exports.updateCar = async (req, res) => {
    try {
        const { plateNumber, driverName, phoneNumber } = req.body;
        
        // Check if updating to an existing plate number
        if (plateNumber) {
            const existingCar = await Car.findOne({ 
                plateNumber, 
                _id: { $ne: req.params.id } 
            });
            
            if (existingCar) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Car with this plate number already exists' 
                });
            }
        }
        
        const updatedCar = await Car.findByIdAndUpdate(
            req.params.id,
            { plateNumber, driverName, phoneNumber },
            { new: true, runValidators: true }
        );

        if (!updatedCar) {
            return res.status(404).json({ success: false, message: 'Car not found' });
        }

        return res.status(200).json({ success: true, car: updatedCar });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// Delete car
exports.deleteCar = async (req, res) => {
    try {
        const car = await Car.findByIdAndDelete(req.params.id);
        if (!car) {
            return res.status(404).json({ success: false, message: 'Car not found' });
        }
        return res.status(200).json({ success: true, message: 'Car deleted successfully' });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};
