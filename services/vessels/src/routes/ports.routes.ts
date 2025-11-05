import express from 'express';
import portsController from '../controllers/ports.controller';

const router = express.Router();

// Get all ports with filtering
router.get('/', portsController.getPorts.bind(portsController));

// Search ports by name
router.get('/search', portsController.searchPorts.bind(portsController));

// Get ports by country
router.get('/country/:countryCode', portsController.getPortsByCountry.bind(portsController));

// Get nearby ports
router.get('/nearby', portsController.getNearbyPorts.bind(portsController));

// Get specific port by UNLOCODE
router.get('/:unlocode', portsController.getPortByUnlocode.bind(portsController));

export default router;

