const nodemailer = require("nodemailer");
const Test = require("../models/Test");
const TestSubmission = require("../models/TestSubmissions");
const User = require("../models/User")

// create test
exports.createTest = async (req, res) => {
    try {

        if (req.user.role !== "admin") {
            return res.status(403).json({
                success: false,
                message: "Unauthorized"
            });
        }
        const { title, description, questions } = req.body;

        if (!title.trim() || !description.trim() || !Array.isArray(questions) || questions.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Title, Description and questions are required!"
            });
        }

        for (const question of questions) {
            if (!question.question.trim() || !Array.isArray(question.options) || question.options.length < 1) {
                return res.status(400).json({
                    success: false,
                    message: "Each question must have text and at least one valid option!"
                });
            }
        }

        const test = new Test({
            title: title.trim(),
            description: description.trim(),
            questions,
        });

        await test.save();

        res.status(201).json({
            message: "Test created successfully",
            test: test
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

// get all test
exports.getAllTest = async (req, res) => {
    try {
        const tests = await Test.find();

        if (tests.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No tests found"
            });
        }

        res.status(200).json({
            success: true,
            tests
        })
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

// delte test by admin only
exports.deleteTest = async (req, res) => {
    try {
        const { testId } = req.params;

        const deletedTest = await Test.findByIdAndDelete(testId);

        if (!deletedTest) {
            return res.status(404).json({
                success: false,
                message: "Test not found",
            });
        }


        res.status(200).json({
            success: true,
            message: "Test deleted successfully",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message,
        });
    }
};

// test submited by user
exports.submitTest = async (req, res) => {
    try {
        const { testName, answers } = req.body;

        if (!testName || !answers || answers.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields"
            });
        }

        const user = await User.findById(req.user?._id)
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized: User not found",
            });
        }

        const userEmail = user?.email;

        const test = await Test.findOne({ title: testName });
        if (!test) {
            return res.status(404).json({
                success: false,
                message: "Test not found",
            });
        }

        const submission = await TestSubmission.create({
            testName,
            userEmail,
            userId:req.user?._id,
            answers
        });

        const submissionLink = `${process.env.Frontend_URI}/test-submission/${submission._id}`;
        const adminEmails = process.env.Admin_Email ? process.env.Admin_Email.split(",") : [];

        await sendCompletionEmail(user?.name,userEmail, test.title, submissionLink);
        await sendAdminEmail(user?.name, adminEmails, test.title, userEmail, submissionLink);


        res.status(200).json({
            success: true,
            message: "Test completed. Confirmation email sent!",
            submissionId:submission._id,
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// get testsubmision by id
exports.getTestSubmission = async (req, res) => {
    try {
        const { submissionId } = req.params;
        const submission = await TestSubmission.findById(submissionId);
        
        if (!submission) {
            return res.status(404).json({ 
                success: false,
                 message: "Submission not found" 
            });
        }

        res.status(200).json({ 
            success: true, 
            submission,
            
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
};


// user submission all
exports.getUserSubmissions = async (req, res) => {
    try {
        const { userId } = req.query;
        if (!userId) {
            return res.status(400).json({
                success: false,
                message: "User ID is required"
            });
        }

        const submission = await TestSubmission.find({ userId }).populate("testId");

        res.status(200).json({
            success: true,
            submission
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// user can delte submission
exports.deleteTestSubmission = async (req, res) => {
    try {
        const { submissionId, userId } = req.body;

        const submission = await TestSubmission.findOne({ _id: submissionId, userId });
        if (!submission) {
            return res.status(404).json({
                success: false,
                message: "Test submission not found"
            });
        }

        await TestSubmission.deleteOne({ _id: submissionId });

        res.status(200).json({
            success: true,
            message: "Test submission deleted successfully"
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}


// send mail to user
const sendCompletionEmail = async (name, email, testTitle, submissionLink) => {
    try {
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: "🎉 Congratulations! You've Successfully Completed Your Test",
            html: `
                <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; padding: 20px; max-width: 600px; border: 1px solid #ddd; border-radius: 8px; box-shadow: 2px 2px 10px rgba(0,0,0,0.1);">
                    <h2 style="color: #007bff;">🎉 Congratulations on Completing Your Test!</h2>
                    <p>Hello <strong>${name}</strong>,</p>
                    <p>We’re excited to inform you that you have successfully completed the test: <strong>${testTitle}</strong>.</p>
                    
                    <p>🔍 You can review your submission by clicking the link below:</p>
                    <p style="text-align: center; margin: 20px 0;">
                        <a href="${submissionLink}" style="background-color: #007bff; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px; font-weight: bold;">📄 View Test Submission</a>
                    </p>
                    
                    <p>📢 <strong>What’s Next?</strong>
                    <p>One of our mentors will review your submission and connect with you within the <strong>24 hours</strong> to provide feedback and discuss your performance.</p>
                    
                    <p>📩 <strong>Have Questions?</strong> Feel free to reach out to us if you need any assistance.</p>
                    
                    <p>Thank you for your participation, and we look forward to helping you on your learning journey! 🚀</p>
                    
                    <p>Best Regards,</p>
                    <p><strong>The Impluse Team</strong></p>
                </div>
            `
        };
        

        await transporter.sendMail(mailOptions);
    }
    catch (error) {
        console.error("Error sending email to user:", error);
    }
}

// send mail to admins
const sendAdminEmail = async (name, adminEmails, testTitle, userEmail, submissionLink) => {
    try {
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: adminEmails.join(","),  
            subject: "📢 New Test Submission Alert",
            html: `
                <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; padding: 20px; max-width: 600px; border: 1px solid #ddd; border-radius: 8px; box-shadow: 2px 2px 10px rgba(0,0,0,0.1);">
                    <h2 style="color: #d9534f;">🚀 New Test Submission</h2>
                    <p>Hello Mentor,</p>
                    <p>A user has just completed a test. Here are the details:</p>
        
                    <ul>
                        <li><strong>User Email:</strong> ${userEmail}</li>
                        <li><strong>User Email:</strong> ${name}</li>
                        <li><strong>Test Title:</strong> ${testTitle}</li>
                        <li><strong>Submission Time:</strong> ${new Date().toLocaleString()}</li>
                    </ul>
        
                    <p>📌 You can review the submission using the link below:</p>
                    <p style="text-align: center; margin: 20px 0;">
                        <a href="${submissionLink}" style="background-color: #d9534f; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px; font-weight: bold;">📄 View Submission</a>
                    </p>
        
                    <p>📢 Please review the submission at your earliest convenience.</p>
        
                    <p>Best Regards,</p>
                    <p><strong>The Impluse Team</strong></p>
                </div>
            `
        };
        

        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error("Error sending email to admin:", error);
    }
};