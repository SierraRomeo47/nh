import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/auth.routes.express';
import usersRoutes from './routes/users.routes';
import userAssignmentsRoutes from './routes/user-assignments.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// CORS configuration with credentials support for cookies
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true, // Required for cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Cookie parser middleware (required for reading cookies)
app.use(cookieParser());

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

