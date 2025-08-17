import dotenv from 'dotenv';
dotenv.config({ quiet: true });
import mongoose from 'mongoose';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import authRoutes from './src/routes/auth.js';
import deviceRoutes from './src/routes/devices.js';
import logRoutes from './src/routes/logs.js';
import './src/jobs/deviceAutoDeactivate.js';
const app = express();

// Core middleware
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));

// Debug middleware to log all incoming requests
app.use((req, res, next) => {
  next();
});

// Public auth routes (no rate limiter)
app.use('/auth', authRoutes);

// Protected device routes
app.use('/devices', deviceRoutes);

// Protected log & analytics routes
app.use('/devices/:id/logs', logRoutes);
app.use('/devices/:id/usage', logRoutes); // usage endpoint is handled in logs.js

// Catch-all error handler (should be last)
app.use((err, req, res, next) => {
  console.error('ERROR', err);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
.then(() => console.log('MongoDB connected'))
.catch((err) => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


export default app;
