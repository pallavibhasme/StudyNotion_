import React from 'react'
import CTAButton from './Button'
// import HighlightText from './HighlightText'
import { FaArrowRight } from "react-icons/fa6";
import { TypeAnimation } from 'react-type-animation';

const CodeBlocks = ({
    position, heading, subheading, Ctabtn1, Ctabtn2, codeblock, backgroundGradient, codeColor
}) => {
  return (
    <div className= {`flex ${position} my-20 justify-between gap-10`}>
        
        {/* section 1 */}
        <div className='w-[50%] flex flex-col gap-8'>
            {heading}
            <div className='text-richblack-300 font-bold'>
              {subheading}
            </div>

            <div className='flex gap-7 mt-7'>
              <CTAButton active={Ctabtn1.active} linkto={Ctabtn1.linkto}>
                <div className='flex gap-2 items-center'>
                  {Ctabtn1.btnText}
                  <FaArrowRight/>
                </div>
              </CTAButton>

              <CTAButton active={Ctabtn2.active} linkto={Ctabtn2.linkto}>
                 {Ctabtn1.btnText}
              </CTAButton>

            </div>
        </div>

      {/* section 2 */}
      <div className='flex h-fit  text-[14px] w-[100%] py-3 lg:w-[500px]'>
          {/* hw gradient */}

          <div className='text-center flex flex-col w-[10%]
           text-richblack-400 font-inter font-semibold'>
            <p>1</p>
            <p>2</p>
            <p>3</p>
            <p>4</p>
            <p>5</p>
            <p>6</p>
            <p>7</p>
            <p>8</p>
            <p>9</p>
            <p>10</p>
            <p>11</p>
          </div>

          <div className={`flex w-[90%] pr-2 gap-2 flex-col font-bold font-mono ${codeColor}`}>
              <TypeAnimation
                sequence={[codeblock, 2000, ""]}
                repeat={Infinity}
                cursor={true}
                style={
                    {
                      whiteSpace:"pre-line",
                      display:"block",
                    }
                }
                omitDeletionAnimation={true}

              />
          </div>
      </div> 
     

    </div>
    
  )
}

export default CodeBlocks