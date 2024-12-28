const express = require("express");
const app = express();
const ErrorHandler = require("./middleware/error");
// app.use(express.json());
const cookieParser = require("cookie-parser");
const cloudinary = require("cloudinary");
const fileUpload = require("express-fileupload");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");

app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true, limit: "50mb" }));
app.use(fileUpload());

//config
dotenv.config({
  path: "backend/config/.env",
});


// import route

const user = require("./routes/UserRoute");


app.use("/api/v2", user);


// error handler
app.use(ErrorHandler);

module.exports = app;

