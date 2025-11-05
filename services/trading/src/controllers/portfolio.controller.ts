import { Request, Response } from 'express';
import pool from '../config/database';

export class PortfolioController {
  // GET /api/portfolio - Get trading portfolio
  async getPortfolio(req: Request, res: Response) {
    try {
      const { organizationId, status, limit = '50', offset = '0' } = req.query;

      let whereClause = 'WHERE 1=1';
      const params: any[] = [];
      let paramCount = 1;

      if (organizationId) {
        whereClause += ` AND tp.organization_id = $${paramCount}`;
        params.push(organizationId);
        paramCount++;
      }

      if (status) {
        whereClause += ` AND tp.status = $${paramCount}`;
        params.push(status);
        paramCount++;
      }

      const query = `
        SELECT 
          tp.*,
          o.name as organization_name
        FROM trading_portfolio tp
        LEFT JOIN organizations o ON tp.organization_id = o.id
        ${whereClause}
        ORDER BY tp.entry_date DESC
        LIMIT $${paramCount} OFFSET $${paramCount + 1}
      `;

      params.push(parseInt(limit as string), parseInt(offset as string));

      const result = await pool.query(query, params);

      res.json({
        code: 'SUCCESS',
        message: 'Portfolio retrieved successfully',
        data: result.rows,
        meta: {
          count: result.rows.length,
          limit: parseInt(limit as string),
          offset: parseInt(offset as string)
        },
        traceId: req.headers['x-trace-id']
      });
    } catch (error: any) {
      console.error('Error fetching portfolio:', error);
      res.status(500).json({
        code: 'INTERNAL_ERROR',
        message: error.message || 'Failed to retrieve portfolio',
        traceId: req.headers['x-trace-id']
      });
    }
  }

  // GET /api/opportunities - Get trading opportunities
  async getOpportunities(req: Request, res: Response) {
    try {
      const { status, opportunityType, limit = '20', offset = '0' } = req.query;

      let whereClause = 'WHERE 1=1';
      const params: any[] = [];
      let paramCount = 1;

      if (status) {
        whereClause += ` AND status = $${paramCount}`;
        params.push(status);
        paramCount++;
      }

      if (opportunityType) {
        whereClause += ` AND opportunity_type = $${paramCount}`;
        params.push(opportunityType);
        paramCount++;
      }

      const query = `
        SELECT *
        FROM trading_opportunities
        ${whereClause}
        ORDER BY created_at DESC
        LIMIT $${paramCount} OFFSET $${paramCount + 1}
      `;

      params.push(parseInt(limit as string), parseInt(offset as string));

      const result = await pool.query(query, params);

      res.json({
        code: 'SUCCESS',
        message: 'Opportunities retrieved successfully',
        data: result.rows,
        meta: {
          count: result.rows.length,
          limit: parseInt(limit as string),
          offset: parseInt(offset as string)
        },
        traceId: req.headers['x-trace-id']
      });
    } catch (error: any) {
      console.error('Error fetching opportunities:', error);
      res.status(500).json({
        code: 'INTERNAL_ERROR',
        message: error.message || 'Failed to retrieve opportunities',
        traceId: req.headers['x-trace-id']
      });
    }
  }

  // GET /api/trades - Get EUA trade history
  async getTrades(req: Request, res: Response) {
    try {
      const { organizationId, tradeType, limit = '50', offset = '0' } = req.query;

      let whereClause = 'WHERE 1=1';
      const params: any[] = [];
      let paramCount = 1;

      if (organizationId) {
        whereClause += ` AND et.organization_id = $${paramCount}`;
        params.push(organizationId);
        paramCount++;
      }

      if (tradeType) {
        whereClause += ` AND et.trade_type = $${paramCount}`;
        params.push(tradeType);
        paramCount++;
      }

      const query = `
        SELECT 
          et.*,
          o.name as organization_name
        FROM eua_trades et
        LEFT JOIN organizations o ON et.organization_id = o.id
        ${whereClause}
        ORDER BY et.trade_date DESC
        LIMIT $${paramCount} OFFSET $${paramCount + 1}
      `;

      params.push(parseInt(limit as string), parseInt(offset as string));

      const result = await pool.query(query, params);

      res.json({
        code: 'SUCCESS',
        message: 'Trades retrieved successfully',
        data: result.rows,
        meta: {
          count: result.rows.length,
          limit: parseInt(limit as string),
          offset: parseInt(offset as string)
        },
        traceId: req.headers['x-trace-id']
      });
    } catch (error: any) {
      console.error('Error fetching trades:', error);
      res.status(500).json({
        code: 'INTERNAL_ERROR',
        message: error.message || 'Failed to retrieve trades',
        traceId: req.headers['x-trace-id']
      });
    }
  }
}

