const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Enter your name"],
    maxlength: [50, "Name can't be more than 50 characters"],
    minlength: [3, "Name can't be less than 3 characters"],
  },
  email: {
    type: String,
    required: [true, "Enter your email"],
    unique: true,
    validate: [validator.isEmail, "Please enter a valid email"],
  },
  password: {
    type: String,
    required: [true, "Please enter a password"],
    minlength: [8, "Password must be at least 8 characters"],
    select: false, // Prevents the password from being returned in queries by default
  },
  avatar: {
    public_id: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
  },
  role: {
    type: String,
    default: "user",
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  resetPasswordToken: String,
  resetPasswordDate: Date, // Renamed for consistency
});

// Hash the password before saving
userSchema.pre("save", async function (next) {
  // Only hash the password if it's new or being updated
  if (!this.isModified("password")) {
    return next();
  }
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Generate JWT for authentication
userSchema.methods.getJwtToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

// Compare the provided password with the hashed password in the database
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate a reset password token
userSchema.methods.getResetToken = function () {
  // Generate a reset token
  const resetToken = crypto.randomBytes(20).toString("hex");

  // Hash the token and set it to the `resetPasswordToken` field
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  // Set the token's expiration time
  this.resetPasswordDate = Date.now() + 10 * 60 * 1000; // 10 minutes

  return resetToken; // Return the unhashed token to the user
};

module.exports = mongoose.model("User", userSchema);
