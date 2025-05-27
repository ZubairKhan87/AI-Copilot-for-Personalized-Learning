import React, { useState,useEffect } from 'react';
import CoursesList from './CoursesList';
import CourseDetails from './CourseDetails';
import AddCourseModal from './AddCourseModal';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
const TeacherDashboard = () => {
  const [courses, setCourses] = useState([
    {
      id: 1,
      title: "Introduction to Computer Science",
      students: 28,
      averageProgress: 65,
      averageScore: 78,
      materials: [
        { id: 1, title: "Lecture 1: Algorithms Basics", type: "pdf", url: "#", uploadDate: "2025-03-10" },
        { id: 2, title: "Object-Oriented Programming", type: "slides", url: "#", uploadDate: "2025-03-15" },
        { id: 3, title: "Data Structures Handbook", type: "book", url: "#", uploadDate: "2025-03-22" }
      ],
      quizzes: [
        { id: 1, title: "Algorithms Quiz", avgScore: 85, submissionRate: 90, generatedFrom: "Lecture 1: Algorithms Basics" },
        { id: 2, title: "OOP Concepts", avgScore: 78, submissionRate: 85, generatedFrom: "Object-Oriented Programming" },
        { id: 3, title: "Data Structures", avgScore: 72, submissionRate: 65, generatedFrom: "Data Structures Handbook" }
      ],
      studentPerformance: [
        { name: "Alex Johnson", progress: 75, avgScore: 88, quizzesTaken: 3, lastActive: "2025-04-12" },
        { name: "Maria Garcia", progress: 60, avgScore: 92, quizzesTaken: 2, lastActive: "2025-04-10" },
        { name: "James Wilson", progress: 45, avgScore: 67, quizzesTaken: 2, lastActive: "2025-04-08" },
        { name: "Sarah Lee", progress: 85, avgScore: 95, quizzesTaken: 3, lastActive: "2025-04-14" }
      ]
    },
    {
      id: 2,
      title: "Web Development Fundamentals",
      students: 35,
      averageProgress: 40,
      averageScore: 72,
      materials: [
        { id: 1, title: "HTML5 & CSS3 Basics", type: "pdf", url: "#", uploadDate: "2025-03-05" },
        { id: 2, title: "JavaScript Foundations", type: "video", url: "#", uploadDate: "2025-03-12" }
      ],
      quizzes: [
        { id: 1, title: "HTML Elements Quiz", avgScore: 81, submissionRate: 88, generatedFrom: "HTML5 & CSS3 Basics" },
        { id: 2, title: "CSS Selectors", avgScore: 75, submissionRate: 70, generatedFrom: "HTML5 & CSS3 Basics" }
      ],
      studentPerformance: [
        { name: "Emily Chen", progress: 65, avgScore: 85, quizzesTaken: 2, lastActive: "2025-04-13" },
        { name: "David Smith", progress: 35, avgScore: 68, quizzesTaken: 1, lastActive: "2025-04-09" },
        { name: "Sophia Martinez", progress: 50, avgScore: 76, quizzesTaken: 2, lastActive: "2025-04-11" }
      ]
    },
    {
      id: 3,
      title: "Database Management Systems",
      students: 22,
      averageProgress: 25,
      averageScore: 70,
      materials: [
        { id: 1, title: "SQL Fundamentals", type: "pdf", url: "#", uploadDate: "2025-03-18" },
        { id: 2, title: "Database Design Principles", type: "slides", url: "#", uploadDate: "2025-03-25" }
      ],
      quizzes: [
        { id: 1, title: "SQL Basics Quiz", avgScore: 73, submissionRate: 82, generatedFrom: "SQL Fundamentals" },
        { id: 2, title: "Normalization Forms", avgScore: 68, submissionRate: 55, generatedFrom: "Database Design Principles" }
      ],
      studentPerformance: [
        { name: "Ryan Johnson", progress: 30, avgScore: 75, quizzesTaken: 1, lastActive: "2025-04-10" },
        { name: "Emma Williams", progress: 20, avgScore: 65, quizzesTaken: 1, lastActive: "2025-04-07" },
        { name: "Ethan Brown", progress: 45, avgScore: 80, quizzesTaken: 2, lastActive: "2025-04-13" }
      ]
    }
  ]);

  const [selectedCourse, setSelectedCourse] = useState(null);
  const [activePage, setActivePage] = useState('dashboard');
  const [showAddCourseModal, setShowAddCourseModal] = useState(false);

  
  // Add new course
  const handleAddCourse = (newCourse) => {
    // The newCourse object is coming from the AddCourseModal with data from the API response
    setCourses([...courses, newCourse]);
    setShowAddCourseModal(false);
  };

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
          students: 0,
          averageProgress: 0,
          averageScore: 0,
          materials: [],
          quizzes: [],
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
  // Add material to course
  const handleAddMaterial = (courseId, material) => {
    setCourses(courses.map(course => {
      if (course.id === courseId) {
        return {
          ...course,
          materials: [...course.materials, { 
            id: course.materials.length + 1, 
            ...material,
            uploadDate: new Date().toISOString().split('T')[0]
          }]
        };
      }
      return course;
    }));
  };

  // Generate quiz from material
  const handleGenerateQuiz = (courseId, materialId, quizTitle) => {
    setCourses(courses.map(course => {
      if (course.id === courseId) {
        const material = course.materials.find(m => m.id === materialId);
        return {
          ...course,
          quizzes: [...course.quizzes, {
            id: course.quizzes.length + 1,
            title: quizTitle,
            avgScore: 0,
            submissionRate: 0,
            generatedFrom: material.title
          }]
        };
      }
      return course;
    }));
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Teacher Dashboard</h1>
            <p className="text-gray-600">Manage courses, materials, and monitor student progress</p>
          </div>
          {activePage === 'dashboard' && (
            <button
              onClick={() => setShowAddCourseModal(true)}
              className="cursor-pointer py-2 px-4 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75"
            >
              Add New Course
            </button>
          )}
        </header>
        
        {activePage === 'dashboard' ? (
          <CoursesList 
            courses={courses} 
            onCourseSelect={(course) => {
              setSelectedCourse(course);
              setActivePage('course-details');
            }}
          />
        ) : (
          <CourseDetails 
            course={selectedCourse}
            courseId={courses.id}
 
            onBack={() => setActivePage('dashboard')}
            onAddMaterial={(material) => handleAddMaterial(selectedCourse.id, material)}
            onGenerateQuiz={(materialId, quizTitle) => handleGenerateQuiz(selectedCourse.id, materialId, quizTitle)}
          />
        )}
      </div>

      {showAddCourseModal && (
        <AddCourseModal 
          onClose={() => setShowAddCourseModal(false)}
          onAddCourse={handleAddCourse}
        />
      )}
    </div>
  );
};

export default TeacherDashboard;