const ParkingRecord = require('../model/ParkingRecord');
const ParkingSlot = require('../model/ParkingSlot');
const Car = require('../model/Car');

// Create new parking record (car entry)
exports.createParkingRecord = async (req, res) => {
    try {
        const { carId, slotId } = req.body;
        
        // Verify car exists
        const car = await Car.findById(carId);
        if (!car) {
            return res.status(404).json({ success: false, message: 'Car not found' });
        }
        
        // Verify slot exists and is available
        const slot = await ParkingSlot.findById(slotId);
        if (!slot) {
            return res.status(404).json({ success: false, message: 'Parking slot not found' });
        }
        
        if (slot.slotStatus === 'occupied') {
            return res.status(400).json({ success: false, message: 'Parking slot is already occupied' });
        }
        
        // Check if car is already parked elsewhere
        const existingRecord = await ParkingRecord.findOne({
            carId,
            exitTime: null
        });
        
        if (existingRecord) {
            return res.status(400).json({ 
                success: false, 
                message: 'This car is already parked in another slot' 
            });
        }
        
        // Create new parking record
        const parkingRecord = new ParkingRecord({
            carId,
            slotId,
            entryTime: new Date()
        });
        
        // Update slot status to occupied
        slot.slotStatus = 'occupied';
        await slot.save();
        
        await parkingRecord.save();
        
        return res.status(201).json({ success: true, parkingRecord });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// Record car exit and calculate duration
exports.recordExit = async (req, res) => {
    try {
        const parkingRecord = await ParkingRecord.findById(req.params.id);
        
        if (!parkingRecord) {
            return res.status(404).json({ success: false, message: 'Parking record not found' });
        }
        
        if (parkingRecord.exitTime) {
            return res.status(400).json({ success: false, message: 'Exit already recorded for this parking record' });
        }
        
        // Record exit time
        const exitTime = new Date();
        
        // Check if a custom duration was specified
        let duration;
        if (req.query.customDuration) {
            duration = parseInt(req.query.customDuration);
            
            if (isNaN(duration) || duration <= 0) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Invalid custom duration specified' 
                });
            }
        } else {
            // Calculate duration in hours, rounded up if less than 1 hour
            const entryTime = new Date(parkingRecord.entryTime);
            const durationMs = exitTime - entryTime;
            const durationHours = durationMs / (1000 * 60 * 60);
            
            // Round up to the next hour if duration is less than 1 hour
            duration = durationHours < 1 ? 1 : Math.ceil(durationHours);
        }
        
        // Update parking record
        parkingRecord.exitTime = exitTime;
        parkingRecord.duration = duration;
        await parkingRecord.save();
        
        // Update slot status to available
        await ParkingSlot.findByIdAndUpdate(parkingRecord.slotId, { slotStatus: 'available' });
        
        return res.status(200).json({ 
            success: true, 
            parkingRecord,
            fee: duration * 500 // 500 Rwf per hour
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// Get all parking records
exports.getAllParkingRecords = async (req, res) => {
    try {
        const parkingRecords = await ParkingRecord.find()
            .populate('carId', 'plateNumber driverName phoneNumber')
            .populate('slotId', 'slotNumber')
            .sort({ createdAt: -1 });
            
        return res.status(200).json({ success: true, parkingRecords });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// Get active parking records (cars currently parked)
exports.getActiveParkingRecords = async (req, res) => {
    try {
        const activeRecords = await ParkingRecord.find({ exitTime: null })
            .populate('carId', 'plateNumber driverName phoneNumber')
            .populate('slotId', 'slotNumber')
            .sort({ entryTime: -1 });
            
        return res.status(200).json({ success: true, activeRecords });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// Get completed parking records (cars that have exited)
exports.getCompletedParkingRecords = async (req, res) => {
    try {
        const completedRecords = await ParkingRecord.find({ exitTime: { $ne: null } })
            .populate('carId', 'plateNumber driverName phoneNumber')
            .populate('slotId', 'slotNumber')
            .sort({ exitTime: -1 });
            
        return res.status(200).json({ success: true, completedRecords });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// Get parking record by ID
exports.getParkingRecordById = async (req, res) => {
    try {
        const parkingRecord = await ParkingRecord.findById(req.params.id)
            .populate('carId', 'plateNumber driverName phoneNumber')
            .populate('slotId', 'slotNumber');
            
        if (!parkingRecord) {
            return res.status(404).json({ success: false, message: 'Parking record not found' });
        }
        
        return res.status(200).json({ success: true, parkingRecord });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// Get parking records by car ID
exports.getParkingRecordsByCarId = async (req, res) => {
    try {
        const parkingRecords = await ParkingRecord.find({ carId: req.params.carId })
            .populate('slotId', 'slotNumber')
            .sort({ entryTime: -1 });
            
        return res.status(200).json({ success: true, parkingRecords });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// Get daily parking records for reports
exports.getDailyParkingRecords = async (req, res) => {
    try {
        const { date } = req.params; // Format: YYYY-MM-DD
        
        // Create start and end date for the given day
        const startDate = new Date(date);
        const endDate = new Date(date);
        endDate.setDate(endDate.getDate() + 1);
        
        const dailyRecords = await ParkingRecord.find({
            $and: [
                { entryTime: { $gte: startDate } },
                { entryTime: { $lt: endDate } }
            ]
        })
        .populate('carId', 'plateNumber driverName phoneNumber')
        .populate('slotId', 'slotNumber')
        .sort({ entryTime: 1 });
        
        return res.status(200).json({ success: true, dailyRecords });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};
