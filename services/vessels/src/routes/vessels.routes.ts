import express from 'express';
import vesselsController from '../controllers/vessels.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = express.Router();

// Public routes (no auth required for listing vessels)
router.get('/', vesselsController.getAllVessels.bind(vesselsController));

// Specific routes must come before parameterized routes
router.get('/overview', vesselsController.getFleetOverview.bind(vesselsController));

// Parameterized routes (must be last)
router.get('/:id', vesselsController.getVesselById.bind(vesselsController));

export default router;

