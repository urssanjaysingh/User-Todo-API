const moment = require("moment");
const { Schema, model } = require("mongoose");

const todoSchema = new Schema(
    {
        task: {
            type: String,
            trim: true,
            required: true,
        },
        description: {
            type: String,
            trim: true,
            required: true,
        },
        status: {
            type: String,
            enum: ["pending", "completed"],
            default: "pending",
            trim: true,
            lowercase: true,
        },
        lastDate: {
            type: Date,
            set: function (Date) {
                return moment(Date, "DD/MM/YYYY", true).toDate();
            },
            required: true,
        },
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
    },
    { timestamps: true }
);

module.exports = model("Todo", todoSchema);
