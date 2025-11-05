import express from 'express';
import userAssignmentsController from '../controllers/user-assignments.controller';
import { authenticateToken, requireRole } from '../middleware/jwt.middleware';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Routes - require ADMIN or MANAGER role
router.post('/users/:userId/vessels', requireRole('ADMIN', 'MANAGER'), userAssignmentsController.assignVessels.bind(userAssignmentsController));
router.post('/users/:userId/fleets', requireRole('ADMIN', 'MANAGER'), userAssignmentsController.assignFleets.bind(userAssignmentsController));
router.get('/users/:userId/assignments', userAssignmentsController.getUserAssignments.bind(userAssignmentsController));

export default router;


