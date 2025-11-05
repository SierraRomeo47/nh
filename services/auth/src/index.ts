import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import authRoutes from './routes/auth.routes.express';
import usersRoutes from './routes/users.routes';
import userAssignmentsRoutes from './routes/user-assignments.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

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
  res.json({ status: 'ok', service: 'auth' });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api', userAssignmentsRoutes);

app.listen(PORT, () => {
  console.log(`Auth service running on port ${PORT}`);
});

