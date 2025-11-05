import { Request, Response } from 'express';
import pool from '../config/database';

export class ComplianceController {
  // GET /api/alerts - Get compliance alerts
  async getAlerts(req: Request, res: Response) {
    try {
      const { severity, status, shipId, limit = '50', offset = '0' } = req.query;
      
      let whereClause = 'WHERE 1=1';
      const params: any[] = [];
      let paramCount = 1;

      if (severity) {
        whereClause += ` AND ca.severity = $${paramCount}`;
        params.push(severity);
        paramCount++;
      }

      if (status) {
        whereClause += ` AND ca.status = $${paramCount}`;
        params.push(status);
        paramCount++;
      }

      if (shipId) {
        whereClause += ` AND ca.ship_id = $${paramCount}`;
        params.push(shipId);
        paramCount++;
      }

      const query = `
        SELECT 
          ca.*,
          s.name as ship_name,
          s.imo_number,
          s.ship_type,
          o.name as organization_name
        FROM compliance_alerts ca
        LEFT JOIN ships s ON ca.ship_id = s.id
        LEFT JOIN organizations o ON s.organization_id = o.id
        ${whereClause}
        ORDER BY 
          CASE ca.severity
            WHEN 'CRITICAL' THEN 1
            WHEN 'HIGH' THEN 2
            WHEN 'MEDIUM' THEN 3
            WHEN 'LOW' THEN 4
          END,
          ca.created_at DESC
        LIMIT $${paramCount} OFFSET $${paramCount + 1}
      `;

      params.push(parseInt(limit as string), parseInt(offset as string));

      const result = await pool.query(query, params);
      
      res.json({
        code: 'SUCCESS',
        message: 'Alerts retrieved successfully',
        data: result.rows,
        meta: {
          count: result.rows.length,
          limit: parseInt(limit as string),
          offset: parseInt(offset as string)
        },
        traceId: req.headers['x-trace-id']
      });
    } catch (error: any) {
      console.error('Error fetching alerts:', error);
      res.status(500).json({
        code: 'INTERNAL_ERROR',
        message: error.message || 'Failed to retrieve alerts',
        traceId: req.headers['x-trace-id']
      });
    }
  }

  // GET /api/tasks - Get compliance tasks
  async getTasks(req: Request, res: Response) {
    try {
      const { status, assignedTo, priority, limit = '50', offset = '0' } = req.query;
      
      let whereClause = 'WHERE 1=1';
      const params: any[] = [];
      let paramCount = 1;

      if (status) {
        whereClause += ` AND ct.status = $${paramCount}`;
        params.push(status);
        paramCount++;
      }

      if (assignedTo) {
        whereClause += ` AND ct.assigned_to = $${paramCount}`;
        params.push(assignedTo);
        paramCount++;
      }

      if (priority) {
        whereClause += ` AND ct.priority = $${paramCount}`;
        params.push(priority);
        paramCount++;
      }

      const query = `
        SELECT 
          ct.*,
          s.name as ship_name,
          s.imo_number,
          v.voyage_id
        FROM compliance_tasks ct
        LEFT JOIN ships s ON ct.ship_id = s.id
        LEFT JOIN voyages v ON ct.voyage_id = v.id
        ${whereClause}
        ORDER BY 
          CASE ct.priority
            WHEN 'CRITICAL' THEN 1
            WHEN 'HIGH' THEN 2
            WHEN 'MEDIUM' THEN 3
            WHEN 'LOW' THEN 4
          END,
          ct.due_date ASC
        LIMIT $${paramCount} OFFSET $${paramCount + 1}
      `;

      params.push(parseInt(limit as string), parseInt(offset as string));

      const result = await pool.query(query, params);
      
      res.json({
        code: 'SUCCESS',
        message: 'Tasks retrieved successfully',
        data: result.rows,
        meta: {
          count: result.rows.length,
          limit: parseInt(limit as string),
          offset: parseInt(offset as string)
        },
        traceId: req.headers['x-trace-id']
      });
    } catch (error: any) {
      console.error('Error fetching tasks:', error);
      res.status(500).json({
        code: 'INTERNAL_ERROR',
        message: error.message || 'Failed to retrieve tasks',
        traceId: req.headers['x-trace-id']
      });
    }
  }

