import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"

import { editCourseDetails } from "../../../../../services/operations/courseDetailsAPI"
import { resetCourseState, setStep } from "../../../../../slices/courseSlice"
import { COURSE_STATUS } from "../../../../../utils/constants"
import IconBtn from "../../../../common/IconBtn"

export default function PublishCourse() {
  const { register, handleSubmit, setValue, getValues } = useForm()

  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { token } = useSelector((state) => state.auth)
  const { course } = useSelector((state) => state.course)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (course?.status === COURSE_STATUS.PUBLISHED) {
      setValue("public", true);
    }
  }, [])
  console.log("course::", course)

  const goBack = () => {
    dispatch(setStep(2))
  }

  const goToCourses = () => {
    dispatch(resetCourseState())
    navigate("/dashboard/my-courses")
  }

  const handleCoursePublish = async () => {
    // check if form has been updated or not
    if (
      (course?.status === COURSE_STATUS.PUBLISHED &&
        getValues("public") === true) ||
      (course?.status === COURSE_STATUS.DRAFT && getValues("public") === false)
    ) {
      // form has not been updated
      // no need to make api call
      goToCourses()
      return
    }
    const formData = new FormData();
    formData.append("courseId", course._id)
    // console.log("helo edit course ID ::", course._id);
    console.log("helo form data ::", formData);
    const courseStatus = getValues("public") ? COURSE_STATUS.PUBLISHED : COURSE_STATUS.DRAFT
    formData.append("status", courseStatus)
    console.log("helo edit course status ::", courseStatus);

    setLoading(true);
    const result = await editCourseDetails(formData, token)
    console.log("helo edit course result ::", result);
    if (result) {
      goToCourses()
    }
    setLoading(false)
  }

  const onSubmit = (data) => {
    console.log(data)
    handleCoursePublish()
  }

  return (
    <div className="rounded-md border-[1px] border-richblack-700 bg-richblack-800 p-6">
      <p className="text-2xl font-semibold text-richblack-5">
        Publish Settings
      </p>
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Checkbox */}
        <div className="my-6 mb-8">
          <label htmlFor="public" className="inline-flex items-center text-lg">
            <input
              type="checkbox"
              id="public"
              {...register("public")}
              className="border-gray-300 h-4 w-4 rounded bg-richblack-500 text-richblack-400 focus:ring-2 focus:ring-richblack-5"
            />
            <span className="ml-2 text-richblack-400">
              Make this course as public
            </span>
          </label>
        </div>

        {/* Next Prev Button */}
        <div className="ml-auto flex max-w-max items-center gap-x-4">
          <button
            disabled={loading}
            type="button"
            onClick={goBack}
            className="flex cursor-pointer items-center gap-x-2 rounded-md bg-richblack-300 py-[8px] px-[20px] font-semibold text-richblack-900"
          >
            Back
          </button>
          <IconBtn disabled={loading} text="Save Changes" />
        </div>
      </form>
    </div>
  )
}
















// import React, { useEffect, useState } from 'react'
// import { useForm } from 'react-hook-form'
// import { useDispatch, useSelector } from 'react-redux';
// import IconBtn from '../../../../common/IconBtn';
// import { resetCourseState, setStep } from '../../../../../slices/courseSlice';
// import { COURSE_STATUS } from '../../../../../utils/constants';
// import { editCourseDetails } from '../../../../../services/operations/courseDetailsAPI';


// export default function PublishCourse() {

//     const {register, handleSubmit, setValues, getValues} = useForm();
//     const {course} = useSelector((state) => state.course);
//     const {token} = useSelector((state) => state.auth);
//     const dispatch = useDispatch();
//     const [loading, setLoading] = useState(false)


//     useEffect(() => {
//         if(course?.status === COURSE_STATUS.PUBLISHED) {
//             setValues( 'public',  true);
//         }
//     },  [])

//     const goToCourses = () => {
//         dispatch(resetCourseState());
//         //navigate to "/dashBoard/my-courses" *************
//     }
  
//     const handleCoursepublish = async() => {
//         if(course?.status === COURSE_STATUS.PUBLISHED  &&   getValues("public")  ===  true  ||
//         (course.status  ===  COURSE_STATUS.DRAFT  &&   getValues("public")  === false))  {
//                 //no update in form
//                 //no need to API call
//                 goToCourses();
//                 return;
//         }

//         //if form data updated
//         const formData = new FormData();
//         formData.append("courseId", course._id);
//         const courseStatus = getValues('public')  ?  COURSE_STATUS.PUBLISHED  : COURSE_STATUS.DRAFT;
//         formData.append("status", courseStatus);

//         setLoading(true);
//         const result = await editCourseDetails(formData, token); 

//         if(result) {
//             goToCourses();
//         }
//         setLoading(false);
//     }

//     const onSubmit = () => {
//         handleCoursepublish();
//     }
//     const goBack = () => {
//         dispatch(setStep(2));
//     }

//   return (
//     <div className='rounded-md border-[1px] bg-richblack-800
//     p-6 text-white'>
//         <p>Publish Course</p>

//         <form onSubmit={handleSubmit(onSubmit)}>
//             <div>
//                 <input  className='gap-2 mr-3'
//                     type='checkbox'
//                     id='public'
//                     {...register("public")}
//                 />
//                 <label htmlFor='public'>Make this course as Publish</label>
//             </div>

//             <div className='flex gap-4 mt-4 justify-end'>
//                 <button
//                  className='flex items-center text-white p-1 pl-3 pr-3  border-[1px] bg-richblack-800 rounded-md '
//                     onClick={goBack}
//                     disabled={loading}
//                     type='button'  >
//                     Back
//                 </button>
//                 <IconBtn text='Save Changes' disabled={loading}/>
//             </div>
//         </form>
//     </div>
//   )
// }
