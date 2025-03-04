const express = require("express");
const {
    registerUser,
    loginUser,
    getProfile, 
    getAllUsers,
    getCurrentUser,
} = require("../controllers/userController");
const { protect, isAdmin } = require("../middleware/authMiddleware");

const router = express.Router();

// signup and login
router.post("/register", registerUser);
router.post("/login", loginUser);

// user profile

router.get("/profile",protect,getProfile);
router.get("/users",protect,isAdmin,getAllUsers);
router.get("/me",protect,getCurrentUser);


module.exports = router;


