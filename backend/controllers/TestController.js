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
        const name = user?.name;
        const phone = user?.phone;

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
            name,
            userId: req.user?._id,
            answers
        });

        const submissionLink = `${process.env.Frontend_URI}/test-submission/${submission._id}`;
        
        const adminEmail = process.env.Admin_Email || "";
        const adminEmails = adminEmail.includes(",") ? adminEmail.split(",") : [adminEmail];

        await sendCompletionEmail(user?.name, userEmail, test.title, submissionLink);
        await sendAdminEmail(user?.name, adminEmails, test.title, userEmail, phone, submissionLink);

        res.status(200).json({
            success: true,
            message: "Test completed. Confirmation email sent!",
            submissionId: submission._id,
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
        if (!email || !email.includes('@')) {
            console.error('Invalid email address:', email);
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

        const emailTemplate = `
            <div style="font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 650px; margin: 0 auto; padding: 25px; border-radius: 10px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); border-top: 5px solid #007bff;">
                <div style="text-align: center; margin-bottom: 20px;">
                    <h1 style="color: #007bff; margin-bottom: 5px;">🎉 Congratulations!</h1>
                    <p style="font-size: 18px; color: #555;">Your test has been successfully completed</p>
                </div>
                
                <div style="background-color: #f9f9f9; border-left: 4px solid #007bff; padding: 15px; margin: 20px 0; border-radius: 4px;">
                    <p style="margin: 0;">Hello <strong style="color: #007bff;">${name || 'Student'}</strong>,</p>
                </div>
                
                <p>We're excited to inform you that you have successfully completed the test:</p>
                <div style="background-color: #f0f7ff; padding: 15px; border-radius: 6px; margin: 15px 0;">
                    <h3 style="margin: 0; color: #0056b3; text-align: center;">${testTitle}</h3>
                </div>
                
                <p><strong>🔍 Next Steps:</strong></p>
                <ul style="background-color: #fafafa; padding: 15px 15px 15px 40px; border-radius: 6px;">
                    <li>Review your test submission</li>
                    <li>Connect with a mentor for feedback</li>
                    <li>Continue to the next learning module</li>
                </ul>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${submissionLink}" style="display: inline-block; background-color: #007bff; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; box-shadow: 0 3px 6px rgba(0,0,0,0.1); transition: all 0.3s;">📄 View Your Submission</a>
                </div>
                
                <div style="text-align: center; margin: 20px 0;">
                    <a href="${process.env.Frontend_URI}/verify" style="display: inline-block; background-color: #28a745; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; box-shadow: 0 3px 6px rgba(0,0,0,0.1); transition: all 0.3s;">✅ Complete Your Profile</a>
                </div>
                
                <div style="margin: 25px 0; padding: 15px; border-radius: 6px; background-color: #fff8e1; border-left: 4px solid #ffc107;">
                    <p style="margin: 0;"><strong>📢 What's Next?</strong></p>
                    <p style="margin: 10px 0 0 0;">One of our mentors will review your submission and connect with you within <strong>24 hours</strong> to provide personalized feedback and discuss your performance.</p>
                </div>
                
                <p>If you have any questions or need assistance, please feel free to reach out to our support team at <a href="mailto:${process.env.EMAIL_USER}" style="color: #007bff; text-decoration: none;">${process.env.EMAIL_USER}</a>.</p>
                
                <hr style="border: none; border-top: 1px solid #eee; margin: 25px 0;">
                
                <p style="text-align: center; color: #666; font-size: 14px;">Thank you for your participation, and we look forward to helping you on your learning journey! 🚀</p>
                
                <div style="text-align: center; margin-top: 20px;">
                    <p style="margin: 5px 0; color: #555;"><strong>The Impluse Team</strong></p>
                    <p style="margin: 5px 0; color: #777; font-size: 13px;">${formattedDate}</p>
                </div>
            </div>
        `;

        const mailOptions = {
            from: {
                name: 'Impluse Learning Team',
                address: process.env.EMAIL_USER
            },
            to: email,
            subject: "🎉 Congratulations! You've Successfully Completed Your Test",
            html: emailTemplate,
            headers: {
                'X-Priority': '1',
                'Importance': 'high'
            }
        };
        
        await transporter.sendMail(mailOptions);
        return true;
    }
    catch (error) {
        console.error("Error sending completion email:", {
            error: error.message,
            user: email,
            test: testTitle
        });
        return false;
    }
}

// send mail to admins
const sendAdminEmail = async (name, adminEmails, testTitle, userEmail, userPhone, submissionLink) => {
    try {
        if (!adminEmails || (Array.isArray(adminEmails) && adminEmails.length === 0) || 
            (typeof adminEmails === 'string' && !adminEmails.trim())) {
            console.log('No admin emails provided. Skipping admin notification.');
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

        // Get formatted date and time
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
            <div style="font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 650px; margin: 0 auto; padding: 25px; border-radius: 10px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); border-top: 5px solid #d9534f;">
                <div style="text-align: center; margin-bottom: 20px;">
                    <h1 style="color: #d9534f; margin-bottom: 5px;">📢 New Test Submission</h1>
                    <p style="font-size: 16px; color: #555;">Action required: Review and provide feedback</p>
                </div>
                
                <div style="background-color: #f9f9f9; border-left: 4px solid #d9534f; padding: 15px; margin: 20px 0; border-radius: 4px;">
                    <p style="margin: 0;">Hello <strong style="color: #d9534f;">Mentor</strong>,</p>
                </div>
                
                <p>A user has just completed a test. Here are the submission details:</p>
                
                <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 15px 0;">
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="padding: 8px 15px; border-bottom: 1px solid #eee; width: 40%;"><strong>User Name:</strong></td>
                            <td style="padding: 8px 15px; border-bottom: 1px solid #eee;">${name}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 15px; border-bottom: 1px solid #eee;"><strong>User Email:</strong></td>
                            <td style="padding: 8px 15px; border-bottom: 1px solid #eee;">
                                <a href="mailto:${userEmail}" style="color: #d9534f; text-decoration: none;">${userEmail}</a>
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 15px; border-bottom: 1px solid #eee;"><strong>User Phone:</strong></td>
                            <td style="padding: 8px 15px; border-bottom: 1px solid #eee;">
                                <a href="tel:${userPhone}" style="color: #d9534f; text-decoration: none;">${userPhone || 'Not provided'}</a>
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 15px; border-bottom: 1px solid #eee;"><strong>Test Title:</strong></td>
                            <td style="padding: 8px 15px; border-bottom: 1px solid #eee;">${testTitle}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 15px;"><strong>Submission Time:</strong></td>
                            <td style="padding: 8px 15px;">${formattedDate} at ${formattedTime}</td>
                        </tr>
                    </table>
                </div>
                
                <div style="margin: 25px 0; padding: 15px; border-radius: 8px; background-color: #f2dede; border-left: 4px solid #d9534f;">
                    <p style="margin: 0;"><strong>⏰ Required Action:</strong></p>
                    <p style="margin: 10px 0 0 0;">Please review this submission within <strong>24 hours</strong> and contact the user with feedback. The user has been notified to expect your response.</p>
                </div>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${submissionLink}" style="display: inline-block; background-color: #d9534f; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; box-shadow: 0 3px 6px rgba(0,0,0,0.1);">📄 Review Submission Now</a>
                </div>
                
                <hr style="border: none; border-top: 1px solid #eee; margin: 25px 0;">
                
                <p style="color: #777; font-size: 14px;">This is an automated notification. Please do not reply to this email. If you have any questions, please contact your system administrator.</p>
                
                <div style="text-align: center; margin-top: 20px;">
                    <p style="margin: 5px 0; color: #555;"><strong>The Impluse Team</strong></p>
                    <p style="margin: 5px 0; color: #777; font-size: 13px;">${formattedDate} at ${formattedTime}</p>
                </div>
            </div>
        `;

        const mailOptions = {
            from: {
                name: 'Impluse Test System',
                address: process.env.EMAIL_USER
            },
            to: recipients,
            subject: `📢 New Test Submission: ${testTitle} by ${name}`,
            html: emailTemplate,
            headers: {
                'X-Priority': '1',
                'Importance': 'high'
            }
        };
        
        await transporter.sendMail(mailOptions);
        return true;
    } 
    catch (error) {
        console.error("Error sending admin notification email:", {
            error: error.message,
            test: testTitle,
            user: userEmail
        });
        return false;
    }
};
