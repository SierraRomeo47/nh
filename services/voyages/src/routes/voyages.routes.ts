import { Router } from 'express';
import { VoyagesController } from '../controllers/voyages.controller';

const router = Router();
const voyagesController = new VoyagesController();

// List all voyages
router.get('/', voyagesController.listVoyages.bind(voyagesController));

// Create new voyage
router.post('/', voyagesController.createVoyage.bind(voyagesController));

// Get single voyage
router.get('/:id', voyagesController.getVoyageById.bind(voyagesController));

// Update voyage
router.patch('/:id', voyagesController.updateVoyage.bind(voyagesController));

export default router;

