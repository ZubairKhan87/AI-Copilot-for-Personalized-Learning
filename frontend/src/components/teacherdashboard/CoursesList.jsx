import React, {useEffect,useState} from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const CoursesList = ({onCourseSelect }) => {
  const [courses, setCourses] = useState([])
   

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const accessToken = localStorage.getItem('access');
        console.log("access token at teacher dashboard ",accessToken)
        if (!accessToken) {
          console.error('Authentication token not found');
          // Consider redirecting to login here
          return;
        }
        
        const response = await axios.get('http://localhost:8000/api/course/course_registration/', {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        });
        
        console.log("response from backend",response.data)
        // Transform the backend data to match  frontend structure
        const transformedCourses = response.data.map(course => ({
          id: course.id,
          title: course.course_name,
          description: course.course_description,
          startDate: course.course_start_date,
          endDate: course.course_end_date,
          students: course.student_count, 
          averageProgress: 0,
          averageScore: 0,
          materials: course.uploaded_materials,
          quizzes: course.no_of_quizzes,
          studentPerformance: []
        }));
        
        setCourses(transformedCourses);
      } catch (err) {
        console.error('Error fetching courses:', err);
        // Handle error appropriately - maybe show a notification
      }
    };
    
    fetchCourses();
  }, []);
    console.log(courses)


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
                <span className="text-lg font-bold">{course.materials}</span>
              </div>
              <div>
                <span className="text-sm font-medium block">Quizzes</span>
                <span className="text-lg font-bold">{course.quizzes}</span>
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