  // GET /api/recommendations - Get compliance recommendations
  async getRecommendations(req: Request, res: Response) {
    try {
      const { category, impactLevel, shipId, limit = '20', offset = '0' } = req.query;
      
      let whereClause = 'WHERE 1=1';
      const params: any[] = [];
      let paramCount = 1;

      if (category) {
        whereClause += ` AND cr.category = $${paramCount}`;
        params.push(category);
        paramCount++;
      }

      if (impactLevel) {
        whereClause += ` AND cr.impact_level = $${paramCount}`;
        params.push(impactLevel);
        paramCount++;
      }

      if (shipId) {
        whereClause += ` AND cr.ship_id = $${paramCount}`;
        params.push(shipId);
        paramCount++;
      }

      const query = `
        SELECT 
          cr.*,
          s.name as ship_name,
          s.imo_number
        FROM compliance_recommendations cr
        LEFT JOIN ships s ON cr.ship_id = s.id
        ${whereClause}
        ORDER BY 
          CASE cr.impact_level
            WHEN 'HIGH' THEN 1
            WHEN 'MEDIUM' THEN 2
            WHEN 'LOW' THEN 3
          END,
          cr.estimated_savings_eur DESC
        LIMIT $${paramCount} OFFSET $${paramCount + 1}
      `;

      params.push(parseInt(limit as string), parseInt(offset as string));

      const result = await pool.query(query, params);
      
      res.json({
        code: 'SUCCESS',
        message: 'Recommendations retrieved successfully',
        data: result.rows,
        meta: {
          count: result.rows.length,
          limit: parseInt(limit as string),
          offset: parseInt(offset as string)
        },
        traceId: req.headers['x-trace-id']
      });
    } catch (error: any) {
      console.error('Error fetching recommendations:', error);
      res.status(500).json({
        code: 'INTERNAL_ERROR',
        message: error.message || 'Failed to retrieve recommendations',
        traceId: req.headers['x-trace-id']
      });
    }
  }

  // PATCH /api/alerts/:id - Update alert status
  async updateAlert(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status, resolved_by, resolution_notes } = req.body;

      const query = `
        UPDATE compliance_alerts
        SET 
          status = $1,
          resolved_by = $2,
          resolved_at = CASE WHEN $1 = 'RESOLVED' THEN NOW() ELSE resolved_at END,
          resolution_notes = $3,
          updated_at = NOW()
        WHERE id = $4
        RETURNING *
      `;

      const result = await pool.query(query, [status, resolved_by, resolution_notes, id]);

      if (result.rows.length === 0) {
        return res.status(404).json({
          code: 'NOT_FOUND',
          message: 'Alert not found',
          traceId: req.headers['x-trace-id']
        });
      }

      res.json({
        code: 'SUCCESS',
        message: 'Alert updated successfully',
        data: result.rows[0],
        traceId: req.headers['x-trace-id']
      });
    } catch (error: any) {
      console.error('Error updating alert:', error);
      res.status(500).json({
        code: 'INTERNAL_ERROR',
        message: error.message || 'Failed to update alert',
        traceId: req.headers['x-trace-id']
      });
    }
  }

  // PATCH /api/tasks/:id - Update task
  async updateTask(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status, assigned_to, completed_by, notes } = req.body;

      const query = `
        UPDATE compliance_tasks
        SET 
          status = COALESCE($1, status),
          assigned_to = COALESCE($2, assigned_to),
          completed_at = CASE WHEN $1 = 'COMPLETED' THEN NOW() ELSE completed_at END,
          completed_by = $3,
          notes = COALESCE($4, notes),
          updated_at = NOW()
        WHERE id = $5
        RETURNING *
      `;

      const result = await pool.query(query, [status, assigned_to, completed_by, notes, id]);

      if (result.rows.length === 0) {
        return res.status(404).json({
          code: 'NOT_FOUND',
          message: 'Task not found',
          traceId: req.headers['x-trace-id']
        });
      }

      res.json({
        code: 'SUCCESS',
        message: 'Task updated successfully',
        data: result.rows[0],
        traceId: req.headers['x-trace-id']
      });
    } catch (error: any) {
      console.error('Error updating task:', error);
      res.status(500).json({
        code: 'INTERNAL_ERROR',
        message: error.message || 'Failed to update task',
        traceId: req.headers['x-trace-id']
      });
    }
  }
}

