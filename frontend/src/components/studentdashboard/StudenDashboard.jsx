import React, { useState } from 'react';

const StudentDashboard = () => {
  // Sample data - in a real app, this would come from an API
  const [courses, setCourses] = useState([
    {
      id: 1,
      title: "Introduction to Computer Science",
      instructor: "Dr. Jane Smith",
      progress: 65,
      materials: [
        { id: 1, title: "Lecture 1: Algorithms Basics", type: "pdf", url: "#" },
        { id: 2, title: "Object-Oriented Programming", type: "slides", url: "#" },
        { id: 3, title: "Data Structures Handbook", type: "book", url: "#" }
      ],
      quizzes: [
        { id: 1, title: "Algorithms Quiz", completed: true, score: 85 },
        { id: 2, title: "OOP Concepts", completed: true, score: 92 },
        { id: 3, title: "Data Structures", completed: false, score: null }
      ],
      feedback: "You're showing excellent understanding of OOP concepts. Focus on improving your knowledge of tree data structures for the upcoming assessment."
    },
    {
      id: 2,
      title: "Web Development Fundamentals",
      instructor: "Prof. Michael Chen",
      progress: 40,
      materials: [
        { id: 1, title: "HTML5 & CSS3 Basics", type: "pdf", url: "#" },
        { id: 2, title: "JavaScript Foundations", type: "video", url: "#" }
      ],
      quizzes: [
        { id: 1, title: "HTML Elements Quiz", completed: true, score: 78 },
        { id: 2, title: "CSS Selectors", completed: false, score: null }
      ],
      feedback: "Good progress on HTML fundamentals. Work on understanding CSS selectors better before the next assessment."
    },
    {
      id: 3,
      title: "Database Management Systems",
      instructor: "Dr. Sarah Johnson",
      progress: 25,
      materials: [
        { id: 1, title: "SQL Fundamentals", type: "pdf", url: "#" },
        { id: 2, title: "Database Design Principles", type: "slides", url: "#" }
      ],
      quizzes: [
        { id: 1, title: "SQL Basics Quiz", completed: true, score: 75 },
        { id: 2, title: "Normalization Forms", completed: false, score: null }
      ],
      feedback: "You've made a good start with SQL queries. Review normalization concepts to prepare for the upcoming quiz."
    }
  ]);

  const [selectedCourse, setSelectedCourse] = useState(null);
  const [activePage, setActivePage] = useState('dashboard');
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiResponses, setAiResponses] = useState([]);

  // Handle AI assistant interaction
  const handleAskAI = () => {
    if (aiQuestion.trim() === '') return;
    
    // Simulate AI response - would connect to actual AI API in production
    const newResponse = {
      question: aiQuestion,
      answer: `Here's some help with "${aiQuestion}": This concept relates to what you've been studying in ${selectedCourse.title}. Based on your recent quiz results, I suggest focusing on the key principles covered in the ${selectedCourse.materials[0].title} material.`
    };
    
    setAiResponses([...aiResponses, newResponse]);
    setAiQuestion('');
  };

  // Calculate average score for completed quizzes
  const getAverageScore = (course) => {
    const completedQuizzes = course.quizzes.filter(quiz => quiz.completed);
    if (completedQuizzes.length === 0) return 'N/A';
    
    const sum = completedQuizzes.reduce((total, quiz) => total + quiz.score, 0);
    return Math.round(sum / completedQuizzes.length);
  };

  // Render dashboard overview
  const renderDashboard = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {courses.map(course => (
        <div key={course.id} className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6">
            <h3 className="text-xl font-bold mb-2">{course.title}</h3>
            <p className="text-gray-600 mb-4">Instructor: {course.instructor}</p>
            
            <div className="mb-4">
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">Progress</span>
                <span className="text-sm font-medium">{course.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full" 
                  style={{ width: `${course.progress}%` }}
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
                <span className="text-lg font-bold">{course.quizzes.filter(q => q.completed).length}/{course.quizzes.length}</span>
              </div>
              <div>
                <span className="text-sm font-medium block">Avg. Score</span>
                <span className="text-lg font-bold">{getAverageScore(course)}</span>
              </div>
            </div>
            
            <button
              onClick={() => {
                setSelectedCourse(course);
                setActivePage('course-details');
              }}
              className="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75"
            >
              Open Course
            </button>
          </div>
        </div>
      ))}
    </div>
  );

  // Render course details
  const renderCourseDetails = () => {
    if (!selectedCourse) return null;
    
    return (
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">{selectedCourse.title}</h2>
            <button
              onClick={() => setActivePage('dashboard')}
              className="py-2 px-4 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-75"
            >
              Back to Dashboard
            </button>
          </div>
          
          <div className="flex flex-col md:flex-row gap-6">
            <div className="w-full md:w-2/3">
              <div className="mb-8">
                <h3 className="text-xl font-bold mb-4">Course Materials</h3>
                <div className="space-y-3">
                  {selectedCourse.materials.map(material => (
                    <div key={material.id} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                      <div className="p-2 mr-4 bg-blue-100 rounded-lg">
                        {material.type === 'pdf' && (
                          <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
                          </svg>
                        )}
                        {material.type === 'slides' && (
                          <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M5 3a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V5a2 2 0 00-2-2H5zm9 4a1 1 0 10-2 0v6a1 1 0 102 0V7zm-3 2a1 1 0 10-2 0v4a1 1 0 102 0V9zm-3 3a1 1 0 10-2 0v1a1 1 0 102 0v-1z" />
                          </svg>
                        )}
                        {material.type === 'book' && (
                          <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                          </svg>
                        )}
                        {material.type === 'video' && (
                          <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zm12.553 1.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                          </svg>
                        )}
                      </div>
                      <div className="flex-grow">
                        <h4 className="font-medium">{material.title}</h4>
                        <p className="text-sm text-gray-500 capitalize">{material.type}</p>
                      </div>
                      <a 
                        href={material.url} 
                        className="px-3 py-1 bg-blue-50 text-blue-700 text-sm font-medium rounded-md hover:bg-blue-100"
                      >
                        Open
                      </a>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="text-xl font-bold mb-4">Quizzes & Assessments</h3>
                <div className="space-y-3">
                  {selectedCourse.quizzes.map(quiz => (
                    <div key={quiz.id} className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                      <div className={`p-2 mr-4 rounded-full ${quiz.completed ? 'bg-green-100' : 'bg-yellow-100'}`}>
                        {quiz.completed ? (
                          <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          <svg className="w-6 h-6 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      <div className="flex-grow">
                        <h4 className="font-medium">{quiz.title}</h4>
                        <p className="text-sm text-gray-500">
                          {quiz.completed 
                            ? `Completed • Score: ${quiz.score}%` 
                            : 'Not completed yet'}
                        </p>
                      </div>
                      <button 
                        className={`px-3 py-1 text-sm font-medium rounded-md ${
                          quiz.completed 
                            ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' 
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                      >
                        {quiz.completed ? 'Review' : 'Start Quiz'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="w-full md:w-1/3">
              <div className="p-6 mb-6 bg-blue-50 rounded-lg">
                <h3 className="text-lg font-bold mb-3">Your Progress</h3>
                <div className="mb-4">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">Course Completion</span>
                    <span className="text-sm font-medium">{selectedCourse.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${selectedCourse.progress}%` }}
                    ></div>
                  </div>
                </div>
                <p className="text-sm text-gray-600">
                  {selectedCourse.quizzes.filter(q => q.completed).length} of {selectedCourse.quizzes.length} quizzes completed
                </p>
              </div>
              
              <div className="p-6 bg-green-50 rounded-lg mb-6">
                <h3 className="text-lg font-bold mb-3">Personalized Feedback</h3>
                <p className="text-sm text-gray-700">{selectedCourse.feedback}</p>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-bold mb-3">AI Assistant</h3>
                <div className="mb-4 max-h-64 overflow-y-auto">
                  {aiResponses.map((response, index) => (
                    <div key={index} className="mb-3">
                      <p className="text-sm font-medium mb-1">You asked: {response.question}</p>
                      <p className="text-sm bg-white p-3 rounded-lg border border-gray-200">{response.answer}</p>
                    </div>
                  ))}
                </div>
                <div className="flex">
                  <input
                    type="text"
                    value={aiQuestion}
                    onChange={(e) => setAiQuestion(e.target.value)}
                    placeholder="Ask the AI for help..."
                    className="flex-grow px-4 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={handleAskAI}
                    className="px-4 py-2 bg-blue-600 text-white font-medium rounded-r-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    Ask
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Student Dashboard</h1>
          <p className="text-gray-600">Track your courses, materials, and progress</p>
        </header>
        
        {activePage === 'dashboard' ? renderDashboard() : renderCourseDetails()}
      </div>
    </div>
  );
};

export default StudentDashboard;