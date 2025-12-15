import { query } from '../config/database';

class MasterDataService {
  /**
   * Get all active vessels from parent ships table
   */
  async getVessels(filters?: { organizationId?: string; vesselType?: string; active?: boolean }) {
    let queryText = `
      SELECT * FROM vw_vessels_master
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramIndex = 1;

    if (filters?.organizationId) {
      queryText += ` AND organization_id = $${paramIndex}`;
      params.push(filters.organizationId);
      paramIndex++;
    }

    if (filters?.vesselType) {
      queryText += ` AND vessel_type = $${paramIndex}`;
      params.push(filters.vesselType);
      paramIndex++;
    }

    // Note: is_active filter is already applied in the view definition
    // so we don't need to filter again unless explicitly requesting inactive vessels

    queryText += ' ORDER BY vessel_name';

    const result = await query(queryText, params);
    return result.rows;
  }

  /**
   * Get single vessel by ID or IMO
   */
  async getVesselById(identifier: string) {
    // Try by UUID first
    let result = await query('SELECT * FROM vw_vessels_master WHERE vessel_id = $1', [identifier]);
    
    if (result.rows.length === 0) {
      // Try by IMO number
      result = await query('SELECT * FROM vw_vessels_master WHERE imo_number = $1', [identifier]);
    }

    return result.rows[0] || null;
  }

  /**
   * Get vessel selector data (for dropdowns)
   */
  async getVesselSelector(organizationId?: string) {
    let queryText = 'SELECT * FROM vw_vessel_selector';
    const params: any[] = [];

    if (organizationId) {
      queryText += ' WHERE organization_id = $1';
      params.push(organizationId);
    }

    const result = await query(queryText, params);
    return result.rows;
  }

  /**
   * Get all organizations
   */
  async getOrganizations(active = true) {
    const result = await query(
      'SELECT * FROM vw_organizations_master WHERE is_active = $1 ORDER BY organization_name',
      [active]
    );
    return result.rows;
  }

  /**
   * Get single organization by ID
   */
  async getOrganizationById(id: string) {
    const result = await query('SELECT * FROM vw_organizations_master WHERE organization_id = $1', [id]);
    return result.rows[0] || null;
  }

  /**
   * Get organization selector data (for dropdowns)
   */
  async getOrganizationSelector() {
    const result = await query('SELECT * FROM vw_organization_selector ORDER BY label');
    return result.rows;
  }

  /**
   * Get all active users
   */
  async getUsers(filters?: { organizationId?: string; role?: string }) {
    let queryText = 'SELECT * FROM vw_users_master WHERE 1=1';
    const params: any[] = [];
    let paramIndex = 1;

    if (filters?.organizationId) {
      queryText += ` AND organization_id = $${paramIndex}`;
      params.push(filters.organizationId);
      paramIndex++;
    }

    if (filters?.role) {
      queryText += ` AND role = $${paramIndex}`;
      params.push(filters.role);
      paramIndex++;
    }

    queryText += ' ORDER BY full_name';

    const result = await query(queryText, params);
    return result.rows;
  }

  /**
   * Get single user by ID
   */
  async getUserById(id: string) {
    const result = await query('SELECT * FROM vw_users_master WHERE user_id = $1', [id]);
    return result.rows[0] || null;
  }

  /**
   * Get user selector data (for dropdowns)
   */
  async getUserSelector(organizationId?: string) {
    let queryText = 'SELECT * FROM vw_user_selector';
    const params: any[] = [];

    if (organizationId) {
      queryText += ' WHERE organization_id = $1';
      params.push(organizationId);
    }

    queryText += ' ORDER BY display_name';

    const result = await query(queryText, params);
    return result.rows;
  }

  /**
   * Get ports (with optional search)
   */
  async getPorts(search?: string) {
    let queryText = 'SELECT * FROM vw_port_selector';
    const params: any[] = [];

    if (search) {
      queryText += ' WHERE display_name ILIKE $1';
      params.push(`%${search}%`);
    }

    queryText += ' ORDER BY label LIMIT 100';

    const result = await query(queryText, params);
    return result.rows;
  }

  /**
   * Get port by ID
   */
  async getPortById(id: string) {
    const result = await query('SELECT * FROM vw_port_selector WHERE value = $1', [id]);
    return result.rows[0] || null;
  }

  /**
   * Get fleet summary statistics
   */
  async getFleetSummary(organizationId?: string) {
    // Calculate fleet summary from live data instead of materialized view
    let queryText = `
      SELECT 
        COUNT(DISTINCT s.id)::integer as total_vessels,
        COUNT(DISTINCT v.id) FILTER (WHERE v.status = 'IN_PROGRESS')::integer as active_voyages,
        COUNT(DISTINCT s.id) FILTER (WHERE s.operational_status = 'IN_PORT')::integer as vessels_in_port,
        COALESCE(SUM(s.gross_tonnage), 0)::numeric as total_gross_tonnage,
        COALESCE(SUM(v.eu_ets_eua_exposure_tco2), 0)::numeric as total_eua_exposure,
        NOW() as last_refreshed
      FROM ships s
      LEFT JOIN voyages v ON s.id = v.ship_id
      WHERE s.is_active = TRUE
    `;
    const params: any[] = [];

    if (organizationId) {
      queryText += ' AND s.organization_id = $1';
      params.push(organizationId);
    }

    queryText += ' GROUP BY s.organization_id';

    const result = await query(queryText, params);
    return result.rows[0] || {
      total_vessels: 0,
      active_voyages: 0,
      vessels_in_port: 0,
      total_gross_tonnage: 0,
      total_eua_exposure: 0,
      last_refreshed: new Date(),
    };
  }

  /**
   * Search vessels by name or IMO
   */
  async searchVessels(searchTerm: string) {
    const result = await query(
      `SELECT * FROM vw_vessels_master 
       WHERE vessel_name ILIKE $1 OR imo_number ILIKE $1
       ORDER BY vessel_name
       LIMIT 50`,
      [`%${searchTerm}%`]
    );
    return result.rows;
  }

  /**
   * Get master data summary (for admin dashboard)
   */
  async getMasterDataSummary() {
    const result = await query('SELECT * FROM vw_master_data_summary ORDER BY entity_type');
    return result.rows;
  }
}

export default new MasterDataService();

