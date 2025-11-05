import express from 'express';
import fleetsController from '../controllers/fleets.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Routes
router.get('/', fleetsController.getAllFleets.bind(fleetsController));
router.get('/:id', fleetsController.getFleetById.bind(fleetsController));
router.get('/:id/vessels', fleetsController.getFleetVessels.bind(fleetsController));

export default router;


