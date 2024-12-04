class CustomError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        if (statusCode >= 500) {
            this.status = "Error";
        } else if (statusCode >= 400) {
            this.status = "Failed";
        } else {
            this.status = "Success";
        }

        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = { CustomError };
