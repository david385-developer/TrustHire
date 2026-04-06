require('dotenv').config();
const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');
const path = require('path');
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const { verifyEmail } = require('./services/emailService');

const app = express();

const allowedOrigins = [
  'http://localhost:5173',
  process.env.CLIENT_URL
].filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health checks
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

app.get('/api/health', (req, res) => {
  const isDbConnected = mongoose.connection.readyState === 1;
  res.status(isDbConnected ? 200 : 503).json({
    success: isDbConnected,
    server: 'up',
    database: isDbConnected ? 'connected' : 'disconnected',
    timestamp: new Date()
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
