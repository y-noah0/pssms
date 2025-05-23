const express = require("express");
const app = express();
const cors = require("cors");
const { default: mongoose } = require("mongoose");
require("dotenv").config();

// Import Routes
const authRoutes = require('./routes/authRoutes');
const carRoutes = require('./routes/carRoutes');
const parkingSlotRoutes = require('./routes/parkingSlotRoutes');
const parkingRecordRoutes = require('./routes/parkingRecordRoutes');
const paymentRoutes = require('./routes/paymentRoutes');

// Mongo DB Connections
mongoose
    .connect(process.env.MONGO_DB_URL)
    .then(() => {
        console.log("MongoDB Connection Succeeded.");
    })
    .catch((error) => {
        console.log("Error in DB connection: " + error);
    });

// Middleware Connections
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/cars', carRoutes);
app.use('/api/parking-slots', parkingSlotRoutes);
app.use('/api/parking-records', parkingRecordRoutes);
app.use('/api/payments', paymentRoutes);

// Connection
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log("App running in port: " + PORT);
});
