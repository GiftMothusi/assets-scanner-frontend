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
      console.log('Using auth token:', token.substring(0, 10) + '...');
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.warn('No auth token found in SecureStore');
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Function to check if user is authenticated
export const checkAuthStatus = async () => {
  try {
    const token = await SecureStore.getItemAsync('auth_token');
    if (!token) {
      console.log('No authentication token found');
      return false;
    }
    
    // Try to get the current user to verify token is valid
    const response = await apiClient.get('/user');
    console.log('Auth check successful, user:', response.data);
    return true;
  } catch (error) {
    console.error('Authentication check failed:', error);
    return false;
  }
};

// Interceptor to handle response errors
apiClient.interceptors.response.use(
  (response) => {
    console.log('API Response:', {
      url: response.config.url,
      method: response.config.method,
      status: response.status,
      data: response.data
    });
    return response;
  },
  async (error) => {
    // Log detailed error information for debugging
    console.error('API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      requestData: error.config?.data,
      status: error.response?.status,
      responseData: error.response?.data,
      message: error.message
    });
    
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