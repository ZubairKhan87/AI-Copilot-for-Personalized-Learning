import React from 'react';

const MaterialsList = ({ materials, onGenerateQuiz }) => {
  return (
    <div className="space-y-3">
      {materials.map(material => (
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
            <p className="text-sm text-gray-500">Uploaded on {material.uploadDate} • {material.type}</p>
          </div>
          <div className="flex space-x-2">
            <button 
              onClick={() => onGenerateQuiz(material.id)}
              className="cursor-pointer px-3 py-1 bg-purple-600 text-white text-sm font-medium rounded-md hover:bg-purple-700"
            >
              Generate Quiz
            </button>
            <a 
              href={material.url} 
              className="px-3 py-1 bg-blue-50 text-blue-700 text-sm font-medium rounded-md hover:bg-blue-100"
            >
              View
            </a>
          </div>
        </div>
      ))}
      {materials.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">No materials uploaded yet.</p>
        </div>
      )}
    </div>
  );
};

export default MaterialsList;