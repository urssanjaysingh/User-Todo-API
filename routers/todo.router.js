const Router = require("express");
const { authenticate, authorize } = require("../middlewares/auth.middleware");
const {
    addTodo,
    fetchUserTodos,
    fetchSingleTodo,
    updateTodo,
    deleteTodo,
    fetchAllTodos,
    updateTodoStatus,
    getTodosByStatus,
} = require("../controllers/todo.controller");

const router = Router();

router.post("/add", authenticate, addTodo);
router.get("/user-todos", authenticate, fetchUserTodos);
router.patch("/update-todo-status/:id", authenticate, updateTodoStatus);

router.get("/filter-todo", authenticate, authorize, getTodosByStatus);
router.get("/all", authenticate, authorize, fetchAllTodos);

router.get("/:id", authenticate, fetchSingleTodo);
router.patch("/:id", authenticate, updateTodo);
router.delete("/:id", authenticate, deleteTodo);

module.exports = router;
