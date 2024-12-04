const { sign } = require("jsonwebtoken");
const { JWT_SECRET } = require("../config");

const genToken = (id) => {
    return sign({ id }, JWT_SECRET, {
        expiresIn: "1d",
    });
};

module.exports = { genToken };
