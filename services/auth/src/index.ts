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
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [
  'http://localhost:3000',
  'https://*.vercel.app',
  'https://*.nautilushorizon.com',
  'https://nautilushorizon.com'
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.some(allowed => {
      if (allowed.includes('*')) {
        const pattern = allowed.replace('*', '.*');
        return new RegExp(`^${pattern}$`).test(origin);
      }
      return origin === allowed;
    })) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // Required for cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
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

// Export for Vercel serverless functions
export default app;

// Start server if not in serverless environment (Vercel sets VERCEL=1)
if (process.env.VERCEL !== '1') {
  app.listen(PORT, () => {
    console.log(`Auth service running on port ${PORT}`);
  });
}

