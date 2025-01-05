const express = require("express");
const router = new express.Router();
const Bookings = require("../models/booking");
const mongoose = require("mongoose");

//Generate time slots for a given range and duration
const generateTimeSlots = (date, startTime, endTime, slotDuration) => {
    const slots = [];
    const [startHour, startMinute] = startTime.split(":").map(Number);
    const [endHour, endMinute] = endTime.split(":").map(Number);

    let current = new Date(date);
    current.setHours(startHour, startMinute, 0, 0);

    const end = new Date(date);
    end.setHours(endHour, endMinute, 0, 0);

    while (current < end) {
        slots.push(new Date(current).toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
        current = new Date(current.getTime() + slotDuration * 60000); 
    }

    return slots;
};

//Fetch booked slots from the database for a given date
const getBookedSlots = async (date) => {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const bookings = await Bookings.find({
        dateTime: { $gte: startOfDay, $lte: endOfDay }
    });

    return bookings.map((booking) => booking.dateTime.toISOString());
};

//POST booking API
router.post("/post-booking", async (req, res) => {
    const { dateTime, numberOfGuests, customerName, customerNumber } = req.body;

    if (!dateTime || !numberOfGuests || !customerName || !customerNumber) {
        return res.status(422).json({ error: "Please provide all the required data." });
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const existingBooking = await Bookings.findOne({ dateTime }).session(session);

        if (existingBooking) {
            await session.abortTransaction();
            return res.status(422).json({ error: "This slot is already booked." });
        }

        const newBooking = new Bookings({
            dateTime,
            numberOfGuests,
            contactDetails: { customerName, customerNumber }
        });

        const storeData = await newBooking.save({ session });

        await session.commitTransaction();

        return res.status(201).json(storeData);
    } catch (error) {
        await session.abortTransaction();
        session.endSession();

        // Check for validation errors
        if (error.name === "ValidationError") {
            const errorMessages = Object.values(error.errors).map((err) => err.message);
            return res.status(422).json({ error: errorMessages.join(", ") });
        }

        console.error("Error:", error.message);
    } finally {
        session.endSession();
    }
});

//GET available slots API
router.get("/available-slots", async (req, res) => {
    const { date } = req.query;

    if (!date) {
        return res.status(400).json({ error: "Date parameter is required." });
    }

    try {
        const startTime = "10:00";
        const endTime = "20:00"; 
        const slotDuration = 60; 

        // Generate all slots for the given date
        const allSlots = generateTimeSlots(date, startTime, endTime, slotDuration);

        // Fetch booked slots from the database
        const bookedSlots = await getBookedSlots(date);

        // Filter available slots
        const availableSlots = allSlots.filter((slot) => !bookedSlots.includes(slot));

        return res.status(200).json({ date, availableSlots });
    } catch (error) {
        console.error("Error fetching available slots:", error.message);
        return res.status(500).json({ error: "Server error. Please try again later." });
    }
});

module.exports = router;