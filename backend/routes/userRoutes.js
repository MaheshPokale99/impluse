const express = require("express");
const {
    registerUser,
    loginUser,
    getProfile, 
    getAllUsers,
    getCurrentUser,
    sendOtp,
    verifyUser
} = require("../controllers/userController");
const { protect, isAdmin } = require("../middleware/authMiddleware");

const router = express.Router();


router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/send-otp",protect,sendOtp);
router.put("/verify",protect,verifyUser);


// user profile

router.get("/profile",protect,getProfile);
router.get("/users",protect,isAdmin,getAllUsers);
router.get("/me",protect,getCurrentUser);


module.exports = router;


