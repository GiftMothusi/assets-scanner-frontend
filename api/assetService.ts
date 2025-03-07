// api/assetService.ts

import apiClient from './apiClient';

export interface Asset {
  id: number;
  asset_code: string;
  name: string;
  description: string | null;
  purchase_date: string | null;
  purchase_cost: number | null;
  expected_lifetime_months: number | null;
  current_condition: 'good' | 'fair' | 'poor' | 'damaged';
  is_active: boolean;
  department_id: number | null;
  user_id: number | null;
  last_scanned_at: string | null;
  notes: string | null;
  primary_image_path: string | null;
  created_at: string;
  updated_at: string;
  department?: {
    id: number;
    name: string;
  };
}

export interface AssetCounts {
  department_name: string;
  total: number;
}

export interface ConditionCounts {
  current_condition: string;
  total: number;
}

export interface AssetPagination {
  current_page: number;
  data: Asset[];
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  links: Array<{url: string | null, label: string, active: boolean}>;
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
  total: number;
}

const assetService = {
  /**
   * Get all assets with optional filtering
   */
  async getAssets(params?: {
    page?: number;
    department_id?: number;
    condition?: string;
    search?: string;
  }): Promise<AssetPagination> {
    try {
      const response = await apiClient.get('/assets', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching assets:', error);
      throw error;
    }
  },

  /**
   * Get a single asset by ID
   */
  async getAsset(id: number): Promise<Asset> {
    try {
      const response = await apiClient.get(`/assets/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching asset #${id}:`, error);
      throw error;
    }
  },

  /**
   * Get asset counts by department
   */
  async getAssetCountsByDepartment(): Promise<AssetCounts[]> {
    try {
      const response = await apiClient.get('/assets/counts/department');
      return response.data;
    } catch (error) {
      console.error('Error fetching asset counts by department:', error);
      throw error;
    }
  },

  /**
   * Get asset counts by condition
   */
  async getAssetCountsByCondition(): Promise<ConditionCounts[]> {
    try {
      const response = await apiClient.get('/assets/counts/condition');
      return response.data;
    } catch (error) {
      console.error('Error fetching asset counts by condition:', error);
      throw error;
    }
  },

  /**
   * Get total asset count
   */
  async getTotalAssetCount(): Promise<number> {
    try {
      const response = await apiClient.get('/assets/counts/total');
      return response.data.total;
    } catch (error) {
      console.error('Error fetching total asset count:', error);
      throw error;
    }
  },

    /**
   * Assets report by department
   */
  async getAssetsByDepartment(departmentName: string): Promise<AssetPagination> {
    try {
      const response = await apiClient.get('/assets/by-department', { 
        params: { department: departmentName } 
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching assets by department:', error);
      throw error;
    }
  },

    /**
   * Assets report by condition
   */

  async getAssetsByCondition(condition: string): Promise<AssetPagination> {
    try {
      const response = await apiClient.get('/assets/by-condition', { 
        params: { condition } 
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching assets by condition:', error);
      throw error;
    }
  },
  
//     /**
//    * Recently scanned assets
//    */
//   async getRecentlyScannedAssets(): Promise<AssetPagination> {
//     try {
//       const response = await apiClient.get('/assets/recently-scanned');
//       return response.data;
//     } catch (error) {
//       console.error('Error fetching recently scanned assets:', error);
//       throw error;
//     }
//   },

  async getRecentlyScannedAssets(): Promise<AssetPagination> {
    try {
      const response = await apiClient.get('/assets/recently-scanned');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching recently scanned assets:', error.response?.data || error.message);
      
      // If no recently scanned assets, return an empty pagination object
      if (error.response?.status === 404) {
        return {
          current_page: 1,
          data: [],
          first_page_url: '',
          from: 0,
          last_page: 1,
          last_page_url: '',
          links: [],
          next_page_url: null,
          path: '',
          per_page: 15,
          prev_page_url: null,
          to: 0,
          total: 0
        };
      }
      
      throw error;
    }
  },

  /**
   * Search assets
   */
  async searchAssets(query: string): Promise<AssetPagination> {
    try {
      const response = await apiClient.get('/assets/search', {
        params: { query }
      });
      return response.data;
    } catch (error) {
      console.error('Error searching assets:', error);
      throw error;
    }
  }
};



export default assetService;