import { Router } from 'express';
import * as insuranceController from '../controllers/insurance.controller';

const router = Router();

// Health check
router.get('/health', insuranceController.getHealthStatus);

// Quote generation
router.post('/quotes', insuranceController.generateQuote);

// Get quote by ID
router.get('/quotes/:quoteId', insuranceController.getQuoteById);

// Get quotes by vessel
router.get('/vessels/:vesselId/quotes', insuranceController.getQuotesByVessel);

// Accept quote (bind policy)
router.post('/quotes/:quoteId/accept', insuranceController.acceptQuote);

export default router;

