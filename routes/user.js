const express=require("express");
const router=express.Router();

const{createUser, handleUserLogin}=require("../controllers/user")



router.post("/",createUser)
router.post("/login",handleUserLogin)
module.exports=router;