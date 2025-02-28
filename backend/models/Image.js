const mongoose = require("mongoose");


const imageSchema = new mongoose.Schema({
    url: String,
    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    title: {
        type: String,
        default: "Untitled"
    },
    description: {
        type: String,
        default: "No description"
    },
    tags: {
        type: [String],
        default: []
    },
    createdAt: {
        type: Date,
        default: Date.now(),
    }
})

const Image = mongoose.model("Image", imageSchema);
module.exports = Image;