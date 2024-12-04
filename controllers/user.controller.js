const USER_SCHEMA = require("../models/users.model");
const { CustomError } = require("../utils/CustomError");
const asyncHandler = require("express-async-handler");
const { genToken } = require("../utils/jwt");
const { uploadOnCloudinary, deleteAvatar } = require("../utils/cloudinary");
const {
    sendWelcomeEmail,
    sendForgotPasswordEmail,
} = require("../utils/nodemailer");

exports.registerUser = asyncHandler(async (req, res, next) => {
    try {
        let { name, email, password, role } = req.body;

        let userAvatar = await uploadOnCloudinary(req?.file?.path);

        if (!name || !email || !password) {
            return next(
                new CustomError("Please provide all required fields", 400)
            );
        }

        let existingUserWithEmail = await USER_SCHEMA.findOne({ email });

        if (existingUserWithEmail) {
            return next(
                new CustomError("This email already registered with us.", 409)
            );
        }

        const newUser = await USER_SCHEMA.create({
            name,
            email,
            password,
            role,
            avatar:
                userAvatar?.url ||
                "https://robohash.org/mail@ashallendesign.co.uk",
        });

        await sendWelcomeEmail(email);

        res.status(201).json({
            success: true,
            message: "New user created successfully",
            data: newUser,
        });
    } catch (error) {
        if (error.name === "ValidationError") {
            return next(new CustomError("Invalid values provided", 400));
        }
        next(error);
    }
});

exports.loginUser = asyncHandler(async (req, res, next) => {
    try {
        let { email, password } = req.body;

        let findUser = await USER_SCHEMA.findOne({ email });
        if (!findUser) {
            return next(new CustomError("User not registered", 404));
        }

        let matchPassword = await findUser.comparePassword(password);
        if (!matchPassword) {
            return next(new CustomError("Wrong creadentials", 402));
        }

        let token = genToken(findUser._id);

        res.cookie("token", token, {
            httpOnly: true,
            maxAge: 1 * 24 * 60 * 60 * 1000,
        });

        res.status(200).json({
            success: true,
            message: "User logged-in successfully",
            token,
        });
    } catch (error) {
        if (error.name === "ValidationError") {
            return next(new CustomError("Invalid values provided", 400));
        } else if (error.name === "CastError") {
            return next(new CustomError("Invalid data format provided", 400));
        }
        next(error);
    }
});

exports.forgotPassword = asyncHandler(async (req, res, next) => {
    try {
        const { email } = req.body;

        if (!email) {
            return next(
                new CustomError("Please provide a valid email address", 400)
            );
        }

        const user = await USER_SCHEMA.findOne({ email });
        if (!user) {
            return next(
                new CustomError("No user found with this email address", 404)
            );
        }

        const tempPassword = Math.random().toString(36).substring(2, 10);

        user.password = tempPassword;
        await user.save();

        await sendForgotPasswordEmail(email, tempPassword);

        res.status(200).json({
            success: true,
            message: "Temporary password has been sent to your email",
        });
    } catch (error) {
        if (error.name === "ValidationError") {
            return next(new CustomError("Invalid values provided", 400));
        }
        next(error);
    }
});

exports.logoutUser = asyncHandler(async (req, res, next) => {
    try {
        res.clearCookie("token");

        res.status(200).json({
            success: false,
            message: "User logged-out successfully",
        });
    } catch (error) {
        next(error);
    }
});

exports.fetchUserProfile = asyncHandler(async (req, res, next) => {
    try {
        let findUser = await USER_SCHEMA.findOne({ _id: req.user._id });
        if (!findUser) {
            return next(new CustomError("User not found", 404));
        }

        res.status(200).json({
            success: true,
            message: "User profile fetched successfully",
            data: findUser,
        });
    } catch (error) {
        if (error.name === "CastError") {
            return next(new CustomError("Invalid data format provided", 400));
        }
        next(error);
    }
});

exports.updateUserProfile = asyncHandler(async (req, res, next) => {
    try {
        let { name, email } = req.body;

        const existingUser = await USER_SCHEMA.findOne({
            email,
            _id: { $ne: req.user._id },
        });

        if (existingUser) {
            return next(new CustomError("Email already in use", 400));
        }

        let userProfile = await USER_SCHEMA.findByIdAndUpdate(
            { _id: req.user._id },
            { $set: { name, email } },
            { new: true }
        );

        if (!userProfile) {
            return next(new CustomError("User not found", 404));
        }

        res.status(200).json({
            success: true,
            message: "User profile updated successfully",
            data: userProfile,
        });
    } catch (error) {
        if (error.name === "ValidationError") {
            return next(new CustomError("Invalid values provided", 400));
        } else if (error.name === "CastError") {
            return next(new CustomError("Invalid data format provided", 400));
        }
        next(error);
    }
});

