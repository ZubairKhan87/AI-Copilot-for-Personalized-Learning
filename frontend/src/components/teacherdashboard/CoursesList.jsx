import React from 'react';

const CoursesList = ({ courses, onCourseSelect }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {courses.map(course => (
        <div key={course.id} className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6">
            <h3 className="text-xl font-bold mb-2">{course.title}</h3>
            <p className="text-gray-600 mb-4">Students Enrolled: {course.students}</p>
            
            <div className="mb-4">
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">Average Progress</span>
                <span className="text-sm font-medium">{course.averageProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full" 
                  style={{ width: `${course.averageProgress}%` }}
                ></div>
              </div>
            </div>
            
            <div className="flex justify-between mb-4">
              <div>
                <span className="text-sm font-medium block">Materials</span>
                <span className="text-lg font-bold">{course.materials.length}</span>
              </div>
              <div>
                <span className="text-sm font-medium block">Quizzes</span>
                <span className="text-lg font-bold">{course.quizzes.length}</span>
              </div>
              <div>
                <span className="text-sm font-medium block">Avg. Score</span>
                <span className="text-lg font-bold">{course.averageScore}</span>
              </div>
            </div>
            
            <button
              onClick={() => onCourseSelect(course)}

              className="cursor-pointer w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75"
              
            >

              Manage Course
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CoursesList;