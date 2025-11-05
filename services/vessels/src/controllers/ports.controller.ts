import { Request, Response } from 'express';
import pool from '../config/database';

class PortsController {
  /**
   * Get all ports with optional filtering
   * GET /api/ports?search=rotterdam&country=NL&limit=50
   */
  async getPorts(req: Request, res: Response) {
    try {
      const { search, country, limit = 100, offset = 0 } = req.query;
      
      let query = 'SELECT * FROM ports WHERE 1=1';
      const params: any[] = [];
      let paramCount = 1;
      
      if (search) {
        query += ` AND (name ILIKE $${paramCount} OR unlocode ILIKE $${paramCount})`;
        params.push(`%${search}%`);
        paramCount++;
      }
      
      if (country) {
        query += ` AND country_code = $${paramCount}`;
        params.push(country);
        paramCount++;
      }
      
      query += ` ORDER BY name LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
      params.push(Number(limit), Number(offset));
      
      const result = await pool.query(query, params);
      
      res.json({
        ports: result.rows,
        total: result.rowCount,
        limit: Number(limit),
        offset: Number(offset)
      });
    } catch (error) {
      console.error('Error fetching ports:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Get port by UNLOCODE
   * GET /api/ports/:unlocode
   */
  async getPortByUnlocode(req: Request, res: Response) {
    try {
      const { unlocode } = req.params;
      
      const result = await pool.query(
        'SELECT * FROM ports WHERE unlocode = $1',
        [unlocode.toUpperCase()]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Port not found' });
      }
      
      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error fetching port:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Search ports by name
   * GET /api/ports/search?q=rotter&limit=10
   */
  async searchPorts(req: Request, res: Response) {
    try {
      const { q, limit = 20 } = req.query;
      
      if (!q || typeof q !== 'string' || q.length < 2) {
        return res.status(400).json({ error: 'Query must be at least 2 characters' });
      }
      
      const result = await pool.query(
        `SELECT unlocode, name, country_code, latitude, longitude 
         FROM ports 
         WHERE name ILIKE $1 OR unlocode ILIKE $1
         ORDER BY 
           CASE 
             WHEN name ILIKE $2 THEN 1
             WHEN name ILIKE $1 THEN 2
             ELSE 3
           END,
           name
         LIMIT $3`,
        [`%${q}%`, `${q}%`, Number(limit)]
      );
      
      res.json(result.rows);
    } catch (error) {
      console.error('Error searching ports:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Get ports by country
   * GET /api/ports/country/:countryCode
   */
  async getPortsByCountry(req: Request, res: Response) {
    try {
      const { countryCode } = req.params;
      const { limit = 100, offset = 0 } = req.query;
      
      const result = await pool.query(
        `SELECT * FROM ports 
         WHERE country_code = $1 
         ORDER BY name 
         LIMIT $2 OFFSET $3`,
        [countryCode.toUpperCase(), Number(limit), Number(offset)]
      );
      
      res.json({
        country: countryCode.toUpperCase(),
        ports: result.rows,
        total: result.rowCount
      });
    } catch (error) {
      console.error('Error fetching ports by country:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Get nearby ports within radius
   * GET /api/ports/nearby?lat=51.92&lon=4.48&radius=100
   */
  async getNearbyPorts(req: Request, res: Response) {
    try {
      const { lat, lon, radius = 50, limit = 20 } = req.query;
      
      if (!lat || !lon) {
        return res.status(400).json({ error: 'Latitude and longitude are required' });
      }
      
      // Simple distance calculation using haversine formula
      const result = await pool.query(
        `SELECT 
           unlocode, name, country_code, latitude, longitude,
           (
             6371 * acos(
               cos(radians($1)) * cos(radians(latitude)) *
               cos(radians(longitude) - radians($2)) +
               sin(radians($1)) * sin(radians(latitude))
             )
           ) AS distance_km
         FROM ports
         WHERE latitude IS NOT NULL AND longitude IS NOT NULL
         HAVING (
           6371 * acos(
             cos(radians($1)) * cos(radians(latitude)) *
             cos(radians(longitude) - radians($2)) +
             sin(radians($1)) * sin(radians(latitude))
           )
         ) < $3
         ORDER BY distance_km
         LIMIT $4`,
        [Number(lat), Number(lon), Number(radius), Number(limit)]
      );
      
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching nearby ports:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

export default new PortsController();

