import axios from 'axios';

const BASE_URL = "http://localhost:8080/api/v1";

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

// Request interceptor for logging requests
axiosInstance.interceptors.request.use(
  (config) => {
    console.log('Request:', config);
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for logging responses
axiosInstance.interceptors.response.use(
  (response) => {
    console.log('Response:', response);
    return response;
  },
  (error) => {
    if (error.response) {
      // Server responded with a status other than 2xx
      console.error('Response error:', error.response.data);
    } else if (error.request) {
      // Request was made but no response received
      console.error('No response:', error.request);
    } else {
      // Something else caused an error
      console.error('Error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
