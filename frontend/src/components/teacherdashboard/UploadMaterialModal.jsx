import React, { useState } from 'react';

const UploadMaterialModal = ({ onClose, onUpload }) => {
  const [materialData, setMaterialData] = useState({
    title: '',
    type: 'pdf',
    file: null,
    url: '#'  // In a real app, this would be set after file upload
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setMaterialData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setMaterialData(prev => ({ ...prev, file: e.target.files[0] }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpload({
      title: materialData.title,
      type: materialData.type,
      url: materialData.url
    });
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
      <div className="relative mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Upload Course Material</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
            <input
              type="text"
              id="title"
              name="title"
              value={materialData.title}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="type" className="block text-sm font-medium text-gray-700">Material Type</label>
            <select
              id="type"
              name="type"
              value={materialData.type}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="pdf">PDF Document</option>
              <option value="slides">Presentation Slides</option>
              <option value="video">Video</option>
              <option value="book">Book/Textbook</option>
            </select>
          </div>
          
          <div className="mb-4">
            <label htmlFor="file" className="block text-sm font-medium text-gray-700">Upload File</label>
            <input
              type="file"
              id="file"
              name="file"
              onChange={handleFileChange}
              className="mt-1 block w-full py-2 px-3"
              required
            />
          </div>
          
          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="mr-2 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Upload Material
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UploadMaterialModal;