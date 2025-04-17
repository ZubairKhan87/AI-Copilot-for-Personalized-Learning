import React, { useState } from 'react';
import MaterialsList from './MaterialsList';
import QuizList from './QuizList';
import StudentPerformance from './StudentPerformance';
import UploadMaterialModal from './UploadMaterialModal';
import GenerateQuizModal from './GenerateQuizModal';

const CourseDetails = ({ course, onBack, onAddMaterial, onGenerateQuiz }) => {
  const [activeTab, setActiveTab] = useState('materials');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showGenerateQuizModal, setShowGenerateQuizModal] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState(null);

  const handleGenerateQuiz = (materialId) => {
    setSelectedMaterial(materialId);
    setShowGenerateQuizModal(true);
  };

  const tabStyle = (tabName) => `px-4 py-2 font-medium ${
    activeTab === tabName 
      ? 'border-b-2 border-blue-600 text-blue-600' 
      : 'text-gray-500 hover:text-gray-700'
  }`;

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">{course.title}</h2>
          <button
            onClick={onBack}
            className="cursor-pointer py-2 px-4 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-75"
          >
            Back to Dashboard
          </button>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-2/3">
            <div className="mb-4 border-b border-gray-200">
              <nav className="flex -mb-px">
                <button 
                  onClick={() => setActiveTab('materials')} 
                  className={tabStyle('materials')}
                >
                  Course Materials
                </button>
                <button 
                  onClick={() => setActiveTab('quizzes')} 
                  className={tabStyle('quizzes')}
                >
                  Quizzes & Assessments
                </button>
                <button 
                  onClick={() => setActiveTab('students')} 
                  className={tabStyle('students')}
                >
                  Student Performance
                </button>
              </nav>
            </div>

            {activeTab === 'materials' && (
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Course Materials</h3>
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="cursor-pointer py-1 px-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-75"
                >
                  Upload Material
                </button>
              </div>
            )}

            {activeTab === 'materials' && (
              <MaterialsList 
                materials={course.materials} 
                onGenerateQuiz={handleGenerateQuiz}
              />
            )}
            
            {activeTab === 'quizzes' && (
              <QuizList quizzes={course.quizzes} />
            )}
            
            {activeTab === 'students' && (
              <StudentPerformance students={course.studentPerformance} />
            )}
          </div>
          
          <div className="w-full md:w-1/3">
            <div className="p-6 mb-6 bg-blue-50 rounded-lg">
              <h3 className="text-lg font-bold mb-3">Course Statistics</h3>
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm font-medium block">Students</span>
                  <span className="text-lg font-bold">{course.students}</span>
                </div>
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
            </div>
            
            <div className="p-6 bg-green-50 rounded-lg mb-6">
              <h3 className="text-lg font-bold mb-3">Teaching Analysis</h3>
              <p className="text-sm text-gray-700 mb-3">
                Students are showing good understanding of the core concepts, with {course.averageScore}% average score across all quizzes.
              </p>
              <p className="text-sm text-gray-700">
                Consider creating additional materials on {
                  course.quizzes.length > 0 
                    ? `topics related to "${course.quizzes.sort((a, b) => a.avgScore - b.avgScore)[0].title}"` 
                    : 'foundational concepts'
                } as students seem to need more support in this area.
              </p>
            </div>
            
            <div className="bg-yellow-50 rounded-lg p-6">
              <h3 className="text-lg font-bold mb-3">AI Suggestions</h3>
              <div className="space-y-3">
                <div className="p-3 bg-white rounded-lg border border-gray-200">
                  <p className="text-sm font-medium mb-1">Content Recommendation:</p>
                  <p className="text-sm">
                    Based on quiz results, students need more examples on {
                      course.quizzes.length > 0 
                        ? course.quizzes.sort((a, b) => a.avgScore - b.avgScore)[0].title.split(':')[0]
                        : 'fundamental concepts'
                    }.
                  </p>
                </div>
                <div className="p-3 bg-white rounded-lg border border-gray-200">
                  <p className="text-sm font-medium mb-1">Engagement Insight:</p>
                  <p className="text-sm">
                    {course.studentPerformance.length > 0 
                      ? `${course.studentPerformance.filter(s => s.progress < 50).length} students` 
                      : 'Some students'} 
                    are falling behind. Consider scheduling a review session.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showUploadModal && (
        <UploadMaterialModal 
          onClose={() => setShowUploadModal(false)}
          onUpload={(material) => {
            onAddMaterial(material);
            setShowUploadModal(false);
          }}
        />
      )}

      {showGenerateQuizModal && (
        <GenerateQuizModal 
          onClose={() => setShowGenerateQuizModal(false)}
          onGenerate={(quizTitle) => {
            onGenerateQuiz(selectedMaterial, quizTitle);
            setShowGenerateQuizModal(false);
          }}
          materialId={selectedMaterial}
          materialTitle={course.materials.find(m => m.id === selectedMaterial)?.title}
        />
      )}
    </div>
  );
};

export default CourseDetails;