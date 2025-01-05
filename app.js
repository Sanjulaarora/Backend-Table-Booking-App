require("dotenv").config();
const express = require("express");
const app = express();
require("./db/conn");
const Bookings = require("./models/booking");
const cors = require("cors");
const router = require("./routes/router");

const corsOptions = {
    origin: ['https://table-booking-app-inky.vercel.app', 'http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
};

app.use(express.json());
app.use(cors(corsOptions));
app.use("/", router);

app.get("/", (req, res) => {
    res.send("Table Booking App server is up and running!");
});

const port = process.env.PORT || 8088;

app.listen(port, () => {
    console.log(`Server is running, port no. ${port}`);
});
