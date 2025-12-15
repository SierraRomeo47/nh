// OVD Routes
import { Router } from 'express';
import { OVDController } from '../controllers/ovd.controller';
import { requireOVDAccess, mockAuth } from '../middleware/auth.middleware';
import { uploadOVDFile } from '../middleware/upload.middleware';

const router = Router();
const ovdController = new OVDController();

// Apply authentication middleware to all OVD routes
router.use(mockAuth); // TODO: Replace with proper JWT auth in production
router.use(requireOVDAccess); // Require specific roles

// Import OVD file
router.post('/import', uploadOVDFile, ovdController.importOVDFile.bind(ovdController));

// Export OVD file
router.get('/export', ovdController.exportOVDFile.bind(ovdController));

// Manual sync operations
router.post('/sync', ovdController.triggerManualSync.bind(ovdController));
router.get('/sync-status', ovdController.getSyncStatus.bind(ovdController));

// Sync schedule management
router.get('/schedule', ovdController.getSyncSchedule.bind(ovdController));
router.post('/schedule', ovdController.configureSyncSchedule.bind(ovdController));
router.patch('/schedule/:id', ovdController.updateSyncSchedule.bind(ovdController));
router.delete('/schedule/:id', ovdController.deleteSyncSchedule.bind(ovdController));

// Audit log
router.get('/audit-log', ovdController.getAuditLog.bind(ovdController));

export default router;

