const User = require("../models/User");
const bcrypt = require("bcrypt");
const mailSender = require("../utils/mailSender");
const crypto = require("crypto");

//resetPasswordToken
exports.resetPasswordToken = async (req, res) => {
   try{
        //get email req body
        const email = req.body.email;

        //check user for this email , validation
        const user = await User.findOne({email: email});
        if(!user){
            return res.json({
                success : false,
                message: `This Email: ${email} is not Registered With Us Enter a Valid Email `,
            });
        }
    
        //genrate token
        const token = crypto.randomBytes(20).toString("hex");;
        console.log("cryptoToken : ",token);
        //update user by adding token & expiration time
        const updatedDetails = await User.findOneAndUpdate(
                                        {email: email},
                                        {
                                            token:token,
                                            resetPasswordExpires: Date.now() + 5*60*1000,
                                        }, {new:true}) ;  //new true means return updated documents
        
        console.log("DETAILS", updatedDetails);
        //create url
        const url = `http://localhost:3000/update-password/${token}`
    
        //send mail containing the url
        await mailSender(email , 
                        "Password Reset Link" , 
                        `Your Link for email verification is ${url}. Please click this url to reset your password.`
                     );
        //return response
            return res.json({
                success:true,
                message:"Email send successfully check your Email"
            });
   } 
   catch(error){
        console.log(error)
        return res.json({
            success:false,
            message:"something went wrong while resetting email"
        });
   }

};

//resetPassword

exports.resetPassword = async (req, res) => {
   try{
        //data fetch
        const {password , confirmPassword, token} = req.body;
        //validation
        if(password !== confirmPassword) {
            return res.json({
                success:false,
                message:"password not matched with confirm password",
            });
        }
        //get userdetails from db using token
        const userDetails = await User.findOne({token: token});
    
        //if no entry - invalid token
        if(!userDetails) {
            return res.json({
                success:false,
                message:"Token is invalid",
            });
        }
        //time expiration time
        if( userDetails.resetPasswordExpires < Date.now()) {
            return res.json({
                success:false,
                message:"Token Time is Expired, please recreate Token",
            });
        }
        //hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        //update password
        await User.findOneAndUpdate(
            {token: token},
            {password:hashedPassword},
            {new:true},
        );
        //return response
        return res.status(200).json({
            success:true,
            message:"Password reset successfully",
        });
   }
   catch(error) {
    console.log(error);
        return res.status.json({
            success:false,
            message:"Password reset not done",
        });
        
   }
}




















