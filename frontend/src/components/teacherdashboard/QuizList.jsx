import React from 'react';

const QuizList = ({ quizzes }) => {
  return (
    <div className="space-y-3">
      <h3 className="text-xl font-bold mb-4">Quizzes & Assessments</h3>
      
      {quizzes.map(quiz => (
        <div key={quiz.id} className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
          <div className="p-2 mr-4 bg-purple-100 rounded-full">
            <svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
              <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="flex-grow">
            <h4 className="font-medium">{quiz.title}</h4>
            <p className="text-sm text-gray-500">
              Generated from: {quiz.generatedFrom}
            </p>
          </div>
          <div className="flex items-center space-x-6 mr-4">
            <div className="text-center">
              <span className="text-sm text-gray-500 block">Avg. Score</span>
              <span className="text-lg font-bold text-blue-600">{quiz.avgScore}%</span>
            </div>
            <div className="text-center">
              <span className="text-sm text-gray-500 block">Submission Rate</span>
              <span className="text-lg font-bold text-green-600">{quiz.submissionRate}%</span>
            </div>
          </div>
          <div className="flex space-x-2">
            <button className="px-3 py-1 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700">
              View Results
            </button>
            <button className="px-3 py-1 bg-gray-200 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-300">
              Edit Quiz
            </button>
          </div>
        </div>
      ))}
      
      {quizzes.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">No quizzes generated yet.</p>
        </div>
      )}
    </div>
  );
};

export default QuizList;