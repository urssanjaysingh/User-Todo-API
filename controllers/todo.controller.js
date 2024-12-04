const asyncHandler = require("express-async-handler");
const TODO_SCHEMA = require("../models/todos.model");
const { CustomError } = require("../utils/CustomError");

exports.addTodo = asyncHandler(async (req, res, next) => {
    try {
        let { task, description, lastDate } = req.body;

        if (!task || !description || !lastDate) {
            return next(
                new CustomError("Please provide all required fields", 400)
            );
        }

        let newTodo = await TODO_SCHEMA.create({
            task,
            description,
            lastDate,
            createdBy: req.user._id,
        });

        res.status(200).json({
            success: true,
            message: "New todo created successfully",
            data: newTodo,
        });
    } catch (error) {
        if (error.name === "CastError") {
            return next(new CustomError("Invalid data format provided", 400));
        }
        next(error);
    }
});

exports.fetchUserTodos = asyncHandler(async (req, res, next) => {
    try {
        let userTodos = await TODO_SCHEMA.find({ createdBy: req.user._id });
        if (userTodos.length === 0) {
            return next(new CustomError("No todo found", 404));
        }

        res.status(200).json({
            success: true,
            message: "User's todos fetched successfully",
            data: userTodos,
        });
    } catch (error) {
        if (error.name === "CastError") {
            return next(new CustomError("Invalid data format provided", 400));
        }
        next(error);
    }
});

exports.fetchSingleTodo = asyncHandler(async (req, res, next) => {
    try {
        let todo = await TODO_SCHEMA.findOne({
            _id: req.params.id,
            createdBy: req.user._id,
        });
        if (!todo) {
            return next(new CustomError("Todo not found", 404));
        }

        res.status(200).json({
            success: true,
            message: "Todo fetched successfully",
            data: todo,
        });
    } catch (error) {
        if (error.name === "CastError") {
            return next(new CustomError("Invalid data format provided", 400));
        }
        next(error);
    }
});

exports.updateTodo = asyncHandler(async (req, res, next) => {
    try {
        let { task, description } = req.body;

        let todo = await TODO_SCHEMA.findByIdAndUpdate(
            {
                _id: req.params.id,
                createdBy: req.user._id,
            },
            { $set: { task, description } },
            { new: true }
        );
        if (!todo) {
            return next(new CustomError("Todo not found", 404));
        }

        res.status(200).json({
            success: true,
            message: "Todo updated successfully",
            data: todo,
        });
    } catch (error) {
        if (error.name === "CastError") {
            return next(new CustomError("Invalid data format provided", 400));
        }
        next(error);
    }
});

exports.deleteTodo = asyncHandler(async (req, res, next) => {
    try {
        let todo = await TODO_SCHEMA.findByIdAndDelete({
            _id: req.params.id,
            createdBy: req.user._id,
        });
        if (!todo) {
            return next(new CustomError("Todo not found", 404));
        }

        res.status(200).json({
            success: true,
            message: "Todo deleted successfully",
        });
    } catch (error) {
        if (error.name === "CastError") {
            return next(new CustomError("Invalid data format provided", 400));
        }
        next(error);
    }
});

exports.updateTodoStatus = asyncHandler(async (req, res, next) => {
    try {
        const { status } = req.body;

        let todo = await TODO_SCHEMA.findByIdAndUpdate(
            {
                _id: req.params.id,
                createdBy: req.user._id,
            },
            { $set: { status } },
            { new: true, runValidators: true }
        );

        if (!todo) {
            return next(new CustomError("Todo not found", 404));
        }

        res.status(200).json({
            success: true,
            message: "Todo status updated successfully",
            data: todo,
        });
    } catch (error) {
        if (error.name === "ValidationError") {
            return next(new CustomError("Invalid status value", 400));
        } else if (error.name === "CastError") {
            return next(new CustomError("Invalid data format provided", 400));
        }
        next(error);
    }
});

exports.getTodosByStatus = asyncHandler(async (req, res, next) => {
    try {
        const { status } = req.query;

        const todos = await TODO_SCHEMA.find({
            status: status,
            createdBy: req.user._id,
        });

        if (todos.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No todos found with the given status.",
            });
        }

        res.status(200).json({
            success: true,
            message: "Todos filtered by status retrieved successfully.",
            data: todos,
        });
    } catch (error) {
        if (error.name === "CastError") {
            return next(new CustomError("Invalid data format provided", 400));
        }
        next(error);
    }
});

exports.fetchAllTodos = asyncHandler(async (req, res, next) => {
    try {
        let allTodos = await TODO_SCHEMA.find({});
        if (!allTodos.length === 0) {
            return next(new CustomError("No user found", 404));
        }

        res.status(200).json({
            success: true,
            message: "All todos found successfully",
            data: allTodos,
        });
    } catch (error) {
        next(error);
    }
});
