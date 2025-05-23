const Payment = require('../model/Payment');
const ParkingRecord = require('../model/ParkingRecord');

// Create a new payment for a parking record
exports.createPayment = async (req, res) => {
    try {
        const { recordId, amountPaid } = req.body;
        
        // Verify parking record exists
        const parkingRecord = await ParkingRecord.findById(recordId)
            .populate('carId', 'plateNumber');
            
        if (!parkingRecord) {
            return res.status(404).json({ success: false, message: 'Parking record not found' });
        }
        
        // Check if record has an exit time
        if (!parkingRecord.exitTime) {
            return res.status(400).json({ 
                success: false, 
                message: 'Cannot create payment for a car that has not exited yet' 
            });
        }
        
        // Check if payment already exists
        const existingPayment = await Payment.findOne({ recordId });
        if (existingPayment) {
            return res.status(400).json({ 
                success: false, 
                message: 'Payment for this parking record already exists' 
            });
        }
        
        // Calculate expected amount (500 Rwf/hr)
        const expectedAmount = parkingRecord.duration * 500;
        
        // Validate amount paid
        if (amountPaid < expectedAmount) {
            return res.status(400).json({ 
                success: false, 
                message: `Payment amount must be at least ${expectedAmount} Rwf` 
            });
        }
        
        // Create new payment
        const payment = new Payment({
            recordId,
            amountPaid,
            paymentDate: new Date()
        });
        
        await payment.save();
        
        return res.status(201).json({ success: true, payment });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// Get all payments
exports.getAllPayments = async (req, res) => {
    try {
        const payments = await Payment.find()
            .populate({
                path: 'recordId',
                populate: [
                    { path: 'carId', select: 'plateNumber driverName' },
                    { path: 'slotId', select: 'slotNumber' }
                ]
            })
            .sort({ paymentDate: -1 });
            
        return res.status(200).json({ success: true, payments });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// Get payment by ID
exports.getPaymentById = async (req, res) => {
    try {
        const payment = await Payment.findById(req.params.id)
            .populate({
                path: 'recordId',
                populate: [
                    { path: 'carId', select: 'plateNumber driverName phoneNumber' },
                    { path: 'slotId', select: 'slotNumber' }
                ]
            });
            
        if (!payment) {
            return res.status(404).json({ success: false, message: 'Payment not found' });
        }
        
        return res.status(200).json({ success: true, payment });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// Get payment by record ID
exports.getPaymentByRecordId = async (req, res) => {
    try {
        const payment = await Payment.findOne({ recordId: req.params.recordId })
            .populate({
                path: 'recordId',
                populate: [
                    { path: 'carId', select: 'plateNumber driverName phoneNumber' },
                    { path: 'slotId', select: 'slotNumber' }
                ]
            });
            
        if (!payment) {
            return res.status(404).json({ success: false, message: 'Payment not found for this record' });
        }
        
        return res.status(200).json({ success: true, payment });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// Get daily payments for reports
exports.getDailyPayments = async (req, res) => {
    try {
        const { date } = req.params; // Format: YYYY-MM-DD
        
        // Create start and end date for the given day
        const startDate = new Date(date);
        const endDate = new Date(date);
        endDate.setDate(endDate.getDate() + 1);
        
        const dailyPayments = await Payment.find({
            $and: [
                { paymentDate: { $gte: startDate } },
                { paymentDate: { $lt: endDate } }
            ]
        })
        .populate({
            path: 'recordId',
            populate: [
                { path: 'carId', select: 'plateNumber driverName' },
                { path: 'slotId', select: 'slotNumber' }
            ]
        })
        .sort({ paymentDate: 1 });
        
        // Calculate total amount collected for the day
        const totalAmount = dailyPayments.reduce((total, payment) => total + payment.amountPaid, 0);
        
        return res.status(200).json({ 
            success: true, 
            dailyPayments,
            totalAmount,
            date
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};
