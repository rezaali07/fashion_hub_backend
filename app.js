const express = require("express");
const app = express();
const ErrorHandler = require("./middleware/error");
// app.use(express.json());
const cookieParser = require("cookie-parser");
const cloudinary = require("cloudinary");
const fileUpload = require("express-fileupload");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");

// app.use(express.json());
app.use(cookieParser());
// app.use(bodyParser.urlencoded({ extended: true, limit: "50mb" }));
// app.use(fileUpload());

app.use(express.json({ limit: "100mb" }));  // Increase JSON size limit
app.use(bodyParser.urlencoded({ extended: true, limit: "100mb" }));
app.use(fileUpload({ limits: { fileSize: 100 * 1024 * 1024 } }));  // Increase file upload size limit


//
app.use((req, res, next) => {
  console.log(req.path, req.method);
  next();
});

//

//config
dotenv.config({
  path: "backend/config/.env",
});


// import route
const product = require("./routes/ProductRoute");
const user = require("./routes/UserRoute");
const order = require("./routes/OrderRoute");
const payment = require("./routes/PaymentRoute");

app.use("/api/v2", product);

app.use("/api/v2", user);

app.use("/api/v2", order);

app.use("/api/v2", payment);


// error handler
app.use(ErrorHandler);

module.exports = app;

