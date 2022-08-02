const jwt = require("jsonwebtoken");
const UserSchema = require("../schemas/UserSchema");
const auth = async (req,res,next)=>{
    try{
       const token = req.cookies.jwt;
       console.log("line 6 ",token);
       const verifyToken = jwt.verify(token,process.env.SECRET_KEY);
       console.log(process.env.SECRET_KEY);
       console.log("line 8",verifyToken+"");
       const userdata = await UserSchema.findOne({_id:verifyToken.userId});
       console.log(userdata);
       next();
       return res.json({userId:userdata._id,username:userdata.username,email:userdata.email,isAuthorized:true});
    }catch(e){
        res.json({isAuthorized:false,message:e.message});
    }
}
module.exports = auth;