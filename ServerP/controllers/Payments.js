const {instance} = require("../config/razorpay");
const Course = require("../models/Course");
const crypto = require("crypto")
const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const {courseEnrollmentEmail} = require("../mail/templates/courseEnrollmentEmail");
const mongoose  = require("mongoose");
const {paymentSuccessEmail} = require("../mail/templates/paymentSuccessEmail")

//initiata the razor pay order
exports.capturePayment = async(req, res) => {

    const {courses} = req.body;
    const userId = req.user.id;

    if(courses.length === 0) {
        return res.json({
            success:false, message:"Please provide course id"
        });
    }

    let totalAmount = 0;

    for(const course_id of courses) {
        let course;
        try{
            course = await Course.findById(course_id);
            if(!course) {
                return res.status(200).json({
                    success:false,
                    message:"Could not find the course"
                });
            }

            const uid =  new mongoose.Types.ObjectId(userId)
            if(course.studentsEnrolled.includes(uid)) {
                return res.status(200).json({
                    success:false,
                    message:"student is already enrolled in Course"
                });
            }

            totalAmount += course.price;
        }
        catch(error){
            console.log(error);
            console.log("Payment error")
            return res.status(500).json({
                success:false,
                message:error .message
            });
        }
    }

    const options = {
        amount : totalAmount * 100,
        currency : "INR",
        receipt : Math.random(Date.now()).toString(),
     }

     try {
        // Initiate the payment using Razorpay
        const paymentResponse = await instance.orders.create(options)
        console.log(paymentResponse)
        res.json({
          success: true,
          data: paymentResponse,
        })
      } catch (error) {
        console.log(error)
        return res.status(500)
          .json({ success: false, message: "Could not initiate order." })
      }
}


//verify payment
exports.verifyPayment = async(req, res) => {

    const razorpay_order_id = req.body?.razorpay_order_id;
    const razorpay_payment_id =  req.body?.razorpay_payment_id;
    const razorpay_signature = req.body?.razorpay_signature;
    const courses = req.body?.courses;
    const userId = req.user.id;

    if(!razorpay_order_id || 
        !razorpay_payment_id || 
        !razorpay_signature || !courses || !userId) {
            return res.status(200).json({
                success:false,
                message:"Failed Payment",
            });
     }

    let body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto    
            .createHmac("sha256", process.env.RAZORPAY_SECRET)
            .update(body.toString())
            .digest("hex");

    if(expectedSignature === razorpay_signature) {
        //enrolled student
        await enrollStudents(courses, userId, res);

        //return res[pone
        return res.status(200).json({
            success:true,
            message:" Payment verify",
        });
    }
    return res.status(500).json({
        success:false,
        message:" Payment Failed",
    });

}

const enrollStudents = async(courses, userId, res) => {

    if(!courses || userId) {
        return res.status(400).json({
            success:false,
            message:" Please provide data",
        });
    }

    for(const courseId of courses) {
        try{
            //find the course and enrolled the student in it
            const enrolledCourse = await Course.findByIdAndUpdate(
                {id:courseId},
                {$push: {studentsEnrolled : userId}},
                {new :true},
            )

            if(!enrolledCourse) {
                return res.status(500).json({
                    success:false,
                    message:"Course not found",
                });
            }

            //find the student and the course in their course list
            const enrollStudent = await User.findByIdAndUpdate(
                userId,
                {$push:{
                    courses : courseId,
                } },
                {new :true} )

            //mail send to user
            const emailResponse = await mailSender(
                enrollStudents.email,
                `Successfully Enrolled into ${enrolledCourse.courseName}`,
                courseEnrollmentEmail(enrolledCourse.courseName, `${enrollStudent.firstName}`)
            )
            console.log("Email sent successfully ", emailResponse.response);
        }
        catch{
            console.log(error)
            return res.status(500).json({
                success:false,
                message:error.message,
            });
        }
    }
}

exports.sendPaymentSuccessEmail = async(req, res) => {

    const {orderId, paymentId, amount} =req.body;
    const userId = req.user.id;

    if(!orderId || !paymentId || !amount) {
        return res.status(400).json({
            success:false,
            message:"Please provide all details",
        })
    }

    try{
        //student  ko dhundo
        const enrollStudent = await User.findById(userId);
        await mailSender(
            enrollStudent.email,
            `Payment Recieved`,
            paymentSuccessEmail(`${enrollStudent.firstName}`,
            amount/100, orderId, paymentId)
        )
    }
    catch(error) {
        console.log("error in sending mail", error);
        return res.status(500).json({
            success:false,
            message:"Could not send mail",
        })
    }


}











