import { Request, Response } from 'express';
import pool from '../config/database';

export class RfqController {
  // GET /api/rfqs - List all RFQs
  async listRfqs(req: Request, res: Response) {
    try {
      const { status, year, limit = '50', offset = '0' } = req.query;

      let whereClause = 'WHERE 1=1';
      const params: any[] = [];
      let paramCount = 1;

      if (status) {
        whereClause += ` AND pr.status = $${paramCount}`;
        params.push(status);
        paramCount++;
      }

      if (year) {
        whereClause += ` AND pr.reporting_year = $${paramCount}`;
        params.push(year);
        paramCount++;
      }

      const query = `
        SELECT 
          pr.*,
          o.name as organization_name,
          o.imo_company_number,
          COALESCE(
            (
              SELECT json_agg(
                json_build_object(
                  'id', po.id,
                  'counterparty_org_id', po.counterparty_org_id,
                  'counterparty_name', co.name,
                  'offered_gco2e', po.offered_gco2e,
                  'price_eur_per_gco2e', po.price_eur_per_gco2e,
                  'valid_until', po.valid_until,
                  'status', po.status,
                  'created_at', po.created_at
                )
              )
              FROM pool_offers po
              LEFT JOIN organizations co ON po.counterparty_org_id = co.id
              WHERE po.rfq_id = pr.id
            ),
            '[]'
          ) as offers
        FROM pool_rfqs pr
        LEFT JOIN organizations o ON pr.organization_id = o.id
        ${whereClause}
        ORDER BY pr.created_at DESC
        LIMIT $${paramCount} OFFSET $${paramCount + 1}
      `;

      params.push(parseInt(limit as string), parseInt(offset as string));

      const result = await pool.query(query, params);

      res.json({
        code: 'SUCCESS',
        message: 'RFQs retrieved successfully',
        data: result.rows,
        meta: {
          count: result.rows.length,
          limit: parseInt(limit as string),
          offset: parseInt(offset as string)
        },
        traceId: req.headers['x-trace-id']
      });
    } catch (error: any) {
      console.error('Error fetching RFQs:', error);
      res.status(500).json({
        code: 'INTERNAL_ERROR',
        message: error.message || 'Failed to retrieve RFQs',
        traceId: req.headers['x-trace-id']
      });
    }
  }

  // POST /api/rfqs - Create new RFQ
  async createRfq(req: Request, res: Response) {
    try {
      const {
        organization_id,
        reporting_year,
        need_gco2e,
        price_range_min,
        price_range_max,
        notes
      } = req.body;

      const query = `
        INSERT INTO pool_rfqs (
          organization_id, reporting_year, need_gco2e,
          price_range_min, price_range_max, notes, status
        ) VALUES ($1, $2, $3, $4, $5, $6, 'OPEN')
        RETURNING *
      `;

      const result = await pool.query(query, [
        organization_id,
        reporting_year,
        need_gco2e,
        price_range_min,
        price_range_max,
        notes
      ]);

      res.status(201).json({
        code: 'SUCCESS',
        message: 'RFQ created successfully',
        data: result.rows[0],
        traceId: req.headers['x-trace-id']
      });
    } catch (error: any) {
      console.error('Error creating RFQ:', error);
      res.status(500).json({
        code: 'INTERNAL_ERROR',
        message: error.message || 'Failed to create RFQ',
        traceId: req.headers['x-trace-id']
      });
    }
  }

  // GET /api/rfqs/:id - Get single RFQ with offers
  async getRfqById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const query = `
        SELECT 
          pr.*,
          o.name as organization_name,
          o.imo_company_number,
          COALESCE(
            (
              SELECT json_agg(
                json_build_object(
                  'id', po.id,
                  'counterparty_org_id', po.counterparty_org_id,
                  'counterparty_name', co.name,
                  'offered_gco2e', po.offered_gco2e,
                  'price_eur_per_gco2e', po.price_eur_per_gco2e,
                  'valid_until', po.valid_until,
                  'status', po.status,
                  'created_at', po.created_at
                ) ORDER BY po.price_eur_per_gco2e ASC
              )
              FROM pool_offers po
              LEFT JOIN organizations co ON po.counterparty_org_id = co.id
              WHERE po.rfq_id = pr.id
            ),
            '[]'
          ) as offers
        FROM pool_rfqs pr
        LEFT JOIN organizations o ON pr.organization_id = o.id
        WHERE pr.id = $1
      `;

