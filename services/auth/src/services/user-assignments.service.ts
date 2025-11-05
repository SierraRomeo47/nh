import pool from '../config/database';

export class UserAssignmentsService {
  async assignVessels(userId: string, vesselIds: string[]): Promise<void> {
    // Start transaction
    await pool.query('BEGIN');
    
    try {
      // Deactivate all existing vessel assignments
      await pool.query(`
        UPDATE user_vessel_assignments 
        SET is_active = false, updated_at = NOW()
        WHERE user_id = $1
      `, [userId]);
      
      // Create new active assignments
      for (const vesselId of vesselIds) {
        await pool.query(`
          INSERT INTO user_vessel_assignments (user_id, ship_id, is_active)
          VALUES ($1, $2, true)
          ON CONFLICT (user_id, ship_id) 
          DO UPDATE SET is_active = true, updated_at = NOW()
        `, [userId, vesselId]);
      }
      
      await pool.query('COMMIT');
    } catch (error) {
      await pool.query('ROLLBACK');
      throw error;
    }
  }
  
  async assignFleets(userId: string, fleetIds: string[]): Promise<void> {
    // Start transaction
    await pool.query('BEGIN');
    
    try {
      // Deactivate all existing fleet assignments
      await pool.query(`
        UPDATE user_fleet_assignments 
        SET is_active = false, updated_at = NOW()
        WHERE user_id = $1
      `, [userId]);
      
      // Create new active assignments
      for (const fleetId of fleetIds) {
        await pool.query(`
          INSERT INTO user_fleet_assignments (user_id, fleet_id, is_active)
          VALUES ($1, $2, true)
          ON CONFLICT (user_id, fleet_id) 
          DO UPDATE SET is_active = true, updated_at = NOW()
        `, [userId, fleetId]);
      }
      
      await pool.query('COMMIT');
    } catch (error) {
      await pool.query('ROLLBACK');
      throw error;
    }
  }
  
  async getUserAssignments(userId: string): Promise<any> {
    const [vesselsResult, fleetsResult] = await Promise.all([
      pool.query(`
        SELECT s.id, s.name, s.imo_number, s.ship_type
        FROM user_vessel_assignments uva
        INNER JOIN ships s ON uva.ship_id = s.id
        WHERE uva.user_id = $1 AND uva.is_active = true
      `, [userId]),
      pool.query(`
        SELECT f.id, f.name, f.description
        FROM user_fleet_assignments ufa
        INNER JOIN fleets f ON ufa.fleet_id = f.id
        WHERE ufa.user_id = $1 AND ufa.is_active = true
      `, [userId])
    ]);
    
    // Get vessels from fleet assignments to avoid double-counting
    const fleetVesselIds = new Set<string>();
    for (const fleet of fleetsResult.rows) {
      const fleetVesselsResult = await pool.query(`
        SELECT ship_id
        FROM fleet_vessels
        WHERE fleet_id = $1
      `, [fleet.id]);
      fleetVesselsResult.rows.forEach(row => fleetVesselIds.add(row.ship_id));
    }
    
    // Filter out vessels that are in fleet assignments (prioritize fleet access)
    const individualVessels = vesselsResult.rows.filter(v => !fleetVesselIds.has(v.id));
    
    return {
      vessels: individualVessels,
      fleets: fleetsResult.rows
    };
  }
}

export default new UserAssignmentsService();

