import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import vesselsRoutes from './routes/vessels.routes';
import fleetsRoutes from './routes/fleets.routes';
import portsRoutes from './routes/ports.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3002;

// CORS configuration
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'vessels' });
});

// API routes
app.use('/api/vessels', vesselsRoutes);
app.use('/api/fleets', fleetsRoutes);
app.use('/api/ports', portsRoutes);

app.listen(PORT, () => {
  console.log(`Vessels service running on port ${PORT}`);
});

