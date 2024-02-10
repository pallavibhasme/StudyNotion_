import React from 'react'
import Instructor from "../../../assets/Images/Instructor.png"
import HighlightText from './HighlightText'
import { FaArrowRight } from "react-icons/fa6";
import CTAButton from './Button'

const InstructorSection = () => {
  return (
    <div className='mt-16'>
        <div className='flex gap-20 items-center'>
            <div className='w-[50%]'>
                <img src={Instructor}
                alt='instructor'
                className='shadow-white'
                />

            </div>

            <div className='w-[50%] flex flex-col gap-10'>
                <div className='font-semibold text-4xl w-[50%]'>
                    Become an  
                <HighlightText text={"instructor"} />
                </div>
                <p className='font-medium text-[16px] w-[80%] text-richblack-300'>Instructors from around the world teach millions of students on StudyNotion. We provide the
                     tools and skills to teach what you love.</p>

                <div className='w-fit'>
                    <CTAButton active={true} linkto={"/signup"} >
                        <div className='flex gap-2 items-center '>
                        Start Teaching Today 
                        <FaArrowRight/>
                        </div>
                    </CTAButton>
                </div>
                
            </div>
        </div>
    </div>
  )
}

export default InstructorSection