const mongoose = require("mongoose");
const mailSender = require("../utils/mailSender");
const emailTemplate = require("../mail/templates/emailVerificationTemplate");

const OTPSchema = new mongoose.Schema({
    email: {
        type : String,
        required:true,
    },
    otp : {
        type: String,
        required:true,
    },
    createdAt : {
        type : Date,
        default:Date.now(),
        expires:60*5,
    },
});

// pre/post middleware schema ke niche modle ke upper
//function mail send
async function sendVerificationEmail(email ,otp) {
    try{

        const mailResponse = await mailSender(email, "Verification email from StudyNotion", emailTemplate(otp));
        console.log("Email send successfully", mailResponse);

    } catch(error) {
        console.log("error occurd while sending mail");
        throw error;
    }
}
OTPSchema.pre("save", async function(next) {
    console.log("New document saved to database");

    if(this.isNew){
        await sendVerificationEmail(this.email, this.otp);
    }
    
    next();
})

const OTP = mongoose.model("OTP", OTPSchema);

module.exports = OTP;

