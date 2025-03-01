const express=require("express");
const {protect,isAdmin}=require("../middleware/authMiddleware");
const upload=require("../middleware/upload");
const {
    uploadImages,
    getImages,
    deleteImages
}=require("../controllers/imageController");


const router=express.Router();

// Upload Image
router.post("/upload",protect,isAdmin,upload.array("images",15),uploadImages);

// get all Images
router.get("/image",getImages);

// delete image
router.delete("/delete-image",protect,isAdmin,deleteImages)

module.exports=router;