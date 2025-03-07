import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

// Create axios instance
const apiClient = axios.create({
  baseURL: 'http://localhost:8000/api', // Change this to your Laravel API URL
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Interceptor to add auth token to requests
apiClient.interceptors.request.use(
  async (config) => {
    const token = await SecureStore.getItemAsync('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor to handle response errors
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    // Handle 401 (Unauthorized) errors
    if (error.response && error.response.status === 401) {
      // Clear token and redirect to login if token is invalid
      await SecureStore.deleteItemAsync('auth_token');
      
      // You might want to redirect to login or handle this differently
      // This depends on your navigation setup
    }
    return Promise.reject(error);
  }
);

export default apiClient;