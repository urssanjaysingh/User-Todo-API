const Router = require("express");
const {
    registerUser,
    loginUser,
    logoutUser,
    fetchUserProfile,
    updateUserProfile,
    updateUserPassword,
    deleteUserProfile,
    removeProfilePicture,
    updateProfilePicture,
    fetchAllUsers,
    fetchSingleUser,
    updateUserRole,
    deleteUser,
    forgotPassword,
} = require("../controllers/user.controller");
const { authenticate, authorize } = require("../middlewares/auth.middleware");
const { upload } = require("../middlewares/multer.middleware");

const router = Router();

router.post("/register", upload.single("avatar"), registerUser);
router.post("/login", loginUser);
router.delete("/logout", logoutUser);
router.post("/forgot-password", forgotPassword);

router.get("/profile", authenticate, fetchUserProfile);
router.patch("/update-profile", authenticate, updateUserProfile);
router.patch("/update-password", authenticate, updateUserPassword);
router.delete("/delete-profile", authenticate, deleteUserProfile);
router.patch("/remove-profile-picture", authenticate, removeProfilePicture);
router.patch(
    "/update-profile-picture",
    authenticate,
    upload.single("avatar"),
    updateProfilePicture
);

router.get("/all", authenticate, authorize, fetchAllUsers);
router.get("/:id", authenticate, authorize, fetchSingleUser);
router.patch("/:id", authenticate, authorize, updateUserRole);
router.delete("/:id", authenticate, authorize, deleteUser);

module.exports = router;
