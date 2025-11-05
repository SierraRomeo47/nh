import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import apiRoutes from './routes/index';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3006;

// CORS configuration
app.use(
  cors({
    origin: 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'compliance-ledger' });
});

// API routes
app.use('/api', apiRoutes);

app.listen(PORT, () => {
  console.log(`Compliance ledger service running on port ${PORT}`);
});

