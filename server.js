const app = require("./app");
const dotenv = require("dotenv");
const connectDatabase = require("./db/Database");
const cloudinary = require("cloudinary");

// Handling uncaught exceptions
process.on("uncaughtException", (err) => {
    console.log("Error: Uncaught Exception Occurred:", err.message);
    console.log("Server shutting down due to an uncaught exception.");
});

// Load environment variables
dotenv.config({
    path: "./config/.env",
});

// Determine which database to use
const dbURI = process.env.NODE_ENV === "test" ? process.env.MONGO_URI_TEST : process.env.DB_URL;

// Connect to the selected database
connectDatabase(dbURI);

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const server = app.listen(process.env.PORT, () => {
    console.log(`Server is running on http://localhost:${process.env.PORT}`);
    console.log(`Connected to ${process.env.NODE_ENV === "test" ? "TEST" : "PRODUCTION"} database`);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err, promise) => {
    console.log(`Error: ${err.message}`);
    console.log("Shutting down the server due to unhandled promise rejection.");
    
    server.close(() => process.exit(1));
});

module.exports = server;
