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
            from: `"Impluse Mentorship" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Your One-Time Password (OTP)',
            html: `
                <div style="font-family: Arial, sans-serif; padding: 16px;">
                    <h2>Hi there 👋</h2>
                    <p>Here is your OTP code to verify your account for the mentorship program:</p>
                    <h1 style="background: #f4f4f4; padding: 10px; border-radius: 8px; display: inline-block;">${otp}</h1>
                    <p>This code is valid for 10 minutes. Do not share it with anyone.</p>
                    <br/>
                    <p>Thanks,<br/>The Impluse Team</p>
                </div>
            `
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


// verfiy user
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
            const adminEmail = process.env.Admin_Email || "";
            const adminEmails = adminEmail.includes(",") ? adminEmail.split(",") : [adminEmail];
            sendMentorshipRegistrationEmail(name,email,address,phone,adminEmails);
            sendUserMentorshipConfirmationEmail(name,email);
            
            return res.status(200).json({
                message: "Thank you! You have successfully registered for the mentorship program.",
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


// send message to admine
const sendMentorshipRegistrationEmail = async (name, email, address, phone, adminEmails) => {
    try {
        if (!adminEmails || (Array.isArray(adminEmails) && adminEmails.length === 0) ||
            (typeof adminEmails === 'string' && !adminEmails.trim())) {
            return false;
        }

        let recipients;
        if (Array.isArray(adminEmails)) {
            recipients = adminEmails.filter(email => email && email.trim()).join(',');
        } else {
            recipients = adminEmails.trim();
        }

        if (!recipients) {
            return false;
        }

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const formattedDate = new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        const formattedTime = new Date().toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });

        const emailTemplate = `
            <div style="font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 650px; margin: 0 auto; padding: 25px; border-radius: 10px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); border-top: 5px solid #5bc0de;">
                <div style="text-align: center; margin-bottom: 20px;">
                    <h1 style="color: ##5959ff; margin-bottom: 5px;">👥 New Mentorship Registration</h1>
                    <p style="font-size: 16px; color: #555;">A new user has registered for mentorship</p>
                </div>

                <div style="background-color: #f9f9f9; border-left: 4px solid ##5959ff; padding: 15px; margin: 20px 0; border-radius: 4px;">
                    <p style="margin: 0;">Hello <strong style="color: ##5959ff;">Admin</strong>,</p>
                </div>

                <p>A new user has signed up for mentorship. Below are the details:</p>

                <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 15px 0;">
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="padding: 8px 15px; border-bottom: 1px solid #eee; width: 40%;"><strong>Name:</strong></td>
                            <td style="padding: 8px 15px; border-bottom: 1px solid #eee;">${name}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 15px; border-bottom: 1px solid #eee;"><strong>Email:</strong></td>
                            <td style="padding: 8px 15px; border-bottom: 1px solid #eee;">
                                <a href="mailto:${email}" style="color: #5959ff; text-decoration: none;">${email}</a>
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 15px; border-bottom: 1px solid #eee;"><strong>Phone:</strong></td>
                            <td style="padding: 8px 15px; border-bottom: 1px solid #eee;">
                                <a href="tel:${phone}" style="color: #5959ff; text-decoration: none;">${phone || 'Not provided'}</a>
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 15px;"><strong>Address:</strong></td>
                            <td style="padding: 8px 15px;">${address || 'Not provided'}</td>
                        </tr>
                    </table>
                </div>

                <div style="margin: 25px 0; padding: 15px; border-radius: 8px; background-color: #d9edf7; border-left: 4px solid #5bc0de;">
                    <p style="margin: 0;"><strong>🎯 Next Steps:</strong></p>
                    <p style="margin: 10px 0 0 0;">Please review the user information and assign an appropriate mentor or contact them for further steps.</p>
                </div>

                <hr style="border: none; border-top: 1px solid #eee; margin: 25px 0;">

                <p style="color: #777; font-size: 14px;">This is an automated email. Please do not reply. For queries, contact your platform administrator.</p>

                <div style="text-align: center; margin-top: 20px;">
                    <p style="margin: 5px 0; color: #555;"><strong>The Impluse Team</strong></p>
                    <p style="margin: 5px 0; color: #777; font-size: 13px;">${formattedDate} at ${formattedTime}</p>
                </div>
            </div>
        `;

        const mailOptions = {
            from: {
                name: 'Impluse Mentorship System',
                address: process.env.EMAIL_USER
            },
            to: recipients,
            subject: `👥 New Mentorship Registration: ${name}`,
            html: emailTemplate,
            headers: {
                'X-Priority': '1',
                'Importance': 'high'
            }
        };

        await transporter.sendMail(mailOptions);
        return true;

    } catch (error) {
        console.error("Error sending mentorship registration email:", {
            error: error.message,
            user: email
        });
        return false;
    }
};

// send message for user
const sendUserMentorshipConfirmationEmail = async (name, email) => {
    try {
        if (!email || !email.trim()) {
            return false;
        }

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const formattedDate = new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        const formattedTime = new Date().toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });

        const emailTemplate = `
            <div style="font-family: 'Segoe UI', Arial, sans-serif; color: #333; padding: 25px; max-width: 600px; margin: 0 auto; border-radius: 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); border-left: 5px solid #5cb85c;">
                <h2 style="color: #5cb85c;">🎉 Mentorship Registration Successful!</h2>
                <p>Hi <strong>${name}</strong>,</p>
                <p>Thank you for registering for the mentorship program on <strong>Impluse</strong>! We're excited to support your journey and connect you with the right mentors.</p>
                <p>Our team will review your registration and match you with a suitable mentor soon. You’ll receive further updates via email.</p>

                <div style="margin: 20px 0; padding: 15px; background-color: #eafaf1; border-left: 4px solid #5cb85c; border-radius: 6px;">
                    <p style="margin: 0;"><strong>📅 Registered on:</strong> ${formattedDate} at ${formattedTime}</p>
                </div>

                <p>Best regards,<br><strong>The Impluse Team</strong></p>

                <hr style="margin-top: 30px; border: none; border-top: 1px solid #eee;">
                <p style="font-size: 13px; color: #777;">This is an automated email. Please do not reply directly.</p>
            </div>
        `;

        const mailOptions = {
            from: {
                name: 'Impluse Mentorship',
                address: process.env.EMAIL_USER
            },
            to: email,
            subject: '✅ Mentorship Registration Confirmed!',
            html: emailTemplate
        };

        await transporter.sendMail(mailOptions);
        return true;
    } catch (error) {
        console.error("Error sending user confirmation email:", error.message);
        return false;
    }
};