exports.updateUserPassword = asyncHandler(async (req, res, next) => {
    try {
        let { oldPassword, newPassword } = req.body;

        if (!oldPassword || !newPassword) {
            return next(
                new CustomError("Please provide both old and new password", 400)
            );
        }

        let findUser = await USER_SCHEMA.findOne({ _id: req.user._id });
        if (!findUser) {
            return next(new CustomError("User not found", 404));
        }

        let matchPassword = await findUser.comparePassword(oldPassword);
        if (!matchPassword) {
            return next(new CustomError("Wrong old password", 402));
        }

        findUser.password = newPassword;
        await findUser.save();

        res.status(200).json({
            success: true,
            message: "User password updated successfully",
        });
    } catch (error) {
        if (error.name === "CastError") {
            return next(new CustomError("Invalid data format provided", 400));
        }
        next(error);
    }
});

exports.deleteUserProfile = asyncHandler(async (req, res, next) => {
    try {
        let deleteUser = await USER_SCHEMA.findByIdAndDelete({
            _id: req.user._id,
        });
        if (!deleteUser) {
            return next(new CustomError("User not found", 404));
        }

        res.status(200).json({
            success: true,
            message: "User profile deleted successfully",
        });
    } catch (error) {
        if (error.name === "CastError") {
            return next(new CustomError("Invalid data format provided", 400));
        }
        next(error);
    }
});

exports.updateProfilePicture = asyncHandler(async (req, res, next) => {
    try {
        const userId = req.user._id;
        const findUser = await USER_SCHEMA.findById(userId);

        if (!findUser) throw next(new ErrorHandler(404, "User not found"));

        const isDefaultAvatar =
            findUser.avatar ===
            "https://robohash.org/mail@ashallendesign.co.uk";

        if (!isDefaultAvatar && findUser.avatar) {
            // Extract the public ID of the existing avatar
            const publicID = findUser.avatar.split("/").pop().split(".")[0];
            console.log(`Deleting existing avatar with public ID: ${publicID}`);

            const response = await deleteAvatar(publicID);
            console.log("Cloudinary deletion response:", response);
        }

        const newAvatarPath = req?.file?.path;
        const uploadedPath = await uploadOnCloudinary(newAvatarPath);

        findUser.avatar = uploadedPath?.url;
        await findUser.save();

        res.status(200).json({
            success: true,
            message: "Profile picture updated successfully",
            data: findUser,
        });
    } catch (error) {
        if (error.name === "CastError") {
            return next(new CustomError("Invalid data format provided", 400));
        }
        next(error);
    }
});

exports.removeProfilePicture = asyncHandler(async (req, res, next) => {
    try {
        const id = req.user.id;
        const findUser = await USER_SCHEMA.findById(id);

        if (!findUser) return next(new ErrorHandler(404, "User not found"));

        const isDefaultAvatar =
            findUser.avatar ===
            "https://robohash.org/mail@ashallendesign.co.uk";

        if (!isDefaultAvatar && findUser.avatar) {
            const publicID = findUser.avatar.split("/").pop().split(".")[0];
            await deleteAvatar(publicID);
        }

        findUser.avatar = "https://robohash.org/mail@ashallendesign.co.uk";
        await findUser.save();

        res.status(200).json({
            success: true,
            message: "Profile picture removed successfully",
            data: findUser,
        });
    } catch (error) {
        if (error.name === "CastError") {
            return next(new CustomError("Invalid data format provided", 400));
        }
        next(error);
    }
});

exports.fetchAllUsers = asyncHandler(async (req, res, next) => {
    try {
        let allUsers = await USER_SCHEMA.find({});
        if (allUsers.length === 0) {
            return next(new CustomError("No user found", 404));
        }

        res.status(200).json({
            success: true,
            message: "All users fetched successfully",
            data: allUsers,
        });
    } catch (error) {
        next(error);
    }
});

exports.fetchSingleUser = asyncHandler(async (req, res, next) => {
    try {
        let findUser = await USER_SCHEMA.findOne({ _id: req.params.id });
        if (!findUser) {
            return next(new CustomError("User not found", 404));
        }

        res.status(200).json({
            success: true,
            message: "User details fetched successfully",
            data: findUser,
        });
    } catch (error) {
        if (error.name === "CastError") {
            return next(new CustomError("Invalid data format provided", 400));
        }
        next(error);
    }
});

exports.updateUserRole = asyncHandler(async (req, res, next) => {
    try {
        let { role } = req.body;

        let findUser = await USER_SCHEMA.findByIdAndUpdate(
            { _id: req.params.id },
            { $set: { role } },
            { new: true, runValidators: true }
        );

        if (!findUser) {
            return next(new CustomError("User not found", 404));
        }

        res.status(200).json({
            success: true,
            message: "User role updated successfully",
            data: findUser,
        });
    } catch (error) {
        if (error.name === "ValidationError") {
            return next(new CustomError("Invalid role value", 400));
        } else if (error.name === "CastError") {
            return next(new CustomError("Invalid data format provided", 400));
        }
        next(error);
    }
});

exports.deleteUser = asyncHandler(async (req, res, next) => {
    try {
        let findUser = await USER_SCHEMA.findByIdAndDelete({
            _id: req.params.id,
        });
        if (!findUser) {
            return next(new CustomError("User not found", 404));
        }

        res.status(200).json({
            success: true,
            message: "User deletes successfully",
        });
    } catch (error) {
        if (error.name === "CastError") {
            return next(new CustomError("Invalid data format provided", 400));
        }
        next(error);
    }
});
