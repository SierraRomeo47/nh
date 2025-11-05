import { Request, Response } from 'express';
import pool from '../config/database';
import { MarketDataService } from '../services/market-data.service';

export class MarketController {
  private marketDataService: MarketDataService;

  constructor() {
    this.marketDataService = new MarketDataService();
  }

  // GET /api/market/eua - Get latest EUA price (from external providers or fallback)
  async getEuaPrice(req: Request, res: Response) {
    try {
      const data = await this.marketDataService.getCurrentEuaPrice();

      res.json({
        code: 'SUCCESS',
        message: 'EUA price retrieved successfully',
        data: {
          price: data.price.toFixed(2),
          timestamp: data.timestamp,
          source: data.source,
          metadata: data.metadata
        },
        traceId: req.headers['x-trace-id']
      });
    } catch (error: any) {
      console.error('Error fetching EUA price:', error);
      res.status(500).json({
        code: 'INTERNAL_ERROR',
        message: error.message || 'Failed to retrieve EUA price',
        traceId: req.headers['x-trace-id']
      });
    }
  }

  // GET /api/market/fuel - Get latest fuel prices (from Platts or fallback)
  async getFuelPrices(req: Request, res: Response) {
    try {
      const data = await this.marketDataService.getFuelPrices();

      res.json({
        code: 'SUCCESS',
        message: 'Fuel prices retrieved successfully',
        data: data.map(item => ({
          dataType: item.dataType,
          price: parseFloat(item.price.toFixed(2)),
          currency: item.currency,
          timestamp: item.timestamp,
          source: item.source,
          metadata: item.metadata
        })),
        traceId: req.headers['x-trace-id']
      });
    } catch (error: any) {
      console.error('Error fetching fuel prices:', error);
      res.status(500).json({
        code: 'INTERNAL_ERROR',
        message: error.message || 'Failed to retrieve fuel prices',
        traceId: req.headers['x-trace-id']
      });
    }
  }

  // GET /api/market/history - Get market data history (from external sources or database)
  async getMarketHistory(req: Request, res: Response) {
    try {
      const { dataType, days = '30' } = req.query;

      const data = await this.marketDataService.getHistoricalData(
        (dataType as string) || 'EUA',
        parseInt(days as string)
      );

      res.json({
        code: 'SUCCESS',
        message: 'Market history retrieved successfully',
        data: data.map(item => ({
          dataType: item.dataType,
          price: parseFloat(item.price.toFixed(2)),
          currency: item.currency,
          timestamp: item.timestamp,
          source: item.source,
          metadata: item.metadata
        })),
        traceId: req.headers['x-trace-id']
      });
    } catch (error: any) {
      console.error('Error fetching market history:', error);
      res.status(500).json({
        code: 'INTERNAL_ERROR',
        message: error.message || 'Failed to retrieve market history',
        traceId: req.headers['x-trace-id']
      });
    }
  }

  // POST /api/market/price - Update market price (for simulation/testing)
  async updateMarketPrice(req: Request, res: Response) {
    try {
      const { dataType, price, source, metadata } = req.body;

      const query = `
        INSERT INTO market_data (
          data_type, price, source, metadata
        ) VALUES ($1, $2, $3, $4)
        RETURNING *
      `;

      const result = await pool.query(query, [
        dataType,
        price,
        source || 'SYSTEM',
        metadata || {}
      ]);

      res.status(201).json({
        code: 'SUCCESS',
        message: 'Market price updated successfully',
        data: result.rows[0],
        traceId: req.headers['x-trace-id']
      });
    } catch (error: any) {
      console.error('Error updating market price:', error);
      res.status(500).json({
        code: 'INTERNAL_ERROR',
        message: error.message || 'Failed to update market price',
        traceId: req.headers['x-trace-id']
      });
    }
  }
}

