const express=require("express");
const {uploadImages,getImages}=require("../controllers/imageController");
const {protect,isAdmin}=require("../middleware/authMiddleware");
const upload=require("../middleware/upload");

const router=express.Router();

// Upload Image
router.post("/upload",protect,isAdmin,upload.array("images",10),uploadImages);

// get all Images
router.get("/image",getImages);

module.exports=router;