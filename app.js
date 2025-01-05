require("dotenv").config();
const express = require("express");
const app = express();
require("./db/conn");
const Bookings = require("./models/booking");
const cors = require("cors");
const router = require("./routes/router");

// Define allowed origins
const corsOptions = {
    origin: 'http://localhost:3000', // Frontend URL
    methods: ['GET', 'POST', 'OPTIONS'],
    credentials: true, // Allow credentials (cookies, headers)
};

app.use(express.json());
app.use(cors(corsOptions));
app.use(router);

app.options('*', cors(corsOptions)); // Handle OPTIONS requests

app.use("/", router);

const port = process.env.PORT || 8088;

app.listen(port, () => {
    console.log(`Server is running, port no. ${port}`);
});
