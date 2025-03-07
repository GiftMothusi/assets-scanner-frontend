import * as SecureStore from 'expo-secure-store';
import apiClient from './apiClient';

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'scanner';
  department_id: number | null;
  created_at: string;
  updated_at: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  role: 'admin' | 'manager' | 'scanner';
  department_id?: number;
}

export interface AuthResponse {
  user: User;
  token: string;
  message: string;
}

const authService = {
  /**
   * Login the user and store the token
   */
  async login(credentials: LoginCredentials): Promise<User> {
    try {
      const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
      const { token, user } = response.data;
      
      // Store the token securely
      await SecureStore.setItemAsync('auth_token', token);
      
      return user;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Register a new user and login automatically
   */
  async register(data: RegisterData): Promise<User> {
    try {
      const response = await apiClient.post<AuthResponse>('/auth/register', data);
      const { token, user } = response.data;
      
      // Store the token securely
      await SecureStore.setItemAsync('auth_token', token);
      
      return user;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get the currently authenticated user
   */
  async getCurrentUser(): Promise<User | null> {
    try {
      const token = await SecureStore.getItemAsync('auth_token');
      
      if (!token) {
        return null;
      }
      
      const response = await apiClient.get<{ user: User }>('/user');
      return response.data.user;
    } catch (error) {
      return null;
    }
  },

  /**
   * Logout the user and clear the token
   */
  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Always clear the token even if the API call fails
      await SecureStore.deleteItemAsync('auth_token');
    }
  },

  /**
   * Check if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    const token = await SecureStore.getItemAsync('auth_token');
    return !!token;
  },
};

export default authService;