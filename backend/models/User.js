const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        unique: true,
        required:true,
    },
    phone:{
        type:String,
        require:true
    },
    address:{
        type:String,
        require:true
    },
    password:{
        type:String,
        required:true
    },
    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user"
    },
    isVerified: {
        type: Boolean,
        default: false,
    }
})

module.exports = mongoose.model("User", userSchema); 