const express=require("express");
const{
    createTest,getAllTest,submitTest,getUserSubmissions,deleteTestSubmission,deleteTest,getTestSubmission
}=require("../controllers/TestController");
const {isAdmin,protect}=require("../middleware/authMiddleware");

const router=express.Router();


router.get("/all",protect,getAllTest);
router.get("/submissions",protect,getUserSubmissions);
router.get("/test-submission/:submissionId",getTestSubmission)

router.post("/create",protect,isAdmin,createTest);
router.post("/submit", protect, submitTest);

router.delete("/submission/delete",protect,deleteTestSubmission)
router.delete("/delete/:testId",protect,isAdmin,deleteTest);

module.exports=router;



