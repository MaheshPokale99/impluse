const mongoose=require("mongoose");
const { string } = require("zod");


const userSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true,
    },
    email:{
        type:String,
        unique:true,
    },
    password:String,
    role:{
        type:String,
        enum:["user","admin"],
        default:"user"
    }
})

module.exports = mongoose.model("User", userSchema); 