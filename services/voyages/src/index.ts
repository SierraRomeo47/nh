import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import voyagesRoutes from './routes/voyages.routes';
import ovdRoutes from './routes/ovd.routes';
import reportsRoutes from './routes/reports.routes';
import { syncScheduler } from './services/sync.scheduler';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3003;

// CORS configuration
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Trace-Id', 'X-User-Id', 'X-User-Role', 'X-User-Email', 'X-Organization-Id']
}));

app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'voyages' });
});

// API Routes
app.use('/api/voyages', voyagesRoutes);
app.use('/api/voyages/ovd', ovdRoutes);
app.use('/api/voyages/reports', reportsRoutes);

// Initialize sync scheduler
syncScheduler.initialize().catch(err => {
  console.error('Failed to initialize sync scheduler:', err);
});

app.listen(PORT, () => {
  console.log(`Voyages service running on port ${PORT}`);
  console.log(`OVD integration enabled`);
  console.log(`Vessel reporting system enabled (Noon/Bunker/SOF)`);
});

