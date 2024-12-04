const { CustomError } = require("../utils/CustomError");

const ErrorHandler = (err, req, res, next) => {
    if (err instanceof CustomError) {
        return res.status(err.statusCode).json({
            sucess: false,
            status: err.status,
            message: err.message,
            error: {
                name: err.name,
                message: err.message,
                stack: err.stack,
            },
        });
    }

    return res.status(500).json({
        sucess: false,
        status: "Error",
        message: "Internal Server Error",
        error: {
            name: err.name,
            message: err.message,
            stack: err.stack,
        },
    });
};

module.exports = { ErrorHandler };
