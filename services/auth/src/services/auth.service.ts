import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/database';
import { ROLE_PERMISSIONS } from '../types/index';

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-change-in-production';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'default-refresh-secret-change-in-production';
const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '7d';

export interface LoginResult {
  user: any;
  accessToken: string;
  refreshToken: string;
}

export class AuthService {
  async login(email: string, password: string): Promise<LoginResult> {
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1 AND is_active = true',
      [email]
    );

    if (result.rows.length === 0) {
      throw new Error('Invalid credentials');
    }

    const user = result.rows[0];
    const isValid = await bcrypt.compare(password, user.password_hash);

    if (!isValid) {
      throw new Error('Invalid credentials');
    }

    // Get user permissions (optional - if not set, use empty array)
    let permissions: string[] = [];
    try {
      const permissionsResult = await pool.query(
        `SELECT p.code FROM permissions p
         INNER JOIN user_permissions up ON p.id = up.permission_id
         WHERE up.user_id = $1`,
        [user.id]
      );
      permissions = permissionsResult.rows.map((row: any) => row.code);
    } catch (error) {
      console.log('No permissions configured for user, using empty permissions');
    }

    // Generate tokens
    const accessToken = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
        organizationId: user.organization_id,
        permissions: permissions
      },
      JWT_SECRET,
      { expiresIn: ACCESS_TOKEN_EXPIRY }
    );

    const refreshToken = jwt.sign(
      { userId: user.id },
      JWT_REFRESH_SECRET,
      { expiresIn: REFRESH_TOKEN_EXPIRY }
    );

    // Store refresh token
    await pool.query(
      'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, NOW() + INTERVAL \'7 days\')',
      [user.id, refreshToken]
    );

    // Update last login
    await pool.query(
      'UPDATE users SET last_login_at = NOW() WHERE id = $1',
      [user.id]
    );

    // Remove password from response
    const { password_hash, ...userWithoutPassword } = user;

    return {
      user: { ...userWithoutPassword, permissions },
      accessToken,
      refreshToken
    };
  }

  async refreshToken(token: string): Promise<{ accessToken: string }> {
    const result = await pool.query(
      'SELECT user_id FROM refresh_tokens WHERE token = $1 AND expires_at > NOW()',
      [token]
    );

    if (result.rows.length === 0) {
      throw new Error('Invalid refresh token');
    }

    const userId = result.rows[0].user_id;

    const userResult = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
    const user = userResult.rows[0];

    // Get permissions (optional)
    let permissions: string[] = [];
    try {
      const permissionsResult = await pool.query(
        `SELECT p.code FROM permissions p
         INNER JOIN user_permissions up ON p.id = up.permission_id
         WHERE up.user_id = $1`,
        [user.id]
      );
      permissions = permissionsResult.rows.map((row: any) => row.code);
    } catch (error) {
      console.log('No permissions configured for user');
    }

    const accessToken = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
        organizationId: user.organization_id,
        permissions: permissions
      },
      JWT_SECRET,
      { expiresIn: ACCESS_TOKEN_EXPIRY }
    );

    return { accessToken };
  }

  async logout(token: string): Promise<void> {
    await pool.query('DELETE FROM refresh_tokens WHERE token = $1', [token]);
  }

  async getUserProfile(userId: string): Promise<any> {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);

    if (result.rows.length === 0) {
      throw new Error('User not found');
    }

    const user = result.rows[0];

    // Get permissions (optional)
    let permissions: string[] = [];
    try {
      const permissionsResult = await pool.query(
        `SELECT p.code FROM permissions p
         INNER JOIN user_permissions up ON p.id = up.permission_id
         WHERE up.user_id = $1`,
        [userId]
      );
      permissions = permissionsResult.rows.map((row: any) => row.code);
    } catch (error) {
      console.log('No permissions configured for user');
    }

    // Get vessel assignments (optional)
    let vessels: any[] = [];
    try {
      const vesselsResult = await pool.query(
        'SELECT ship_id, start_date, end_date FROM vessel_crew_assignments WHERE user_id = $1 AND is_active = true',
        [userId]
      );
      vessels = vesselsResult.rows;
    } catch (error) {
      console.log('No vessel assignments configured');
    }

    const { password_hash, ...userWithoutPassword } = user;

    return {
      ...userWithoutPassword,
      permissions,
      vessels
    };
  }
}

export default new AuthService();


