const { verify } = require("jsonwebtoken");
const { JWT_SECRET } = require("../config");
const USER_SCHEMA = require("../models/users.model");
const { CustomError } = require("../utils/CustomError");
const asyncHandler = require("express-async-handler");

const authenticate = asyncHandler(async (req, res, next) => {
    try {
        let token = req.cookies.token;

        if (!token) {
            return next(new CustomError("Please login to access this", 402));
        }

        let decodedToken;
        try {
            decodedToken = verify(token, JWT_SECRET);
        } catch (error) {
            return next(new CustomError("Invalid Token", 401));
        }

        let findUser = await USER_SCHEMA.findOne({ _id: decodedToken.id });
        if (!findUser) {
            return next(new CustomError("User not found", 404));
        }

        req.user = findUser;

        next();
    } catch (error) {
        next(error);
    }
});

const authorize = asyncHandler(async (req, res, next) => {
    try {
        return req.user.role !== "admin"
            ? next(new CustomError("You're not authorized to access this"))
            : next();
    } catch (error) {
        next(error);
    }
});

module.exports = { authenticate, authorize };
