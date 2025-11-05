import { Router } from 'express';
import { MarketController } from '../controllers/market.controller';
import { RfqController } from '../controllers/rfq.controller';
import { PortfolioController } from '../controllers/portfolio.controller';

const router = Router();
const marketController = new MarketController();
const rfqController = new RfqController();
const portfolioController = new PortfolioController();

// Market Data Routes
router.get('/market/eua', marketController.getEuaPrice.bind(marketController));
router.get('/market/fuel', marketController.getFuelPrices.bind(marketController));
router.get('/market/history', marketController.getMarketHistory.bind(marketController));
router.post('/market/price', marketController.updateMarketPrice.bind(marketController));

// RFQ Routes
router.get('/rfqs', rfqController.listRfqs.bind(rfqController));
router.post('/rfqs', rfqController.createRfq.bind(rfqController));
router.get('/rfqs/:id', rfqController.getRfqById.bind(rfqController));
router.patch('/rfqs/:id', rfqController.updateRfq.bind(rfqController));
router.post('/rfqs/:id/offers', rfqController.createOffer.bind(rfqController));
router.patch('/offers/:id', rfqController.updateOffer.bind(rfqController));

// Portfolio & Trading Routes
router.get('/portfolio', portfolioController.getPortfolio.bind(portfolioController));
router.get('/opportunities', portfolioController.getOpportunities.bind(portfolioController));
router.get('/trades', portfolioController.getTrades.bind(portfolioController));

export default router;

