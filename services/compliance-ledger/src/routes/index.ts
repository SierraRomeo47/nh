import { Router } from 'express';
import { EmissionsController } from '../controllers/emissions.controller';
import { FuelEUController } from '../controllers/fuelEu.controller';
import { EUAController } from '../controllers/eua.controller';
import { PoolController } from '../controllers/pool.controller';
import { EmissionService } from '../services/emission.service';
import { FuelEUBalanceService } from '../services/balance.service';
import { EUAService } from '../services/eua.service';
import { PoolService } from '../services/pool.service';
import { prisma } from '../config/database';

// Initialize services
const emissionService = new EmissionService(prisma);
const balanceService = new FuelEUBalanceService(prisma);
const euaService = new EUAService(prisma);
const poolService = new PoolService(prisma);

// Initialize controllers
const emissionsController = new EmissionsController(emissionService);
const fuelEuController = new FuelEUController(balanceService);
const euaController = new EUAController(euaService);
const poolController = new PoolController(poolService);

const router = Router();

// Emissions routes
router.post('/emissions', (req, res) => emissionsController.recordEmission(req, res));
router.put('/emissions/:id', (req, res) => emissionsController.updateEmission(req, res));

// FuelEU routes
router.post('/fueleu/balance', (req, res) => fuelEuController.adjustBalance(req, res));
router.get('/fueleu/balance', (req, res) => fuelEuController.getBalance(req, res));
router.post('/fueleu/bank/:companyId/:periodYear', (req, res) =>
  fuelEuController.bankToNextPeriod(req, res)
);

// EUA routes
router.post('/eua/forecast', (req, res) => euaController.forecast(req, res));
router.post('/eua/surrender', (req, res) => euaController.surrender(req, res));
router.post('/eua/reconcile', (req, res) => euaController.reconcile(req, res));
router.get('/eua/accuracy/:companyId/:periodYear', (req, res) =>
  euaController.getForecastAccuracy(req, res)
);

// Pool routes
router.post('/pools/allocate', (req, res) => poolController.allocate(req, res));
router.get('/pools/performance/:poolId/:periodYear', (req, res) =>
  poolController.getPoolPerformance(req, res)
);

export default router;

