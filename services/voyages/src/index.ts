import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import voyagesRoutes from './routes/voyages.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3003;

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
  res.json({ status: 'ok', service: 'voyages' });
});

// API Routes
app.use('/api/voyages', voyagesRoutes);

app.listen(PORT, () => {
  console.log(`Voyages service running on port ${PORT}`);
});

