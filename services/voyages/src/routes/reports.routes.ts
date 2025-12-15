// Vessel Reports Routes
import { Router } from 'express';
import { ReportsController } from '../controllers/reports.controller';

const router = Router();
const reportsController = new ReportsController();

// Noon Reports
router.post('/noon', reportsController.createNoonReport.bind(reportsController));
router.get('/noon', reportsController.getNoonReports.bind(reportsController));

// Bunker Reports
router.post('/bunker', reportsController.createBunkerReport.bind(reportsController));
router.get('/bunker', reportsController.getBunkerReports.bind(reportsController));

// SOF Reports
router.post('/sof', reportsController.createSOFReport.bind(reportsController));
router.get('/sof', reportsController.getSOFReports.bind(reportsController));

export default router;

