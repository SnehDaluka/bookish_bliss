require("dotenv").config();
const express = require("express");
const connectDB = require("./db/conn");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const port = process.env.PORT;
let corsOptions = {
  origin: ["http://localhost:3000", "http://127.0.0.1:3000", "https://bookish-bliss-frontend.vercel.app"],
  optionsSuccessStatus: 200,
  methods: ["GET", "PATCH", "DELETE", "POST"],
  credentials: true,
};

const app = express();
app.use(helmet());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 1000, 
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

app.use(cors(corsOptions));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(require("./router/auth"));

// Connect to Database, then start server
connectDB().then(() => {
  app.listen(port, () => {
    console.log(`Server is running at port ${port}`);
  });
});
