const User = require("../models/UserModel");
const ErrorHandler = require("../utils/ErrorHandler.js");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const sendToken = require("../utils/jwtToken");
const sendEmail = require("../utils/sendMail");
const crypto = require("crypto");
const cloudinary = require("cloudinary");

// Register user
exports.createUser = catchAsyncErrors(async (req, res, next) => {
    try {
        const { name, email, password } = req.body;

        const user = await User.create({
            name,
            email,
            password,
            avatar: {
                public_id: "avatars/py4qtusg7pqppji6d9tz",
                url: "https://res.cloudinary.com/softwarica-college-of-it-and-ecommerce/image/upload/v1676054066/avatars/py4qtusg7pqppji6d9tz.png",
            },
        });

        user.save();

        res.status(201).json({
            success: true,
            user,
        });
    } catch (error) {
        console.log(error);
        next(new ErrorHandler("Error creating user", 500));
    }
});

// User login
exports.loginUser = catchAsyncErrors(async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return next(new ErrorHandler("Please enter email and password", 400));
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
        return next(new ErrorHandler("Invalid email or password", 401));
    }

    const isPasswordMatched = await user.comparePassword(password);

    if (!isPasswordMatched) {
        return next(new ErrorHandler("Invalid email or password", 401));
    }

    sendToken(user, 200, res);
});

// Logout user
exports.logoutUser = catchAsyncErrors(async (req, res, next) => {
    res.clearCookie("token", null, {
        expires: new Date(Date.now()),
        httpOnly: true,
    });

    res.status(200).json({
        success: true,
        message: "Logged out successfully",
    });
});

// Forgot password
exports.forgetPassword = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
        return next(new ErrorHandler("No user found with this email", 404));
    }

    // Generate reset token
    const resetToken = user.getResetToken();

    // Save token to database
    await user.save({ validateBeforeSave: false });

    // Generate reset password URL
    const resetPasswordUrl = `http://localhost:3000/password/reset/${resetToken}`;

    const message = `Forgot your password? Reset it using the following link: \n\n${resetPasswordUrl}\n\nThis link is valid for 10 minutes.`;

    try {
        await sendEmail({
            email: user.email,
            subject: "Password Reset Request",
            message,
        });

        res.status(200).json({
            success: true,
            message: `Reset token sent to ${user.email}`,
        });
    } catch (error) {
        user.resetPasswordToken = undefined;
        user.resetPasswordDate = undefined;
        await user.save({ validateBeforeSave: false });

        return next(new ErrorHandler("Failed to send email. Try again later.", 500));
    }
});

// Reset password
exports.resetPassword = catchAsyncErrors(async (req, res, next) => {
    // Hash the received token
    const resetPasswordToken = crypto
        .createHash("sha256")
        .update(req.params.token)
        .digest("hex");

    // Find user by token and check expiration
    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordDate: { $gt: Date.now() },
    });

    if (!user) {
        return next(new ErrorHandler("Invalid or expired reset token", 400));
    }

    if (req.body.password !== req.body.passwordConfirm) {
        return next(new ErrorHandler("Passwords do not match", 400));
    }

    // Update password and clear reset fields
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordDate = undefined;

    await user.save();

    sendToken(user, 200, res);
});

// Update user password
exports.updatePassword = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findById(req.user.id).select("+password");

    const isPasswordMatched = await user.comparePassword(req.body.oldPassword);

    if (!isPasswordMatched) {
        return next(new ErrorHandler("Old password is incorrect", 400));
    }

    if (req.body.newPassword !== req.body.passwordConfirm) {
        return next(new ErrorHandler("Passwords do not match", 400));
    }

    user.password = req.body.newPassword;
    await user.save();

    sendToken(user, 200, res);
});

// Update user profile
exports.updateProfile = catchAsyncErrors(async (req, res, next) => {
    const newUserData = {
        name: req.body.name,
        email: req.body.email,
    };

    // Update avatar if provided
    if (req.body.avatar && req.body.avatar !== "") {
        const user = await User.findById(req.user.id);

        const imageId = user.avatar.public_id;
        await cloudinary.v2.uploader.destroy(imageId);

        const myCloud = await cloudinary.v2.uploader.upload(req.body.avatar, {
            folder: "avatars",
            width: 150,
            crop: "scale",
        });

        newUserData.avatar = {
            public_id: myCloud.public_id,
            url: myCloud.secure_url,
        };
    }

    const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
        new: true,
        runValidators: true,
        useFindAndModify: false,
    });

    res.status(200).json({
        success: true,
        user,
    });
});

// Get user details
exports.userDetails = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findById(req.user.id);

    res.status(200).json({
        success: true,
        user,
    });
});

// Get all users (Admin)
exports.getAllUsers = catchAsyncErrors(async (req, res, next) => {
    const users = await User.find();

    res.status(200).json({
        success: true,
        users,
    });
});

// Get single user (Admin)
exports.getSingleUser = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        return next(new ErrorHandler("User not found", 404));
    }

    res.status(200).json({
        success: true,
        user,
    });
});

// Update user role (Admin)
exports.updateUserRole = catchAsyncErrors(async (req, res, next) => {
    const newUserData = {
        name: req.body.name,
        email: req.body.email,
        role: req.body.role,
    };

    const user = await User.findByIdAndUpdate(req.params.id, newUserData, {
        new: true,
        runValidators: true,
        useFindAndModify: false,
    });

    res.status(200).json({
        success: true,
    });
});

// Delete user (Admin)
exports.deleteUser = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        return next(new ErrorHandler("User not found", 404));
    }

    const imageId = user.avatar.public_id;
    await cloudinary.v2.uploader.destroy(imageId);

    await user.remove();

    res.status(200).json({
        success: true,
        message: "User deleted successfully",
    });
});