      const result = await pool.query(query, [id]);

      if (result.rows.length === 0) {
        return res.status(404).json({
          code: 'NOT_FOUND',
          message: 'RFQ not found',
          traceId: req.headers['x-trace-id']
        });
      }

      res.json({
        code: 'SUCCESS',
        message: 'RFQ retrieved successfully',
        data: result.rows[0],
        traceId: req.headers['x-trace-id']
      });
    } catch (error: any) {
      console.error('Error fetching RFQ:', error);
      res.status(500).json({
        code: 'INTERNAL_ERROR',
        message: error.message || 'Failed to retrieve RFQ',
        traceId: req.headers['x-trace-id']
      });
    }
  }

  // PATCH /api/rfqs/:id - Update RFQ
  async updateRfq(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status, notes } = req.body;

      const query = `
        UPDATE pool_rfqs
        SET 
          status = COALESCE($1, status),
          notes = COALESCE($2, notes),
          closed_at = CASE WHEN $1 IN ('CLOSED', 'FILLED') THEN NOW() ELSE closed_at END
        WHERE id = $3
        RETURNING *
      `;

      const result = await pool.query(query, [status, notes, id]);

      if (result.rows.length === 0) {
        return res.status(404).json({
          code: 'NOT_FOUND',
          message: 'RFQ not found',
          traceId: req.headers['x-trace-id']
        });
      }

      res.json({
        code: 'SUCCESS',
        message: 'RFQ updated successfully',
        data: result.rows[0],
        traceId: req.headers['x-trace-id']
      });
    } catch (error: any) {
      console.error('Error updating RFQ:', error);
      res.status(500).json({
        code: 'INTERNAL_ERROR',
        message: error.message || 'Failed to update RFQ',
        traceId: req.headers['x-trace-id']
      });
    }
  }

  // POST /api/rfqs/:id/offers - Create offer for RFQ
  async createOffer(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const {
        counterparty_org_id,
        offered_gco2e,
        price_eur_per_gco2e,
        valid_until
      } = req.body;

      const query = `
        INSERT INTO pool_offers (
          rfq_id, counterparty_org_id, offered_gco2e,
          price_eur_per_gco2e, valid_until, status
        ) VALUES ($1, $2, $3, $4, $5, 'PENDING')
        RETURNING *
      `;

      const result = await pool.query(query, [
        id,
        counterparty_org_id,
        offered_gco2e,
        price_eur_per_gco2e,
        valid_until
      ]);

      res.status(201).json({
        code: 'SUCCESS',
        message: 'Offer created successfully',
        data: result.rows[0],
        traceId: req.headers['x-trace-id']
      });
    } catch (error: any) {
      console.error('Error creating offer:', error);
      res.status(500).json({
        code: 'INTERNAL_ERROR',
        message: error.message || 'Failed to create offer',
        traceId: req.headers['x-trace-id']
      });
    }
  }

  // PATCH /api/offers/:id - Update offer status
  async updateOffer(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const query = `
        UPDATE pool_offers
        SET status = $1
        WHERE id = $2
        RETURNING *
      `;

      const result = await pool.query(query, [status, id]);

      if (result.rows.length === 0) {
        return res.status(404).json({
          code: 'NOT_FOUND',
          message: 'Offer not found',
          traceId: req.headers['x-trace-id']
        });
      }

      res.json({
        code: 'SUCCESS',
        message: 'Offer updated successfully',
        data: result.rows[0],
        traceId: req.headers['x-trace-id']
      });
    } catch (error: any) {
      console.error('Error updating offer:', error);
      res.status(500).json({
        code: 'INTERNAL_ERROR',
        message: error.message || 'Failed to update offer',
        traceId: req.headers['x-trace-id']
      });
    }
  }
}

