import { Router } from 'express';
import { ComplianceController } from '../controllers/compliance.controller';

const router = Router();
const complianceController = new ComplianceController();

// Alerts
router.get('/alerts', complianceController.getAlerts.bind(complianceController));
router.patch('/alerts/:id', complianceController.updateAlert.bind(complianceController));

// Tasks
router.get('/tasks', complianceController.getTasks.bind(complianceController));
router.patch('/tasks/:id', complianceController.updateTask.bind(complianceController));

// Recommendations
router.get('/recommendations', complianceController.getRecommendations.bind(complianceController));

export default router;

