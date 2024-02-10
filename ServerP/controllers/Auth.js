//send OTP
const User = require("../models/User");
const OTP = require("../models/OTP");
const otpGenerator = require("otp-generator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {passwordUpdated} = require("../mail/templates/passwordUpdate");
const mailSender = require("../utils/mailSender");
const Profile = require("../models/Profile");
require("dotenv").config();

//send OTP
exports.sendotp = async (req, res) => {
    try{
        //fetch email from request ki body
        const {email} = req.body;

        //check if user is alredy exist
        const checkUserPresent = await User.findOne({email});

        //if user already exist, then return response
        if(checkUserPresent) {
            return res.status(401).json({
                success:false,
                message: "User is already registered",
            })
        }

        //if user if new then create OTP
        //generate OTP
        var otp = otpGenerator.generate(6, {
            upperCaseAlphabets : false,
            lowerCaseAlphabets : false,
            specialChars : false,
        });
        console.log("OTP generated ", otp);

        //check unique OTP or not
        let result = await OTP.findOne({otp: otp});
        console.log("Result is Generate OTP Func");
		console.log("OTP", otp);
		console.log("Result", result);
        while(result) {
            otp = otpGenerator(6, {
                upperCaseAlphabets : false,
                lowerCaseAlphabets : false,
                specialChars : false,
            });
            result = await OTP.findOne({otp: otp});
        }

        const otpPayload = {email, otp};

        //create an entry in DB for OTP
        const otpBody = await OTP.create(otpPayload);
        console.log(otpBody);

        //return response successfull
        res.status(200).json({
            success:true,
            message:"OTP send successfully",otp,
        })

    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:error.message,
        })
    }
};

//signUP

exports.signup = async (req, res) => {

    try{
            //data fetch from req body 
        const {
            firstName , 
            lastName,
            email,
            password,
            confirmPassword,
            accountType,
            contactNumber,
            otp
        } = req.body;

        //validate the data

        if(!firstName || !lastName || !email ||
            !password || !confirmPassword  ||  !otp) {
                return res. status(403).json({
                    success:false,
                    message:"All fields are required",
                })
            }

        //2 password matching
        if(password !== confirmPassword) {
            return res.status(400).json({
                success:false,
                message:"Password & confirmPassword not match",

            });
        }

        //check user already exist or not
        const existingUser = await User.findOne({email});
        if(existingUser) {
            return res.status(400).json({
                success:false,
                message:"User already registered",

            });
        }

        //find most recent OTP for user
        const recentOTP = await OTP.find({email}).sort({createdAt:-1}).limit(1);
        console.log(recentOTP);

        //validate OTP
        if(recentOTP.length == 0) {
            //OTP not found
            return res.status(400).json({
                success:false,
                message:"The OTP is not valid",

            });
        } else if(otp !== recentOTP[0].otp) {
            //Invalid OTP
            return res.status(400).json({
                success:false,
                message:"Invalid OTP",

            });
        }

        //Hash Password 
        const hashedPassword = await bcrypt.hash(password , 10);

        //entry in DB

        const profileDetails = await Profile.create({
            gender:null,
            dateOfBirth: null,
            about: null, 
            contactNumber:null,
        })

        const user = await User.create({
            firstName , 
            lastName,
            email,
            password:hashedPassword,
            accountType,
            contactNumber,
            additionalDetails:profileDetails._id,
            image: `http://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`,
        })

        //return response
        return res.status(200).json({
            success:true,
            user,
            message:"User is registered successfully",

        });

    }
    catch(error){
        console.log(error)
        return res.status(500).json({
            success:false,
            message:"User can not be registered, try again!",

        });
    }
}
//Login

exports.login = async (req, res) => {
    try{
        //get data from req body
        const {email , password} = req.body;
        //validate data
        if(!email || !password) {
            return res.status(403).json({
                success:false,
                message:"All fields are required",
    
            });
        }
        //user check exist or not
        const user = await User.findOne({email}).populate("additionalDetails");
        if(!user) {
            return res.status(401).json({
                success:false,
                message:"User is not registered, please signup first!",
    
            });
        }
        //generate JWT Token , after password matching
        if(await bcrypt.compare(password, user.password)) {
            const payload = {
                email: user.email,
                id:user.id,
                accountType:user.accountType,
            }
            const token = jwt.sign(payload, process.env.JWT_SECRET, {
                expiresIn:"2h",
            });
            user.token = token;
            user.password = undefined;

            //create cookies and send response
            const Options = {
                expiresIn : new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
                httpOnly: true,

            }
            res.cookie("token", token , Options).status(200).json({
                success:true,
                token,
                user,
                message:"Logged in successfully"
            });
        }
        else {
            return res.status(401).json({
                success:false,
                message:"Password is incorrect",
    
            });
        }
    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            // Return 500 Internal Server Error status code with error message
            success:false,
            message:"Logged in failuer, Please try again",

        });
    }
};

//change Password
exports.changePassword = async (req, res) => {
    try{
        //get user data from req body
        const userDetails = await User.findById(req.user.id);
        //grt oldpasswor, confirmpass, newPassword
        const {oldPassword, newPassword, confirmNewPassword} = req.body; 
        //validation old password
        const isPasswordMatch = await bcrypt.compare(
            oldPassword, userDetails.password );    
        
        if(!isPasswordMatch){
            // If old password does not match, return a 401 (Unauthorized) error
			return res.status(401).json({ 
                success: false,
                 message: "The password is incorrect" 
            });
        }

        //match new Password and confirm new password
        if(newPassword !== confirmNewPassword) {
            // If new password and confirm new password do not match, return a 400 (Bad Request) error
			return res.status(400).json({
				success: false,
				message: "The password and confirm password does not match",
			});
        }

        //update password 
        const encryptedPassword = await bcrypt.hash(newPassword, 10);
        //in DB
        const updatedUserDetails = await User.findByIdAndUpdate(
            req.user.id, {password: encryptedPassword},
            {new: true},
        );

        //send email - password update
        try{
            const emailResponse = await mailSender(
                updatedUserDetails.email,
                passwordUpdated(
                    updatedUserDetails.email,
                    `Password updated successfully for ${updatedUserDetails.firstName} ${updatedUserDetails.lastName}`
                )
            );
            console.log("Email sent successfully:", emailResponse.response);
        }   
        catch (error) {
			// If there's an error sending the email, log the error and return a 500 (Internal Server Error) error
			console.error("Error occurred while sending email:", error);
			return res.status(500).json({
				success: false,
				message: "Error occurred while sending email",
				error: error.message,
			});
		}
        //return response successfully
        return res.status(200).json({ 
            success: true,
             message: "Password updated successfully"
         });
    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message: "Error occurred while updating password",
			error: error.message,
        });
    } 
};









