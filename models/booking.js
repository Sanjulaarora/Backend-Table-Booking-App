const mongoose = require("mongoose");
const validator = require("validator");

const bookingSchema = new mongoose.Schema({
    dateTime : {
        type: Date,
        required: true, //Booking date and time is required
        unique: true
    },
    numberOfGuests : {
        type: Number,
        required: true,
        min: 1, //number of guests must be atleast one
        max: 20 //number of guests must not be more than 20
    },
    contactDetails : {
        customerName : {
           type: String,
           required: true
        },
        customerNumber : {
           type: String,
           required: true,
           maxlength: 10,
           validate(value) {
              if(!validator.isMobilePhone(value, "en-IN")) { // Validates Indian mobile number
                   throw new Error("Customer Number must be a valid Indian mobile number");
                }
            }
        }
    }
}, { timestamps: true });

const Bookings = new mongoose.model("bookings", bookingSchema);

module.exports = Bookings;