import apiClient from './apiClient';

export interface Department {
  id: number;
  name: string;
  description: string | null;
  location: string | null;
  created_at: string;
  updated_at: string;
}

const departmentService = {
  /**
   * Get all departments
   */
  async getAllDepartments(): Promise<Department[]> {
    try {
      const response = await apiClient.get<Department[]>('/departments');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get a department by ID
   */
  async getDepartmentById(id: number): Promise<Department> {
    try {
      const response = await apiClient.get<Department>(`/departments/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Create a new department
   */
  async createDepartment(data: { name: string; description?: string; location?: string }): Promise<Department> {
    try {
      const response = await apiClient.post<Department>('/departments', data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Update a department
   */
  async updateDepartment(
    id: number,
    data: { name?: string; description?: string; location?: string }
  ): Promise<Department> {
    try {
      const response = await apiClient.put<Department>(`/departments/${id}`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Delete a department
   */
  async deleteDepartment(id: number): Promise<void> {
    try {
      await apiClient.delete(`/departments/${id}`);
    } catch (error) {
      throw error;
    }
  },
};

export default departmentService;