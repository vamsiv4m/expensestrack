const jwt = require("jsonwebtoken");
const UserSchema = require("../schemas/UserSchema");
const auth = async (req,res,next)=>{
    try{
       const token = req.cookies.token;
       const verifyToken = jwt.verify(token,process.env.SECRET_KEY);
       const userdata = await UserSchema.findOne({_id:verifyToken.userId});
       req.token = token;
       req.userdata = userdata;
       next();
    }catch(e){
        res.json({isAuthorized:false,message:e.message});
    } 
}
module.exports = auth;