//capture the payment & initiate the razorpay payment
// exports.capturePayment = async (req, res) => {

//         //get course and User id
//         const {course_id} = req.body;
//         const userId = req.user.id;
//         //validation
//         //valid courseID
//         if(!course_id) {
//             return res.json({
//                 success:false,
//                 message:"Please provide valid course ID",
//             });
//         };
//         //valid course Details
//         let course;

//         try{
//             course = await Course.findById(course_id);
//             if(!course) {
//                 return res.json({
//                     success:false,
//                     message:"Not find course",
//                 });
//             }
//             //User already pay for same course
//             const uid = new mongoose.Types.ObjectId(userId); //user id jo string type me exist kr rhi thi use objectId me convert kr liya
//             if (course.studentsEnrolled.includes(uid)) {
//                 return res.status(200).json({
//                     success:false,
//                     message:"Student already enrolled",
//                 });
//             }     
//         }  
//         catch(error) {
//             console.log(error)
//             return res.status(500).json({
//                 success:false,
//                 message:error.message,
//             });
//         }
        
//         //ordere create
//         const amount = course.price;
//         const currency = "INR";
      
//         const options = {
//             amount: amount * 100,
//             currency,
//             receipt : Math.random(Date.now()).toString(),
//             notes: {
//                 courseId: course_id, 
//                 userId,
//             }
//         };
//         try{
//             //function call order create
//             //initiate the payment using razorpay
//             const paymentResponse = await instance.orders.create(options);
//             console.log(paymentResponse);

//             //return response
//             return res.status(200).json({
//                 success:true,
//                 message:"Order created successfully",
//                 courseName : course.courseName,
//                 courseDescription : course.courseDescription,
//                 thumbnail : course.thumbnail,
//                 orderId : paymentResponse.id,
//                 currency : paymentResponse.currency,
//                 amount : paymentResponse.amount,
//             })
//         }
//         catch(error) {
//             console.log(error);
//             return res.json({
//                 success: false,
//                 message:"Could not initiate the order",
//             });
//         }
// };

// //verifySignature of razorpay and server
// exports.verifySignature = async (req, res) => {
    
//     //on this we have perform  A,B,C steps
//     const webhookSecret = "12345678"; // secret key

//     //razorpay signature
//     const signature = req.headers["x-razorpay-signature"];

//    // step: A
//     const shasum = crypto.createHmac("sha256", webhookSecret);
//     //B
//     shasum.update(JSON.stringify(req.body));
//     //C
//     const digest = shasum.digest("hex");

//     if(signature === digest) {
//         console.log("Payment is Authorised"); 
//         // ab notes se courrse 
//         //ID & userid ayegi that we send in notes

//         const {courseId, userId} = req.body.payload.payment.entity.notes;//notes
        
//         try{
//             //fulfil action

//             //find the course and entrolled student in it
//             const entrolledCourse = await Course.findOneAndUpdate(
//                                             {_id : courseId},
//                                             { $push : {studentsEnrolled : userId}},
//                                             {new : true},
//             );

//             if(!entrolledCourse) {
//                 return res.status(500).json({
//                     success: false,
//                     message:"Course not fount",
//                 });
//             }

//             console.log(entrolledCourse);

//             //find the student and update added the list of entrolled course 
//             const entrolledStudent = await User.findOneAndUpdate(
//                                                 {_id:userId},
//                                                 {$push : {courses: courseId}},
//                                                 {new : true},
//             );

//             console.log(entrolledStudent);

//             //mail send kro confirmation
//             const emailResponse = await mailSender(
//                                         entrolledStudent.email,
//                                         "Congratulation from Codehelp",
//                                         "Congratulation, you are onborede into new Course",

//             );

//             console.log(emailResponse);
//             return res.status(200).json({
//                 success: true,
//                 message:"Signature verify & Course added in Student course list",
//             });
//         }
//         catch(error) {
//             console.log(error);
//             return res.status(500).json({
//                 success: false,
//                 message:error.message,
//             });
//         }



//     }

//     else {
//         return res.status(400).json({
//             success: false,
//             message:"Invalid request",
//         });
//     }


// };













