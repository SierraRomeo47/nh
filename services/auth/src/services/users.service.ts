import pool from '../config/database';

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  organization_id: string;
  ship_id: string | null;
  position: string;
  rank: string;
  license_number: string;
  avatar_url: string | null;
  language: string;
  timezone: string;
  theme: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
  last_login_at: Date | null;
}

export interface UserStats {
  total_users: number;
  active_users: number;
  online_now: number;
  new_this_month: number;
  role_distribution: Record<string, number>;
}

export class UsersService {
  async getAllUsers(userRole: string, organizationId: string): Promise<User[]> {
    let query = `
      SELECT 
        u.id, u.email, u.first_name, u.last_name, u.role, 
        u.organization_id, u.ship_id, u.position, u.rank, 
        u.license_number, u.avatar_url, u.language, u.timezone, 
        u.theme, u.is_active, u.created_at, u.updated_at, u.last_login_at,
        s.name as ship_name
      FROM users u
      LEFT JOIN ships s ON u.ship_id = s.id
      WHERE u.is_active = true
    `;
    
    const params: any[] = [];
    
    // Filter based on role
    if (userRole === 'CREW' || userRole === 'ENGINEER' || userRole === 'CAPTAIN' || userRole === 'CHIEF_ENGINEER') {
      // Vessel-specific users see only crew on their vessel
      query += ` AND u.ship_id IN (
        SELECT ship_id FROM vessel_crew_assignments WHERE user_id = $1 AND is_active = true
      )`;
      params.push(''); // TODO: Use actual user ID
    } else if (userRole === 'ADMIN') {
      // Admins see ALL users (no filter)
      // No additional WHERE clause
    } else if (userRole === 'MANAGER') {
      // Managers see users in their organization
      query += ` AND u.organization_id = $1`;
      params.push(organizationId);
    }
    
    query += ` ORDER BY u.created_at DESC`;
    
    const result = await pool.query(query, params);
    return result.rows;
  }
  
  async getUserStats(organizationId: string): Promise<UserStats> {
    // Get total and active counts
    const countsResult = await pool.query(`
      SELECT 
        COUNT(*) as total_users,
        COUNT(CASE WHEN is_active = true THEN 1 END) as active_users,
        COUNT(CASE WHEN last_login_at > NOW() - INTERVAL '15 minutes' THEN 1 END) as online_now,
        COUNT(CASE WHEN created_at > NOW() - INTERVAL '1 month' THEN 1 END) as new_this_month
      FROM users
      WHERE organization_id = $1
    `, [organizationId]);
    
    // Get role distribution
    const roleResult = await pool.query(`
      SELECT role, COUNT(*) as count
      FROM users
      WHERE organization_id = $1 AND is_active = true
      GROUP BY role
    `, [organizationId]);
    
    const roleDistribution: Record<string, number> = {};
    roleResult.rows.forEach((row: any) => {
      roleDistribution[row.role] = parseInt(row.count);
    });
    
    return {
      ...countsResult.rows[0],
      role_distribution: roleDistribution
    };
  }
  
  async getUserById(userId: string): Promise<User | null> {
    const result = await pool.query(`
      SELECT 
        u.*, s.name as ship_name
      FROM users u
      LEFT JOIN ships s ON u.ship_id = s.id
      WHERE u.id = $1
    `, [userId]);
    
    return result.rows[0] || null;
  }
  
  async createUser(userData: any): Promise<User> {
    const result = await pool.query(`
      INSERT INTO users (
        email, password_hash, first_name, last_name, role, 
        organization_id, ship_id, position, rank, license_number, is_active
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `, [
      userData.email,
      userData.password_hash || '$2a$10$default', // TODO: Hash password properly
      userData.first_name,
      userData.last_name,
      userData.role,
      userData.organization_id,
      userData.ship_id || null,
      userData.position || '',
      userData.rank || '',
      userData.license_number || '',
      userData.is_active !== undefined ? userData.is_active : true
    ]);
    
    return result.rows[0];
  }
  
  async updateUser(userId: string, userData: any): Promise<User> {
    // Check if role is being changed from ADMIN
    if (userData.role && userData.role !== 'ADMIN') {
      const currentUser = await this.getUserById(userId);
      if (currentUser?.role === 'ADMIN') {
        // Check if this is the last admin
        const adminCount = await this.countAdmins(currentUser.organization_id);
        if (adminCount <= 1) {
          throw new Error('LAST_ADMIN_PROTECTION: Cannot change role of the last administrator. At least one admin must exist.');
        }
      }
    }
    
    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;
    
    const allowedFields = ['email', 'first_name', 'last_name', 'role', 'position', 'rank', 'license_number', 'is_active', 'ship_id'];
    
    allowedFields.forEach(field => {
      if (userData[field] !== undefined) {
        fields.push(`${field} = $${paramIndex}`);
        values.push(userData[field]);
        paramIndex++;
      }
    });
    
    if (fields.length === 0) {
      throw new Error('No valid fields to update');
    }
    
    values.push(userId);
    
    const result = await pool.query(`
      UPDATE users 
      SET ${fields.join(', ')}, updated_at = NOW()
      WHERE id = $${paramIndex}
      RETURNING 
        id, email, first_name, last_name, role, 
        organization_id, ship_id, position, rank, 
        license_number, avatar_url, language, timezone, 
        theme, is_active, created_at, updated_at, last_login_at
    `, values);
    
    return result.rows[0];
  }
  
  async deleteUser(userId: string): Promise<void> {
    // Check if this is an admin
    const user = await this.getUserById(userId);
    if (user?.role === 'ADMIN') {
      // Check if this is the last admin
      const adminCount = await this.countAdmins(user.organization_id);
      if (adminCount <= 1) {
        throw new Error('LAST_ADMIN_PROTECTION: Cannot delete the last administrator. At least one admin must exist.');
      }
    }
    
    await pool.query('UPDATE users SET is_active = false WHERE id = $1', [userId]);
  }
  
  async countAdmins(organizationId: string): Promise<number> {
    const result = await pool.query(`
      SELECT COUNT(*) as count
      FROM users
      WHERE role = 'ADMIN' 
        AND is_active = true 
        AND organization_id = $1
    `, [organizationId]);
    
    return parseInt(result.rows[0]?.count || '0');
  }
  
  async exportUsers(organizationId: string): Promise<User[]> {
    const result = await pool.query(`
      SELECT 
        u.id, u.email, u.first_name, u.last_name, u.role, 
        u.organization_id, u.ship_id, u.position, u.rank, 
        u.license_number, u.avatar_url, u.language, u.timezone, 
        u.theme, u.is_active, u.created_at, u.updated_at, u.last_login_at,
        s.name as ship_name
      FROM users u
      LEFT JOIN ships s ON u.ship_id::text = s.id::text
      WHERE u.organization_id = $1
      ORDER BY u.created_at DESC
    `, [organizationId]);
    
    return result.rows;
  }
  
  async updateUserPermissions(userId: string, permissions: string[]): Promise<void> {
    // Store custom permissions for user (if needed for custom RBAC beyond role-based)
    await pool.query(`
      UPDATE users 
      SET custom_permissions = $1, updated_at = NOW()
      WHERE id = $2
    `, [JSON.stringify(permissions), userId]);
  }
}

export default new UsersService();

