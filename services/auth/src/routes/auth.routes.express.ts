import express from 'express';
import authController from '../controllers/auth.controller';
import { authenticateToken } from '../middleware/jwt.middleware';

const router = express.Router();

// Public routes (no authentication needed)
router.post('/login', authController.login.bind(authController));
router.post('/refresh', authController.refresh.bind(authController));
router.post('/logout', authController.logout.bind(authController));

// Protected routes
router.get('/me', authenticateToken, authController.getMe.bind(authController));

export default router;

