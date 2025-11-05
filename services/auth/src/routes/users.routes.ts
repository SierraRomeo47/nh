import express from 'express';
import usersController from '../controllers/users.controller';
import { authenticateToken, requireRole } from '../middleware/jwt.middleware';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Routes
router.get('/', usersController.getAllUsers.bind(usersController));
router.get('/stats', usersController.getUserStats.bind(usersController));
router.get('/export', requireRole('ADMIN'), usersController.exportUsers.bind(usersController));
router.get('/:id', usersController.getUserById.bind(usersController));
router.post('/', requireRole('ADMIN', 'MANAGER'), usersController.createUser.bind(usersController));
router.put('/:id', requireRole('ADMIN', 'MANAGER'), usersController.updateUser.bind(usersController));
router.put('/:id/permissions', requireRole('ADMIN'), usersController.updateUserPermissions.bind(usersController));
router.delete('/:id', requireRole('ADMIN'), usersController.deleteUser.bind(usersController));

export default router;


