import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import MaterialQuiz from './MaterialQuiz';

const CourseDetail = () => {
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [showQuiz, setShowQuiz] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState(null);

  useEffect(() => {
    const fetchCourseDetail = async () => {
      try {
        const token = localStorage.getItem('access');
        
        if (!token) {
          navigate('/student-login');
          return;
        }

        // Fetch course details
        const courseResponse = await axios.get(
          `http://localhost:8000/api/course/course-detail/${courseId}/`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        // Fetch material quiz attempts
        const attemptsResponse = await axios.get(
          `http://localhost:8000/api/course/student-material-quiz-attempts/${courseId}/`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        const courseData = courseResponse.data;
        const attempts = attemptsResponse.data;

        // Update course data with material quiz attempts
        courseData.materialQuizAttempts = attempts;

        setCourse(courseData);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to fetch course details');
        setLoading(false);
        if (err.response?.status === 401) {
          localStorage.removeItem('access');
          localStorage.removeItem('refresh');
          navigate('/student-login');
        }
      }
    };

    fetchCourseDetail();
  }, [courseId, navigate]);

  // Updated download function to match your token storage and backend endpoint
  const downloadFile = async (attachmentId, fileName) => {
    try {
      const downloadUrl = `http://localhost:8000/api/course/download-attachment/${attachmentId}/`;
      
      // Get the auth token (using 'access' key as you store it)
      const token = localStorage.getItem('access');
      
      if (!token) {
        alert('Authentication required. Please login again.');
        navigate('/student-login');
        return;
      }
      
      // Fetch the file with authentication
      const response = await fetch(downloadUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('access');
          localStorage.removeItem('refresh');
          navigate('/student-login');
          return;
        }
        throw new Error(`Failed to download file: ${response.status}`);
      }

      // Get the blob from response
      const blob = await response.blob();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Error downloading file:', error);
      alert('Failed to download file. Please try again.');
    }
  };

  // Add function to handle starting quiz:
  const startMaterialQuiz = (material) => {
    setSelectedMaterial(material);
    setShowQuiz(true);
  };

  const handleBackFromQuiz = () => {
    setShowQuiz(false);
    setSelectedMaterial(null);
  };

  const tabs = [
    { id: 'overview', name: 'Overview', icon: '📋' },
    { id: 'materials', name: 'Materials', icon: '📚' },
    { id: 'quizzes', name: 'Quizzes', icon: '📝' },
    { id: 'performance', name: 'Performance', icon: '📊' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading course details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white shadow rounded-lg p-8 max-w-md w-full">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
              <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h3 className="mt-2 text-lg font-medium text-gray-900">Error Loading Course</h3>
            <p className="mt-1 text-sm text-gray-500">{error}</p>
            <button
              onClick={() => navigate('/student-dashboard')}
              className="mt-4 w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition duration-200"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/student-dashboard')}
                className="mr-4 p-2 text-gray-400 hover:text-gray-600"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{course.course_name}</h1>
                <p className="text-sm text-gray-500">Taught by: {course.teacher.name}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">
                {new Date(course.course_start_date).toLocaleDateString()} - {new Date(course.course_end_date).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Course Description</h2>
              <p className="text-gray-700 leading-relaxed">{course.course_description}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white shadow rounded-lg p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                    <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <div className="ml-5">
                    <h3 className="text-lg font-medium text-gray-900">Materials</h3>
                    <p className="text-sm text-gray-500">{Object.keys(course.materials).length} weeks</p>
                  </div>
                </div>
              </div>

              <div className="bg-white shadow rounded-lg p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                    <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="ml-5">
                    <h3 className="text-lg font-medium text-gray-900">Quizzes</h3>
                    <p className="text-sm text-gray-500">{course.quizzes.length} total</p>
                  </div>
                </div>
              </div>

              <div className="bg-white shadow rounded-lg p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-purple-500 rounded-md p-3">
                    <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div className="ml-5">
                    <h3 className="text-lg font-medium text-gray-900">Performance</h3>
                    <p className="text-sm text-gray-500">{course.performance || 'N/A'}%</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Materials Tab */}
        {activeTab === 'materials' && (
          <div className="space-y-6">
            {Object.keys(course.materials || {}).length > 0 ? (
              Object.entries(course.materials || {}).map(([week, materials]) => (
                <div key={week} className="bg-white shadow rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">{week}</h3>
                  <div className="space-y-3">
                    {materials.map((material) => (
                      <div key={material.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 bg-indigo-100 rounded-md p-2 mr-4">
                            <svg className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-gray-900">{material.name}</h4>
                            <p className="text-sm text-gray-500">{material.description}</p>
                            <p className="text-xs text-gray-400">Added: {material.date ? new Date(material.date).toLocaleDateString() : 'N/A'}</p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              console.log("Material object:", material);
                              if (material.id && material.name) {
                                downloadFile(material.id, material.name);
                              } else {
                                console.error('Material ID or name is missing:', material);
                                alert('Cannot download file: Missing file information');
                              }
                            }}
                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                          >
                            Download
                          </button>
                          <button
                            onClick={() => {
                              console.log("Starting quiz for material:", material);
                              startMaterialQuiz(material);
                            }}
                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                          >
                            <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            Start Quiz
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white shadow rounded-lg p-6 text-center">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No materials available</h3>
                <p className="mt-1 text-sm text-gray-500">Materials will appear here when added by your instructor.</p>
              </div>
            )}
          </div>
        )}

        {/* Quizzes Tab */}
        {activeTab === 'quizzes' && (
          <div className="space-y-6">
            {/* Regular Course Quizzes */}
            {course.quizzes.length > 0 && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Course Quizzes</h3>
                <div className="space-y-4">
                  {course.quizzes.map((quiz) => (
                    <div key={quiz.id} className="bg-white shadow rounded-lg p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center">
                            <h4 className="text-lg font-medium text-gray-900">{quiz.name}</h4>
                            {quiz.completed && (
                              <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Completed
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{quiz.description}</p>
                          <div className="flex items-center mt-2 text-sm text-gray-500">
                            <span className="mr-4">
                              Start: {new Date(quiz.quiz_date).toLocaleDateString()}
                            </span>
                            <span>
                              End: {new Date(quiz.quiz_end_date).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <div className="ml-6 text-right">
                          {quiz.completed ? (
                            <div>
                              <p className="text-sm text-gray-500">Score</p>
                              <p className="text-2xl font-bold text-green-600">{quiz.score}%</p>
                            </div>
                          ) : (
                            <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                              Take Quiz
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Material-Based Quizzes */}
            {course.materialQuizAttempts && course.materialQuizAttempts.length > 0 && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Material-Based Quiz Attempts</h3>
                <div className="space-y-4">
                  {course.materialQuizAttempts.map((attempt) => (
                    <div key={attempt.id} className="bg-white shadow rounded-lg p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center">
                            <h4 className="text-lg font-medium text-gray-900">{attempt.quiz_title}</h4>
                            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              Material Quiz
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">Based on: {attempt.material_name}</p>
                          <div className="flex items-center mt-2 text-sm text-gray-500">
                            <span className="mr-4">
                              Attempted: {new Date(attempt.attempt_date).toLocaleDateString()}
                            </span>
                            <span>
                              Questions: {attempt.answers_count}
                            </span>
                          </div>
                        </div>
                        <div className="ml-6 text-right">
                          <p className="text-sm text-gray-500">Score</p>
                          <p className="text-2xl font-bold text-blue-600">{attempt.percentage_score.toFixed(1)}%</p>
                          <p className="text-sm text-gray-500">{attempt.total_score}/{attempt.max_possible_score} points</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* No Quizzes Message */}
            {course.quizzes.length === 0 && (!course.materialQuizAttempts || course.materialQuizAttempts.length === 0) && (
              <div className="bg-white shadow rounded-lg p-6 text-center">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No quizzes available</h3>
                <p className="mt-1 text-sm text-gray-500">Quizzes will appear here when created by your instructor or when you attempt material-based quizzes.</p>
              </div>
            )}
          </div>
        )}

        {/* Performance Tab */}
        {activeTab === 'performance' && (
          <div className="space-y-6">
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Overall Performance</h3>
              <div className="flex items-center">
                <div className="flex-1">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Course Progress</span>
                    <span>{course.performance || 0}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-indigo-600 h-2 rounded-full" 
                      style={{ width: `${course.performance || 0}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Quiz Performance</h3>
              <div className="space-y-4">
                {course.quizzes.filter(quiz => quiz.completed).map((quiz) => (
                  <div key={quiz.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">{quiz.name}</h4>
                      <p className="text-sm text-gray-500">Completed on {new Date(quiz.quiz_end_date).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold">{quiz.score}%</p>
                      <p className={`text-sm ${quiz.score >= 70 ? 'text-green-600' : 'text-red-600'}`}>
                        {quiz.score >= 70 ? 'Passed' : 'Failed'}
                      </p>
                    </div>
                  </div>
                ))}
                {course.quizzes.filter(quiz => quiz.completed).length === 0 && (
                  <p className="text-gray-500 text-center py-4">No completed quizzes yet.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      
      {showQuiz && selectedMaterial && (
        <MaterialQuiz 
          material={selectedMaterial} 
          onBack={handleBackFromQuiz}
        />
      )}
    </div>
  );
};

export default CourseDetail;