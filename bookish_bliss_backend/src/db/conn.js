const mongoose = require("mongoose");
const dns = require("dns");

// Force Node.js to use public DNS servers to resolve SRV records (fixes querySrv ECONNREFUSED)
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.DB);
    console.log(`MongoDB Connection Successful: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    // Exit process with failure
    process.exit(1);
  }
};

// Listen for connection events
mongoose.connection.on("disconnected", () => {
  console.log("MongoDB disconnected");
});

mongoose.connection.on("error", (err) => {
  console.error(`MongoDB connection error: ${err}`);
});

// Graceful shutdown on app termination
process.on("SIGINT", async () => {
  await mongoose.connection.close();
  console.log("MongoDB connection closed gracefully due to app termination");
  process.exit(0);
});

module.exports = connectDB;
