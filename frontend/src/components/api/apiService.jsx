import axios from 'axios';

const API_URL = 'http://localhost:8000/api/';  

const apiService = {
  // Configure axios instance with authentication token
  getAxiosInstance() {
    const token = localStorage.getItem('access');
    return axios.create({
      baseURL: API_URL,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    });
  },
  
  // Get file upload instance (with multipart/form-data)
  getFileUploadInstance() {
    const token = localStorage.getItem('access');
    return axios.create({
      baseURL: API_URL,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      }
    });
  },
  
  // Get all materials for a course
  async getCourseMaterials(courseId) {
    try {
      const response = await this.getAxiosInstance().get(`attachments/?course_id=${courseId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching course materials:', error);
      throw error;
    }
  },
  
  // Upload a new material
  async uploadMaterial(materialData) {
    try {
      // Create form data for file upload
      const formData = new FormData();
      formData.append('file', materialData.file);
      formData.append('title', materialData.title);
      formData.append('description', materialData.description || '');
      formData.append('course_id', materialData.courseId);
      formData.append('weak_id', materialData.weakId);
      
      const response = await this.getFileUploadInstance().post('attachments/', formData);
      return response.data;
    } catch (error) {
      console.error('Error uploading material:', error);
      throw error;
    }
  },
  
  // Delete a material
  async deleteMaterial(materialId) {
    try {
      await this.getAxiosInstance().delete(`attachments/${materialId}/`);
      return true;
    } catch (error) {
      console.error('Error deleting material:', error);
      throw error;
    }
  }
};

export default apiService;