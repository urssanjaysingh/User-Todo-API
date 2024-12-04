const express = require("express");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const { connectDB } = require("./config/db");
const { PORT } = require("./config");
const { ErrorHandler } = require("./middlewares/error.middleware");
const userRoutes = require("./routers/user.router");
const todoRoutes = require("./routers/todo.router");

connectDB();

const app = express();

app.use(express.json());
app.use(morgan("dev"));
app.use(cookieParser());

app.get("/", (req, res) => {
    res.send(`
        Welcome to the User Todo API! Here are the available routes:

        **User Routes:**
        - POST /users/register: Register a new user
        - POST /users/login: Log in a user
        - DELETE /users/logout: Log out a user
        - POST /users/forgot-password: Request a password reset
        - GET /users/profile: Fetch user profile
        - PATCH /users/update-profile: Update user profile
        - PATCH /users/update-password: Update user password
        - DELETE /users/delete-profile: Delete user profile
        - PATCH /users/remove-profile-picture: Remove profile picture
        - PATCH /users/update-profile-picture: Update profile picture
        - GET /users/all: Fetch all users (admin only)
        - GET /users/:id: Fetch a single user (admin only)
        - PATCH /users/:id: Update user role (admin only)
        - DELETE /users/:id: Delete a user (admin only)

        **Todo Routes:**
        - POST /todos/add: Add a new todo
        - GET /todos/user-todos: Fetch all todos of the authenticated user
        - PATCH /todos/update-todo-status/:id: Update the status of a todo
        - GET /todos/filter-todo: Get todos by status (admin only)
        - GET /todos/all: Fetch all todos (admin only)
        - GET /todos/:id: Fetch a single todo
        - PATCH /todos/:id: Update a todo
        - DELETE /todos/:id: Delete a todo

        Explore these routes to manage users and todos effectively.
    `);
});

app.use("/users", userRoutes);
app.use("/todos", todoRoutes);

app.use(ErrorHandler);

app.listen(PORT, (error) => {
    if (error) console.log("Error while starting server", error);
    console.log(`Server running on port: ${PORT}`);
});
