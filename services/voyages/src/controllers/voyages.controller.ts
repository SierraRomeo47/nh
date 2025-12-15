import { Request, Response } from 'express';
import pool from '../config/database';

export class VoyagesController {
  // GET /api/voyages - List all voyages with optional filtering
  async listVoyages(req: Request, res: Response) {
    try {
      const { status, shipId, limit = '50', offset = '0' } = req.query;
      
      let whereClause = 'WHERE 1=1';
      const params: any[] = [];
      let paramCount = 1;

      if (status) {
        whereClause += ` AND v.status = $${paramCount}`;
        params.push(status);
        paramCount++;
      }

      if (shipId) {
        whereClause += ` AND v.ship_id = $${paramCount}`;
        params.push(shipId);
        paramCount++;
      }

      const query = `
        SELECT 
          v.*,
          s.name as ship_name,
          s.imo_number,
          s.ship_type,
          s.gross_tonnage,
          s.deadweight_tonnage,
          o.name as organization_name,
          COALESCE(
            (
              SELECT json_agg(
                json_build_object(
                  'id', vl.id,
                  'leg_number', vl.leg_number,
                  'departure_port', vl.departure_port,
                  'arrival_port', vl.arrival_port,
                  'departure_port_unlocode', COALESCE(p_dep.unlocode, ''),
                  'arrival_port_unlocode', COALESCE(p_arr.unlocode, ''),
                  'departure_date', vl.departure_date,
                  'arrival_date', vl.arrival_date,
                  'distance_nm', vl.distance_nm,
                  'cargo_type', vl.cargo_type,
                  'cargo_quantity', vl.cargo_quantity
                ) ORDER BY vl.leg_number
              )
              FROM voyage_legs vl
              LEFT JOIN ports p_dep ON (
                (TRIM(SPLIT_PART(vl.departure_port, ',', 1)) = p_dep.name 
                  AND TRIM(SPLIT_PART(vl.departure_port, ',', 2)) = p_dep.country_code)
                OR (vl.departure_port = p_dep.name AND POSITION(',' IN vl.departure_port) = 0)
              )
              LEFT JOIN ports p_arr ON (
                (TRIM(SPLIT_PART(vl.arrival_port, ',', 1)) = p_arr.name 
                  AND TRIM(SPLIT_PART(vl.arrival_port, ',', 2)) = p_arr.country_code)
                OR (vl.arrival_port = p_arr.name AND POSITION(',' IN vl.arrival_port) = 0)
              )
              WHERE vl.voyage_id = v.id
            ),
            '[]'
          ) as legs,
          COALESCE(
            (
              SELECT SUM(fc.consumption_tonnes)
              FROM fuel_consumption fc
              WHERE fc.voyage_id = v.id
            ),
            0
          ) as total_fuel_consumption,
          COALESCE(
            (
              SELECT SUM(fc.consumption_tonnes * fc.well_to_wake_ghg_gco2e_mj * fc.lower_calorific_value_mj_kg)
              FROM fuel_consumption fc
              WHERE fc.voyage_id = v.id
            ) / 1000000,
            0
          ) as total_co2_emissions
        FROM voyages v
        LEFT JOIN ships s ON v.ship_id = s.id
        LEFT JOIN organizations o ON s.organization_id = o.id
        ${whereClause}
        ORDER BY v.start_date DESC
        LIMIT $${paramCount} OFFSET $${paramCount + 1}
      `;

      params.push(parseInt(limit as string), parseInt(offset as string));

      const result = await pool.query(query, params);
      
      res.json({
        code: 'SUCCESS',
        message: 'Voyages retrieved successfully',
        data: result.rows,
        meta: {
          count: result.rows.length,
          limit: parseInt(limit as string),
          offset: parseInt(offset as string)
        },
        traceId: req.headers['x-trace-id']
      });
    } catch (error: any) {
      console.error('Error fetching voyages:', error);
      res.status(500).json({
        code: 'INTERNAL_ERROR',
        message: error.message || 'Failed to retrieve voyages',
        traceId: req.headers['x-trace-id']
      });
    }
  }

  // GET /api/voyages/:id - Get single voyage
  async getVoyageById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const query = `
        SELECT 
          v.*,
          s.name as ship_name,
          s.imo_number,
          s.ship_type,
          s.gross_tonnage,
          s.deadweight_tonnage,
          s.engine_power_kw,
          s.flag_state,
          s.year_built,
          o.name as organization_name,
          o.imo_company_number,
          COALESCE(
            (
              SELECT json_agg(
                json_build_object(
                  'id', vl.id,
                  'leg_number', vl.leg_number,
                  'departure_port', vl.departure_port,
                  'arrival_port', vl.arrival_port,
                  'departure_port_unlocode', COALESCE(p_dep.unlocode, ''),
                  'arrival_port_unlocode', COALESCE(p_arr.unlocode, ''),
                  'departure_date', vl.departure_date,
                  'arrival_date', vl.arrival_date,
                  'distance_nm', vl.distance_nm,
                  'cargo_type', vl.cargo_type,
                  'cargo_quantity', vl.cargo_quantity
                ) ORDER BY vl.leg_number
              )
              FROM voyage_legs vl
              LEFT JOIN ports p_dep ON (
                (TRIM(SPLIT_PART(vl.departure_port, ',', 1)) = p_dep.name 
                  AND TRIM(SPLIT_PART(vl.departure_port, ',', 2)) = p_dep.country_code)
                OR (vl.departure_port = p_dep.name AND POSITION(',' IN vl.departure_port) = 0)
              )
              LEFT JOIN ports p_arr ON (
                (TRIM(SPLIT_PART(vl.arrival_port, ',', 1)) = p_arr.name 
                  AND TRIM(SPLIT_PART(vl.arrival_port, ',', 2)) = p_arr.country_code)
                OR (vl.arrival_port = p_arr.name AND POSITION(',' IN vl.arrival_port) = 0)
              )
              WHERE vl.voyage_id = v.id
            ),
            '[]'
          ) as legs,
          COALESCE(
            (
              SELECT json_agg(
                json_build_object(
                  'id', fc.id,
                  'fuel_type', fc.fuel_type,
                  'fuel_category', fc.fuel_category,
                  'consumption_tonnes', fc.consumption_tonnes,
                  'consumption_date', fc.consumption_date,
                  'lower_calorific_value_mj_kg', fc.lower_calorific_value_mj_kg,
                  'well_to_wake_ghg_gco2e_mj', fc.well_to_wake_ghg_gco2e_mj
                ) ORDER BY fc.consumption_date
              )
              FROM fuel_consumption fc
              WHERE fc.voyage_id = v.id
            ),
            '[]'
          ) as fuel_consumption
        FROM voyages v
        LEFT JOIN ships s ON v.ship_id = s.id
        LEFT JOIN organizations o ON s.organization_id = o.id
        WHERE v.id = $1
      `;

