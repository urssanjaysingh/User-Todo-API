const express = require("express");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const { connectDB } = require("./config/db");
const { PORT } = require("./config");
const { ErrorHandler } = require("./middlewares/error.middleware");
const userRoutes = require("./routers/user.router");
const todoRoutes = require("./routers/todo.router");

connectDB();

const app = express();

app.use(cors());

app.use(express.static("public"));

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/public/welcome.html");
});

app.use(express.json());
app.use(morgan("dev"));
app.use(cookieParser());

app.use("/users", userRoutes);
app.use("/todos", todoRoutes);

app.use(ErrorHandler);

app.listen(PORT, (error) => {
    if (error) console.log("Error while starting server", error);
    console.log(`Server running on port: ${PORT}`);
});
