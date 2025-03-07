// Create a new file: api/departmentService.ts (or modify existing one)

import apiClient from './apiClient';

export interface Department {
  id: number;
  name: string;
  description: string | null;
  location: string | null;
}

// Function to fetch departments without requiring auth
export const fetchPublicDepartments = async (): Promise<Department[]> => {
  try {
    // Create a dedicated endpoint call that doesn't require authentication
    const response = await apiClient.get('/public/departments');
    return response.data;
  } catch (error) {
    console.error('Error fetching departments:', error);
    throw error;
  }
};

// Export the existing department service functions
export default {
  fetchPublicDepartments,
};