const { Schema, model } = require("mongoose");
const { genSalt, hash, compare } = require("bcrypt");

const userSchema = new Schema(
    {
        avatar: {
            type: String,
            default: "https://robohash.org/mail@ashallendesign.co.uk",
        },
        name: {
            type: String,
            trim: true,
            required: true,
        },
        email: {
            type: String,
            trim: true,
            required: true,
            lowercase: true,
            unique: true,
        },
        password: {
            type: String,
            trim: true,
            required: true,
        },
        role: {
            type: String,
            enum: ["user", "admin"],
            default: "user",
            lowercase: true,
        },
    },
    { timestamps: true }
);

userSchema.pre("save", async function (next) {
    if (this.isModified("password")) {
        let salt = await genSalt(10);
        let hashedPassword = await hash(this.password, salt);
        this.password = hashedPassword;
    }
    next();
});

userSchema.methods.comparePassword = async function (enteredPassword) {
    return compare(enteredPassword, this.password);
};

module.exports = model("User", userSchema);
