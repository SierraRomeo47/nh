import pool from '../config/database';

export interface Fleet {
  id: string;
  name: string;
  organization_id: string;
  description: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export class FleetsService {
  async getAllFleets(organizationId: string, userRole?: string): Promise<Fleet[]> {
    // Admins see all fleets, others see only their organization's fleets
    if (userRole === 'ADMIN') {
      const result = await pool.query(`
        SELECT * FROM fleets
        WHERE is_active = true
        ORDER BY name
      `);
      return result.rows;
    }
    
    const result = await pool.query(`
      SELECT * FROM fleets
      WHERE organization_id = $1 AND is_active = true
      ORDER BY name
    `, [organizationId]);
    
    return result.rows;
  }
  
  async getFleetById(fleetId: string): Promise<Fleet | null> {
    const result = await pool.query('SELECT * FROM fleets WHERE id = $1', [fleetId]);
    return result.rows[0] || null;
  }
  
  async getFleetVessels(fleetId: string): Promise<any[]> {
    const result = await pool.query(`
      SELECT s.*
      FROM ships s
      INNER JOIN fleet_vessels fv ON s.id = fv.ship_id
      WHERE fv.fleet_id = $1 AND s.is_active = true
      ORDER BY s.name
    `, [fleetId]);
    
    return result.rows;
  }
}

export default new FleetsService();

