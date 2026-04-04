require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const { verifyEmail } = require('./services/emailService');

const app = express();

// Middleware
const allowedOrigins = new Set(
  [
    process.env.CLIENT_URL,
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:4173',
    'http://127.0.0.1:4173'
  ].filter(Boolean)
);

app.use(cors({
  origin(origin, callback) {
    if (!origin) return callback(null, true);
    const isAllowedDevOrigin = /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin);
    const isVercelOrigin = origin.endsWith('.vercel.app');
    if (allowedOrigins.has(origin) || isAllowedDevOrigin || isVercelOrigin) {
      return callback(null, true);
    }
    console.error(`[CORS] Rejected Origin: ${origin}`);
    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true
}));

app.use(express.json({ extended: false }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check
app.get('/api/health', (req, res) => {
  const isDbConnected = mongoose.connection.readyState === 1;
  res.status(isDbConnected ? 200 : 503).json({
    success: isDbConnected,
    server: 'up',
    database: isDbConnected ? 'connected' : 'disconnected'
  });
});

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/jobs', require('./routes/jobRoutes'));
app.use('/api/applications', require('./routes/applicationRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));
app.use('/api/recruiter', require('./routes/recruiterRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));

const PORT = process.env.PORT || 5000;

// Connect DB and Start Server
connectDB().then(async () => {
  console.log('--- STARTUP CHECK ---');
  console.log('PORT:', PORT);
  console.log('MONGO_URI:', process.env.MONGO_URI ? 'SET' : 'MISSING');
  console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'SET' : 'MISSING');
  console.log('MAILTRAP_USER:', process.env.MAILTRAP_USER ? 'SET' : 'MISSING');
  console.log('MAILTRAP_PASS:', process.env.MAILTRAP_PASS ? 'SET' : 'MISSING');
  console.log('CLIENT_URL:', process.env.CLIENT_URL || 'MISSING');
  console.log('RAZORPAY_KEY:', process.env.RAZORPAY_KEY_ID ? 'SET' : 'MISSING');

  await verifyEmail();

  // Start Cron job
  const { startCronJob } = require('./services/cronService');
  startCronJob();

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}).catch(err => {
  console.error('SERVER START FAILED:', err.message);
  process.exit(1);
});
