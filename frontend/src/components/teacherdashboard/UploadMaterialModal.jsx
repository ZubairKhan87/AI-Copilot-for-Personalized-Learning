import React, { useState, useEffect } from 'react';

const UploadMaterialModal = ({ courseId, onClose, onUpload }) => {
  const [materialData, setMaterialData] = useState({
    title: '',
    type: 'pdf',
    file: null,
    description: '',
    week_name: 'Week 1'
  });
  const [weeks, setWeeks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch available weeks/timestamps
  useEffect(() => {
    const fetchWeeks = async () => {
      try {
        const accessToken = localStorage.getItem('access');
        console.log("access token at teacher dashboard ",accessToken)
        // if (!accessToken) {
        //   console.error('Authentication token not found');
        //   // Consider redirecting to login here
        //   return;
        // }
        
        const response = await fetch('http://localhost:8000/api/course/timestamps/', {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch weeks');
        }
        
        const data = await response.json();
        setWeeks(data);
      } catch (err) {
        console.error('Error fetching weeks:', err);
        setError('Failed to load weeks. Please try again.');
      }
    };
    
    fetchWeeks();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setMaterialData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setMaterialData(prev => ({ ...prev, file: e.target.files[0] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append('file', materialData.file);
      formData.append('title', materialData.title);
      formData.append('description', materialData.description);
      formData.append('week_name', materialData.week_name);
      formData.append('course_id', courseId);
      console.log("course id at upload material modal",courseId)
      console.log("formData",formData)
      const accessToken = localStorage.getItem('access');
      console.log("access token at teacher dashboard ",accessToken)
      console.log(accessToken)
      const response = await fetch('http://localhost:8000/api/course/upload-material/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
        body: formData
      });
      
      if (!response.ok) {
        throw new Error('Upload failed');
      }
      
      const uploadedMaterial = await response.json();
      console.log("uploaded material",uploadedMaterial)
      // Call the onUpload prop function with the new material
      onUpload({
        id: uploadedMaterial.id,
        title: uploadedMaterial.attachment_name,
        type: materialData.type,
        url: uploadedMaterial.attachment_file,
        uploadDate: uploadedMaterial.attachment_date
      });
      
      onClose();
    } catch (err) {
      console.error('Error uploading material:', err);
      setError('Failed to upload material. Please try again.');
    } finally {
      setIsLoading(false);
    }
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
        
        {error && (
          <div className="mb-4 p-2 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
        
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
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              id="description"
              name="description"
              value={materialData.description}
              onChange={handleChange}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              rows="3"
            ></textarea>
          </div>
          
          <div className="mb-4">
            <label htmlFor="week_name" className="block text-sm font-medium text-gray-700">Week</label>
            <select
              id="week_name"
              name="week_name"
              value={materialData.week_name}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              {weeks.length > 0 ? (
                weeks.map(week => (
                  <option key={week.id} value={week.week_name}>{week.week_name}</option>
                ))
              ) : (
                <option value="Week 1">Week 1</option>
              )}
              <option value="new">+ Add New Week</option>
            </select>
          </div>
          
          {materialData.week_name === 'new' && (
            <div className="mb-4">
              <label htmlFor="new_week" className="block text-sm font-medium text-gray-700">New Week Name</label>
              <input
                type="text"
                id="new_week"
                name="week_name"
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Week 2"
                required
              />
            </div>
          )}
          
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
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              disabled={isLoading}
            >
              {isLoading ? 'Uploading...' : 'Upload Material'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UploadMaterialModal;