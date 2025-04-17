import React, { useState } from 'react';

const GenerateQuizModal = ({ onClose, onGenerate, materialId, materialTitle }) => {
  const [quizData, setQuizData] = useState({
    title: `Quiz on ${materialTitle || 'Selected Material'}`,
    questionCount: 10,
    difficulty: 'medium',
    includeFeedback: true
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setQuizData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onGenerate(quizData.title);
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
      <div className="relative mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Generate Quiz from Material</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="mb-4">
          <p className="text-sm text-gray-600">
            Generating quiz based on: <span className="font-medium">{materialTitle}</span>
          </p>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">Quiz Title</label>
            <input
              type="text"
              id="title"
              name="title"
              value={quizData.title}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="questionCount" className="block text-sm font-medium text-gray-700">Number of Questions</label>
            <input
              type="number"
              id="questionCount"
              name="questionCount"
              min="5"
              max="20"
              value={quizData.questionCount}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700">Difficulty Level</label>
            <select
              id="difficulty"
              name="difficulty"
              value={quizData.difficulty}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
          
          <div className="mb-4 flex items-center">
            <input
              type="checkbox"
              id="includeFeedback"
              name="includeFeedback"
              checked={quizData.includeFeedback}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="includeFeedback" className="ml-2 block text-sm text-gray-700">
              Include personalized feedback for each question
            </label>
          </div>
          
          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="cursor-pointer mr-2 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="cursor-pointer py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
              Generate Quiz
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GenerateQuizModal;