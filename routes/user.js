const express=require("express");
const router=express.Router();

const multer = require('multer');

const storage = multer.memoryStorage(); // Use memory storage for handling files as Buffers

const upload = multer({ storage: storage });

const{createUser, handleUserLogin, handleupload, handlerecords}=require("../controllers/user")



router.post("/",createUser)
router.post("/login",handleUserLogin)
router.get("/video/:userId",handlerecords)
router.post("/upload",upload.single('video'),handleupload)
module.exports=router;