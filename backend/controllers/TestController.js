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

        await sendCompletionEmail(userEmail, test.title, submissionLink);
        await sendAdminEmail(adminEmails, test.title, userEmail, submissionLink);


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
const sendCompletionEmail = async (email, testTitle, submissionLink) => {
    try {
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Test Completed Successfully",
            html: `<p>Hello,</p>
                   <p>You have successfully completed the test: <strong>${testTitle}</strong>.</p>
                   <p>You can view your test submission here: <a href="${submissionLink}">View Test Submission</a></p>
                   <p>Thank you for your participation!</p>`,
        };

        await transporter.sendMail(mailOptions);
    }
    catch (error) {
        console.error("Error sending email to user:", error);
    }
}

// send mail to admins
const sendAdminEmail = async (adminEmails, testTitle, userEmail, submissionLink) => {
    try {
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: adminEmails.join(","),
            subject: "New Test Submission",
            html: `<p>Hello Admin,</p>
                   <p>User <strong>${userEmail}</strong> has completed the test: <strong>${testTitle}</strong>.</p>
                   <p>View submission: <a href="${submissionLink}">View Submission</a></p>`
        };

        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error("Error sending email to admin:", error);
    }
};