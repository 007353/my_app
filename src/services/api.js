import axios from 'axios';

// Use environment variable for API URL
const API_URL = process.env.REACT_APP_API_URL || 'https://flask-2d-to-3d.onrender.com';

// Create axios instance with base URL
const apiClient = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    }
});

const api = {
  async uploadImage(file) {
    const formData = new FormData();
    formData.append('image', file);
    
    try {
      const response = await apiClient.post('/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Log detailed upload response for debugging
      console.log('Upload Response:', {
        sessionId: response.data.session_id,
        resizedImagePath: response.data.resized_image_path,
        fullResizedPath: response.data.full_resized_path,
        imageLength: response.data.image ? response.data.image.length : 'No image',
      });

      return response.data;
    } catch (error) {
      console.error('Error uploading image:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      throw error;
    }
  },
  
  async calculateScaleFactors(sessionId, points, xLengthFeet, yLengthFeet) {
    try {
      const response = await apiClient.post('/api/calculate-scale', {
        session_id: sessionId,
        points: points,
        x_length_feet: xLengthFeet,
        y_length_feet: yLengthFeet
      });
      return response.data;
    } catch (error) {
      console.error('Error calculating scale factors:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      throw error;
    }
  },
  
  async detectFurniture(sessionId) {
    try {
      const response = await apiClient.post('/api/detect', {
        session_id: sessionId
      });
      return response.data;
    } catch (error) {
      console.error('Error detecting furniture:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      throw error;
    }
  }
};

export default api;