      const result = await pool.query(query, [id]);

      if (result.rows.length === 0) {
        return res.status(404).json({
          code: 'NOT_FOUND',
          message: 'Voyage not found',
          traceId: req.headers['x-trace-id']
        });
      }

      res.json({
        code: 'SUCCESS',
        message: 'Voyage retrieved successfully',
        data: result.rows[0],
        traceId: req.headers['x-trace-id']
      });
    } catch (error: any) {
      console.error('Error fetching voyage:', error);
      res.status(500).json({
        code: 'INTERNAL_ERROR',
        message: error.message || 'Failed to retrieve voyage',
        traceId: req.headers['x-trace-id']
      });
    }
  }

  // POST /api/voyages - Create new voyage
  async createVoyage(req: Request, res: Response) {
    try {
      const {
        voyage_id,
        ship_id,
        voyage_type,
        start_date,
        end_date,
        start_port,
        end_port,
        charter_type,
        charterer_org_id,
        legs
      } = req.body;

      // Start transaction
      const client = await pool.connect();
      try {
        await client.query('BEGIN');

        // Insert voyage
        const voyageResult = await client.query(
          `INSERT INTO voyages (
            voyage_id, ship_id, voyage_type, start_date, end_date,
            start_port, end_port, charter_type, charterer_org_id, status
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'ACTIVE')
          RETURNING *`,
          [voyage_id, ship_id, voyage_type, start_date, end_date, start_port, end_port, charter_type, charterer_org_id]
        );

        const newVoyage = voyageResult.rows[0];

        // Insert legs if provided
        if (legs && Array.isArray(legs)) {
          for (const leg of legs) {
            await client.query(
              `INSERT INTO voyage_legs (
                voyage_id, leg_number, departure_port, arrival_port,
                departure_date, arrival_date, distance_nm, cargo_type, cargo_quantity
              ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
              [
                newVoyage.id,
                leg.leg_number,
                leg.departure_port,
                leg.arrival_port,
                leg.departure_date,
                leg.arrival_date,
                leg.distance_nm,
                leg.cargo_type,
                leg.cargo_quantity
              ]
            );
          }
        }

        await client.query('COMMIT');

        res.status(201).json({
          code: 'SUCCESS',
          message: 'Voyage created successfully',
          data: newVoyage,
          traceId: req.headers['x-trace-id']
        });
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      } finally {
        client.release();
      }
    } catch (error: any) {
      console.error('Error creating voyage:', error);
      res.status(500).json({
        code: 'INTERNAL_ERROR',
        message: error.message || 'Failed to create voyage',
        traceId: req.headers['x-trace-id']
      });
    }
  }

  // PATCH /api/voyages/:id - Update voyage
  async updateVoyage(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updates = req.body;

      const allowedFields = [
        'voyage_type', 'start_date', 'end_date', 'start_port', 'end_port',
        'charter_type', 'charterer_org_id', 'status'
      ];

      const setClause: string[] = [];
      const values: any[] = [];
      let paramCount = 1;

      Object.keys(updates).forEach(key => {
        if (allowedFields.includes(key)) {
          setClause.push(`${key} = $${paramCount}`);
          values.push(updates[key]);
          paramCount++;
        }
      });

      if (setClause.length === 0) {
        return res.status(400).json({
          code: 'VALIDATION_ERROR',
          message: 'No valid fields to update',
          traceId: req.headers['x-trace-id']
        });
      }

      setClause.push(`updated_at = NOW()`);
      values.push(id);

      const query = `
        UPDATE voyages
        SET ${setClause.join(', ')}
        WHERE id = $${paramCount}
        RETURNING *
      `;

      const result = await pool.query(query, values);

      if (result.rows.length === 0) {
        return res.status(404).json({
          code: 'NOT_FOUND',
          message: 'Voyage not found',
          traceId: req.headers['x-trace-id']
        });
      }

      res.json({
        code: 'SUCCESS',
        message: 'Voyage updated successfully',
        data: result.rows[0],
        traceId: req.headers['x-trace-id']
      });
    } catch (error: any) {
      console.error('Error updating voyage:', error);
      res.status(500).json({
        code: 'INTERNAL_ERROR',
        message: error.message || 'Failed to update voyage',
        traceId: req.headers['x-trace-id']
      });
    }
  }
}

