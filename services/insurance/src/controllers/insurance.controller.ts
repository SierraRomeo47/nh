import { Request, Response } from 'express';
import insuranceService from '../services/insurance.service';
import { InsuranceQuoteRequest } from '../types';

export const generateQuote = async (req: Request, res: Response) => {
  try {
    const quoteRequest: InsuranceQuoteRequest = {
      ...req.body,
      userId: (req as any).userId, // From JWT middleware if available
    };

    // Validate required fields
    const requiredFields = [
      'vesselName',
      'vesselType',
      'vesselAge',
      'grossTonnage',
      'routeOrigin',
      'routeDestination',
      'routeRiskZone',
      'voyageDuration',
      'coverageType',
      'deductible',
      'previousClaims',
      'safetyRating',
      'complianceScore',
    ];

    const missingFields = requiredFields.filter((field) => {
      const value = quoteRequest[field as keyof InsuranceQuoteRequest];
      return value === undefined || value === null || value === '';
    });

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        error: `Missing required fields: ${missingFields.join(', ')}`,
      });
    }

    // Validate coverage types array
    if (!Array.isArray(quoteRequest.coverageType) || quoteRequest.coverageType.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'At least one coverage type must be selected',
      });
    }

    const quote = await insuranceService.generateQuote(quoteRequest);

    res.status(201).json({
      success: true,
      quote,
      message: 'Insurance quote generated successfully',
    });
  } catch (error: any) {
    console.error('Error generating quote:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate insurance quote',
    });
  }
};

export const getQuoteById = async (req: Request, res: Response) => {
  try {
    const { quoteId } = req.params;

    if (!quoteId) {
      return res.status(400).json({
        success: false,
        error: 'Quote ID is required',
      });
    }

    const quote = await insuranceService.getQuoteById(quoteId);

    if (!quote) {
      return res.status(404).json({
        success: false,
        error: 'Quote not found',
      });
    }

    res.status(200).json({
      success: true,
      quote,
    });
  } catch (error: any) {
    console.error('Error fetching quote:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch insurance quote',
    });
  }
};

export const getQuotesByVessel = async (req: Request, res: Response) => {
  try {
    const { vesselId } = req.params;

    if (!vesselId) {
      return res.status(400).json({
        success: false,
        error: 'Vessel ID is required',
      });
    }

    const quotes = await insuranceService.getQuotesByVessel(vesselId);

    res.status(200).json({
      success: true,
      quotes,
      count: quotes.length,
    });
  } catch (error: any) {
    console.error('Error fetching vessel quotes:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch vessel quotes',
    });
  }
};

export const acceptQuote = async (req: Request, res: Response) => {
  try {
    const { quoteId } = req.params;

    if (!quoteId) {
      return res.status(400).json({
        success: false,
        error: 'Quote ID is required',
      });
    }

    const result = await insuranceService.acceptQuote(quoteId);

    res.status(200).json(result);
  } catch (error: any) {
    console.error('Error accepting quote:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to accept insurance quote',
    });
  }
};

export const getHealthStatus = async (req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    service: 'insurance',
    timestamp: new Date().toISOString(),
  });
};

