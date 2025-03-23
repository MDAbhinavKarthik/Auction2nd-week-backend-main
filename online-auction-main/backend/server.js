
const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const cors = require("cors");

dotenv.config();
console.log('MongoDB URI:', process.env.MONGO_URI);


connectDB();


const app = express();


app.use(express.json());
app.use(
  cors({
    origin: process.env.ORIGIN || "*", 
    methods: ["GET", "PUT", "POST", "DELETE"],
    credentials: true,
  })
);


app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/auctions", require("./routes/auctionRoutes"));
app.use("/api/bids", require("./routes/bidRoutes"));


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


