import { Router } from 'express';
import * as masterDataController from '../controllers/master-data.controller';

const router = Router();

// Health check
router.get('/health', masterDataController.getHealthStatus);

// Vessels endpoints
router.get('/vessels', masterDataController.getVessels);
router.get('/vessels/search', masterDataController.searchVessels);
router.get('/vessels/selector', masterDataController.getVesselSelector);
router.get('/vessels/:id', masterDataController.getVesselById);

// Organizations endpoints
router.get('/organizations', masterDataController.getOrganizations);
router.get('/organizations/selector', masterDataController.getOrganizationSelector);
router.get('/organizations/:id', masterDataController.getOrganizationById);

// Users endpoints
router.get('/users', masterDataController.getUsers);
router.get('/users/selector', masterDataController.getUserSelector);

// Ports endpoints
router.get('/ports', masterDataController.getPorts);

// Fleet summary
router.get('/fleet/summary', masterDataController.getFleetSummary);

// Master data summary
router.get('/summary', masterDataController.getMasterDataSummary);

export default router;

