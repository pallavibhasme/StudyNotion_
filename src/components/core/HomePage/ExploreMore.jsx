import React, { useState } from 'react'
import { HomePageExplore}  from "../../../data/homepage-explore"
import HighlightText from "./HighlightText"



const tabsName = [
    "Free",
    "New to coding",
    "Most popular",
    "Skills Paths",
    "Career paths",
]

const ExploreMore = () => {

  const [currentTab, setCurrentTab] = useState(tabsName[0]);
  const [courses, setCourses] = useState(HomePageExplore[0].courses);
  const [currentCard, setCurrentCard] = useState(HomePageExplore[0].courses[0].heading);

  const setMyCards = (value) => {
    setCurrentTab(value);
    const result = HomePageExplore.filter((course) => course.tag === value);
    setCourses(result[0].courses);
    setCurrentCard(result[0].courses[0].heading)
  }

  return (
    <div>

      <div className='text-4xl font-semibold text-center'>
        Unlock thye
        <HighlightText  text={"Power of Code"}/>
      </div>
      <p className=' text-center mt-3 text-richblack-300 text-sm text-[16px] '>
        Learn to bulid anything you can imagine
      </p>

      {/* tab component */}
      <div className='flex rounded-full mb-5 mt-5 px-1 py-1 bg-richblack-800 border border-richblack-200'>
        {
          tabsName.map( (element, index) => {
            return (
              <div className={`text-[16px]  flex items-center 
              gap-3 ${currentTab === element ? "bg-richblack-900 text-richblack-5 font-medium"
               : "bg-richblack-700 text-richblack-200 "}  rounded-md transition-all duration-200   cursor-pointer
               hover:bg-richblack-900 hover:text-richblack-5 px-7 py-2`}
               key={index}
               onClick={() => setMyCards(element)}
               >
                {element}
              </div>
            )
          })
        }
      </div>
      <div className='lg:h-[150px]'></div>

      {/*course card component */}
      {/* <div className='absolute flex  gap-10 justify-between items-center w-full'>
        {
          courses.map( (element, index) => {
            return (
              <CourseCard 
              key={index}
              cardData = {element}
              currentCard = {currentCard}
              setCurrentCard = {setCurrentCard}
              />
            )
          })
        }
      </div> */}


    </div>
  )
}

export default ExploreMore