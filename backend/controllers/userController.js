const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const zod = require("zod");
const Otp = require("../models/Otp");
const nodemailer = require('nodemailer');


// Validation schemas using Zod
const signupSchema = zod.object({
    name: zod.string().nonempty(),
    email: zod.string().email(),
    password: zod.string().min(6),
});

const loginSchema = zod.object({
    email: zod.string().email(),
    password: zod.string().min(6),
});

// Register User
exports.registerUser = async (req, res) => {
    try {
        const parsed = signupSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ message: "Invalid input data", errors: parsed.error.issues });
        }

        const { name, email, password } = req.body;

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ error: "User with this email already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await User.create({ 
            name, 
            email, 
            password: hashedPassword,
            phone: "",  
            address: ""
        });

        const token = jwt.sign({ id: newUser.id }, process.env.JWT_SECRET, { expiresIn: "30d" });

        res.status(201).json({
            message: "Account created successfully",
            _id: newUser.id,
            name: newUser.name,
            email: newUser.email,
            token,
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Login User
exports.loginUser = async (req, res) => {
    try {
        const parsed = loginSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ message: "Invalid input data", errors: parsed.error.issues });
        }

        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({ message: "User does not exist", email });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ message: "Invalid Password" });
        }

        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: "30d" });

        res.status(200).json({
            message: "Login Successful",
            _id: user.id,
            name: user.name,
            email,
            token,
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};



// Get User Profile
exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user?._id).select("-password");

        if (!user) {
            return res.status(404).json({
                error: "User not found"
            });
        }

        res.status(200).json({
            message: "User profile retrieved successfully",
            user
        });
    } catch (error) {
        res.status(500).json({
            error: "Server Error",
            details: error.message
        });
    }
};

// Get All Users
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select("-password");

        if (users.length === 0) {
            return res.status(404).json({
                message: "No users found"
            });
        }

        res.status(200).json({
            message: "Users retrieved successfully",
            users
        });
    } catch (error) {
        res.status(500).json({
            error: "Server Error",
            details: error.message
        });
    }
};

//  get current logged user
exports.getCurrentUser = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password");
        res.json({
            user
        });
    }
    catch (error) {
        res.status(500).json({
            message: "Server error"
        });
    }
}

exports.sendOtp = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }

        const existingUser = await User.findOne({ email });
        if (!existingUser) {
            return res.status(404).json({ message: "User not found. Please sign up first." });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        await Otp.create({ email, otp });

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Your OTP Code',
            text: `Your OTP code is ${otp}`
        };

        await transporter.sendMail(mailOptions);

        res.status(200).json({
            message: "OTP sent to email successfully"
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to send OTP",
            error: error.message
        });
    }
};

exports.verifyUser = async (req, res) => {
    try {
        const { name, email, phone, address, otp } = req.body;
                
        if (!otp) {
            return res.status(400).json({
                message: "OTP is required"
            });
        }
        
        let formattedPhone = phone;
        if (!phone.startsWith('+')) {
            formattedPhone = `+${phone}`;
        }
        
        const existingotp = await Otp.findOne({ email, otp });
        
        if (!existingotp) {
            return res.status(400).json({
                message: "Invalid or expired OTP"
            });
        }

        await Otp.deleteMany({ email });

        const user = await User.findOne({ email });
        if (user) {
            user.name = name;
            user.email = email;
            user.address = address;
            user.phone = formattedPhone;
            user.isVerified = true;

            await user.save();
            
            return res.status(200).json({
                message: "User verified and updated successfully",
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    address:user.address,
                    isVerified: user.isVerified
                }
            });
        }
        else {
            return res.status(404).json({
                message: "User not found. Please sign up first."
            });
        }
    }
    catch (error) {
        res.status(500).json({ 
            message: "Internal Server Error",
            error: error.message
        });
    }
}


