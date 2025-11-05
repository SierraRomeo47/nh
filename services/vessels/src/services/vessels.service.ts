import pool from '../config/database';

export interface Vessel {
  id: string;
  imo_number: string;
  name: string;
  organization_id: string;
  ship_type: string;
  gross_tonnage: number;
  deadweight_tonnage: number;
  engine_power_kw: number;
  flag_state: string;
  year_built: number;
  classification_society: string;
  created_at: Date;
  updated_at: Date;
  is_active: boolean;
}

export interface Organization {
  id: string;
  name: string;
  imo_company_number: string;
  registration_country: string;
}

export class VesselsService {
  async getAllVessels(userRole: string, userId: string, organizationId: string): Promise<Vessel[]> {
    let query = `
      SELECT s.* FROM ships s
      WHERE s.is_active = true
    `;
    
    const params: any[] = [];
    
    // Filter based on role
    if (userRole === 'CREW' || userRole === 'ENGINEER' || userRole === 'CAPTAIN' || userRole === 'CHIEF_ENGINEER') {
      // Vessel-specific users see only their assigned vessel
      query += ` AND s.id IN (
        SELECT ship_id FROM vessel_crew_assignments WHERE user_id = $1 AND is_active = true
      )`;
      params.push(userId);
    } else if (userRole === 'ADMIN') {
      // Admins see ALL vessels (no filter)
      // No additional WHERE clause
    } else if (userRole === 'MANAGER') {
      // Managers see all vessels in their organization
      query += ` AND s.organization_id = $1`;
      params.push(organizationId);
    }
    
    query += ` ORDER BY s.name`;
    
    const result = await pool.query(query, params);
    return result.rows;
  }
  
  async getVesselById(vesselId: string): Promise<Vessel | null> {
    const result = await pool.query('SELECT * FROM ships WHERE id = $1', [vesselId]);
    return result.rows[0] || null;
  }
  
  async getVesselByIMO(imoNumber: string): Promise<Vessel | null> {
    const result = await pool.query('SELECT * FROM ships WHERE imo_number = $1', [imoNumber]);
    return result.rows[0] || null;
  }
  
  async getFleetOverview(organizationId: string, userRole: string): Promise<any> {
    let query = `
      SELECT 
        COUNT(*) as total_vessels,
        COUNT(CASE WHEN id IN (SELECT DISTINCT ship_id FROM voyages WHERE status = 'ACTIVE') THEN 1 END) as active_voyages,
        COUNT(CASE WHEN id NOT IN (SELECT DISTINCT ship_id FROM voyages WHERE status = 'ACTIVE') THEN 1 END) as in_port
      FROM ships
      WHERE is_active = true
    `;
    
    const params: any[] = [];
    
    // Filter based on role
    if (userRole === 'ADMIN') {
      // Admins see ALL vessels (no filter)
      // No additional WHERE clause
    } else {
      // Others see vessels in their organization
      query += ` AND organization_id = $1`;
      params.push(organizationId);
    }
    
    const statsResult = await pool.query(query, params);
    return statsResult.rows[0];
  }
  
  async getOrganization(id: string): Promise<Organization | null> {
    const result = await pool.query('SELECT * FROM organizations WHERE id = $1', [id]);
    return result.rows[0] || null;
  }
}

export default new VesselsService();

