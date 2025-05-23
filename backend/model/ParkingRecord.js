const mongoose = require('mongoose');

const parkingRecordSchema = new mongoose.Schema({
    carId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Car',
        required: true
    },
    slotId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ParkingSlot',
        required: true
    },
    entryTime: {
        type: Date,
        required: true,
        default: Date.now
    },
    exitTime: {
        type: Date,
        default: null
    },
    duration: {
        type: Number,
        default: 0 // in hours
    }
}, { timestamps: true });

module.exports = mongoose.model('ParkingRecord', parkingRecordSchema);
