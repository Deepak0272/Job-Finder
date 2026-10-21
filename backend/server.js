import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import { errorHandler } from './middleware/errorHandler.js';

// Import route handlers
import authRoutes from './routes/authRoutes.js';
import jobRoutes from './routes/jobRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import savedJobRoutes from './routes/savedJobRoutes.js';
import applicationRoutes from './routes/applicationRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

// Import auto-seed helper
import { seedDatabaseIfEmpty } from './seed.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS
app.use(
  cors({
    origin: '*',
    credentials: true,
  })
);

// Express body parser
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Request logger in dev
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log(`[API Request] ${req.method} ${req.originalUrl}`);
    next();
  });
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'AI Job Finder Backend Service is running optimally.',
    timestamp: new Date().toISOString(),
    aiEngine: process.env.OPENAI_API_KEY ? 'OpenAI GPT-4o-mini' : 'Built-in Intelligent Heuristic Engine',
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/saved-jobs', savedJobRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/admin', adminRoutes);

// 404 Route Handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint '${req.originalUrl}' not found.`,
  });
});

// Centralized error handling middleware
app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    await connectDB();

    // Check and seed demo jobs and users if database is fresh
    await seedDatabaseIfEmpty();

    app.listen(PORT, () => {
      console.log(`🚀 [Server] AI Job Finder backend listening on http://localhost:${PORT}`);
      console.log(`🌐 [API Docs & Health] http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error('❌ [Server Init Error]:', error);
    process.exit(1);
  }
};

startServer();

export default app;
