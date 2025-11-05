import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import complianceRoutes from './routes/compliance.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3004;

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
  res.json({ status: 'ok', service: 'compliance' });
});

// API Routes
app.use('/api', complianceRoutes);

app.listen(PORT, () => {
  console.log(`Compliance service running on port ${PORT}`);
});


