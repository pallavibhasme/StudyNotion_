const RatingAndReview = require("../models/RatingAndReview");
const Course = require("../models/Course");
const { default: mongoose } = require("mongoose");

//create rating
exports.createRating = async (req, res) => {
    try{
        //get User id
        const userId = req.user.id;
        //fetching from req body
        const {rating, review , courseId} = req.body;
        //check if user is entrolled or not
        const couserDetails = await Course.findOne(
                                {_id : courseId,
                                studentsEnrolled : {$elemMatch : {$eq : userId}}, 
                            });

        if(!couserDetails) {
            return res.status(404).json({
                success: false,
                message : "Student is not enrolled in the course",
            });
        }
        //check if user already review the post
        const alreadyReviewed = await RatingAndReview.findOne({
                                                user : userId,
                                                Course : courseId,
                                            });
        
        if(alreadyReviewed) {
            return res.status(403).json({
                success: false,
                message : "Student is already reviewed the course",
            });
        }
        //create rating and review
        const ratingReview = await RatingAndReview.create({
                                        rating, review,
                                        Course: courseId,
                                        user: userId,
                                    });

        //update course
        const updatedCourseDetails =  await Course.findByIdAndUpdate({_id:courseId},
                                     {
                                        $push : {
                                            ratingAndReviews: ratingReview._id,
                                        }
                                     },
                                     {new: true});
        
        console.log(updatedCourseDetails);
        //retrun response
        return res.status(200).json({
            success: true,
            message : "Rating & Reviewed the course successfully",
            updatedCourseDetails,
        });
    }
    catch(error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message : error.message,
        });
    }
}

//Avrage Rating
exports.getAverageRating = async (req, res) => {
    try{

        //get courseId
        const courseId = req.body.courseId;
        //calciulate avg rating

        const result = await RatingAndReview.aggregate([
            {
                $match: {
                    course : new mongoose.Types.ObjectId(courseId),
                },
            },
            {
                $group : {
                    _id : null,
                    averageRating : { $avg : "$rating"},
                }
            }
        ])

        //return rating
        if(result.length > 0) {

        return res.status(200).json({
                    success: true,
                    averageRating: result[0].averageRating,
                });
        }
        //if no ratingreview exist
        return res.status(200).json({
            success: true,
            message:"Average Rating is 0 , no rating given till now",
            averageRating: 0,
        });

    }
    catch(error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message : error.message,
        });
    }
}

//getAllRating&reviews
exports.getAllRatingReview = async (req, res) => {
    try {
      const allReviews = await RatingAndReview.find({})
        .sort({ rating: "desc" })
        .populate({
          path: "user",
          select: "firstName lastName email image", // Specify the fields you want to populate from the "Profile" model
        })
        .populate({
          path: "course",
          select: "courseName", //Specify the fields you want to populate from the "Course" model
        })
        .exec()
  
      res.status(200).json({
        success: true,
        data: allReviews,
      })
    } catch (error) {
      console.error(error)
      return res.status(500).json({
        success: false,
        message: "Failed to retrieve the rating and review for the course",
        error: error.message,
      })
    }
  }
  





