const ParkingSlot = require('../model/ParkingSlot');

// Create new parking slot
exports.createParkingSlot = async (req, res) => {
    try {
        const { slotNumber } = req.body;

        // Check if slot already exists
        const slotExists = await ParkingSlot.findOne({ slotNumber });
        if (slotExists) {
            return res.status(400).json({ success: false, message: 'Parking slot with this number already exists' });
        }

        // Create new parking slot
        const parkingSlot = new ParkingSlot({
            slotNumber,
            slotStatus: 'available'
        });

        await parkingSlot.save();

        return res.status(201).json({ success: true, parkingSlot });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// Get all parking slots
exports.getAllParkingSlots = async (req, res) => {
    try {
        const parkingSlots = await ParkingSlot.find().sort({ slotNumber: 1 });
        return res.status(200).json({ success: true, parkingSlots });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// Get available parking slots
exports.getAvailableParkingSlots = async (req, res) => {
    try {
        const availableSlots = await ParkingSlot.find({ slotStatus: 'available' }).sort({ slotNumber: 1 });
        return res.status(200).json({ success: true, availableSlots });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// Get parking slot by ID
exports.getParkingSlotById = async (req, res) => {
    try {
        const parkingSlot = await ParkingSlot.findById(req.params.id);
        if (!parkingSlot) {
            return res.status(404).json({ success: false, message: 'Parking slot not found' });
        }
        return res.status(200).json({ success: true, parkingSlot });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// Update parking slot status
exports.updateParkingSlotStatus = async (req, res) => {
    try {
        const { slotStatus } = req.body;
        
        if (!['available', 'occupied'].includes(slotStatus)) {
            return res.status(400).json({ 
                success: false, 
                message: 'Invalid slot status. Must be either "available" or "occupied"' 
            });
        }
        
        const updatedParkingSlot = await ParkingSlot.findByIdAndUpdate(
            req.params.id,
            { slotStatus },
            { new: true, runValidators: true }
        );

        if (!updatedParkingSlot) {
            return res.status(404).json({ success: false, message: 'Parking slot not found' });
        }

        return res.status(200).json({ success: true, parkingSlot: updatedParkingSlot });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// Delete parking slot
exports.deleteParkingSlot = async (req, res) => {
    try {
        const parkingSlot = await ParkingSlot.findByIdAndDelete(req.params.id);
        if (!parkingSlot) {
            return res.status(404).json({ success: false, message: 'Parking slot not found' });
        }
        return res.status(200).json({ success: true, message: 'Parking slot deleted successfully' });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};
