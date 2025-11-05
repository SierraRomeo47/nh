import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import tradingRoutes from './routes/trading.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3005;

// CORS configuration
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Trace-Id']
}));

app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'trading' });
});

// API Routes
app.use('/api', tradingRoutes);

app.listen(PORT, () => {
  console.log(`Trading service running on port ${PORT}`);
});


