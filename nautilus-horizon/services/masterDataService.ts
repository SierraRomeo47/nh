/**
 * Master Data Service
 * 
 * Single source of truth for all master data across the application.
 * All pages should use this service to access vessel, organization, user, and reference data
 * to ensure consistency throughout the web app.
 */

const API_BASE_URL = 'http://localhost:8080/master-data';

export interface Vessel {
  vessel_id: string;
  imo_number: string;
  vessel_name: string;
  vessel_type: string;
  organization_id: string;
  gt: number;
  dwt: number;
  year_built: number;
  vessel_age: number;
  flag_state: string;
  classification_society: string;
  operational_status: string;
  current_port?: string;
  min_speed?: number;
  max_speed?: number;
  service_speed_knots?: number;
  port_consumption_tonnes_day?: number;
  sea_consumption_tonnes_day?: number;
  has_whr?: boolean;
  has_sgm?: boolean;
  has_vfd?: boolean;
  cii_rating?: string;
  safety_rating?: string;
  captain_name?: string;
  is_active: boolean;
}

export interface VesselSelector {
  value: string;
  label: string;
  display_name: string;
  imo_number: string;
  vessel_type: string;
  operational_status: string;
}

export interface Organization {
  organization_id: string;
  organization_name: string;
  organization_type: string;
  imo_company_number?: string;
  registration_country: string;
  contact_email?: string;
  contact_phone?: string;
  is_active: boolean;
}

export interface User {
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  role: string;
  organization_id: string;
  job_title?: string;
  department?: string;
  is_active: boolean;
}

export interface Port {
  value: string;
  label: string;
  display_name: string;
  country: string;
  latitude?: number;
  longitude?: number;
}

export interface FleetSummary {
  total_vessels: number;
  active_voyages: number;
  vessels_in_port: number;
  total_gross_tonnage: number;
  total_eua_exposure: number;
  last_refreshed: string;
}

class MasterDataService {
  /**
   * Get all vessels from parent ships table
   */
  async getVessels(filters?: {
    organizationId?: string;
    vesselType?: string;
    active?: boolean;
  }): Promise<Vessel[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.organizationId) params.append('organizationId', filters.organizationId);
      if (filters?.vesselType) params.append('vesselType', filters.vesselType);
      if (filters?.active !== undefined) params.append('active', String(filters.active));

      const response = await fetch(`${API_BASE_URL}/vessels?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error fetching vessels from master data:', error);
      return [];
    }
  }

  /**
   * Get single vessel by ID or IMO
   */
  async getVesselById(identifier: string): Promise<Vessel | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/vessels/${identifier}`);
      
      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.data || null;
    } catch (error) {
      console.error('Error fetching vessel by ID:', error);
      return null;
    }
  }

  /**
   * Get vessel selector data for dropdowns (consistent across all pages)
   */
  async getVesselSelector(organizationId?: string): Promise<VesselSelector[]> {
    try {
      const params = organizationId ? `?organizationId=${organizationId}` : '';
      const response = await fetch(`${API_BASE_URL}/vessels/selector${params}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error fetching vessel selector:', error);
      return [];
    }
  }

  /**
   * Search vessels by name or IMO
   */
  async searchVessels(searchTerm: string): Promise<Vessel[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/vessels/search?q=${encodeURIComponent(searchTerm)}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error searching vessels:', error);
      return [];
    }
  }

  /**
   * Get all organizations from parent table
   */
  async getOrganizations(active = true): Promise<Organization[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/organizations?active=${active}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error fetching organizations:', error);
      return [];
    }
  }

  /**
   * Get organization by ID
   */
  async getOrganizationById(id: string): Promise<Organization | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/organizations/${id}`);
      
      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.data || null;
    } catch (error) {
      console.error('Error fetching organization by ID:', error);
      return null;
    }
  }

  /**
   * Get users from parent table
   */
  async getUsers(filters?: { organizationId?: string; role?: string }): Promise<User[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.organizationId) params.append('organizationId', filters.organizationId);
      if (filters?.role) params.append('role', filters.role);

      const response = await fetch(`${API_BASE_URL}/users?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error fetching users:', error);
      return [];
    }
  }

  /**
   * Get ports from parent table
   */
  async getPorts(search?: string): Promise<Port[]> {
    try {
      const params = search ? `?q=${encodeURIComponent(search)}` : '';
      const response = await fetch(`${API_BASE_URL}/ports${params}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error fetching ports:', error);
      return [];
    }
  }

  /**
   * Get fleet summary statistics (for dashboards)
   */
  async getFleetSummary(organizationId?: string): Promise<FleetSummary> {
    try {
      const params = organizationId ? `?organizationId=${organizationId}` : '';
      const response = await fetch(`${API_BASE_URL}/fleet/summary${params}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.data || {
        total_vessels: 0,
        active_voyages: 0,
        vessels_in_port: 0,
        total_gross_tonnage: 0,
        total_eua_exposure: 0,
        last_refreshed: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error fetching fleet summary:', error);
      return {
        total_vessels: 0,
        active_voyages: 0,
        vessels_in_port: 0,
        total_gross_tonnage: 0,
        total_eua_exposure: 0,
        last_refreshed: new Date().toISOString(),
      };
    }
  }

  /**
   * Get master data summary (for admin dashboard)
   */
  async getMasterDataSummary() {
    try {
      const response = await fetch(`${API_BASE_URL}/summary`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error fetching master data summary:', error);
      return [];
    }
  }
}

// Export singleton instance
export const masterDataService = new MasterDataService();
export default masterDataService;

