import express, { Application, Request, Response } from 'express';
import dotenv from 'dotenv';
import masterDataRoutes from './routes/master-data.routes';

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3008;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  
  next();
});

// Routes
app.use('/master-data', masterDataRoutes);

// Root health check
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'master-data',
    description: 'Master Data Service - Single source of truth for vessels, organizations, users, and reference data',
    timestamp: new Date().toISOString(),
  });
});

// Error handling
app.use((err: Error, req: Request, res: Response, next: any) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: err.message,
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`📊 Master Data Service running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
  console.log(`📝 API endpoints: http://localhost:${PORT}/master-data`);
  console.log(`🎯 Purpose: Single source of truth for all master data`);
});

export default app;

