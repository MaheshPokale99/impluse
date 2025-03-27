const mongoose = require("mongoose");

const testSubmissionSchema = new mongoose.Schema({
    testName: {
        type: String,
        required: true
    },
    userEmail: {
        type: String,
        required: true
    },
    answers: [{
        question: { 
            type: String,  
            required: true
        },
        answer: [{
            type: String,  
            required: true
        }]
    }],
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    submittedAt: {
        type: Date,
        default: Date.now,
        index: { expires: "74h" }  
    },
});

const TestSubmission = mongoose.model("TestSubmission", testSubmissionSchema);
module.exports = TestSubmission;
