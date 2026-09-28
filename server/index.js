require('dotenv').config();

const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');

const connectDB = require('./src/config/db');
const gemini = require('./src/utils/gemini');
const handleUploadErrors = require('./src/middleware/uploadError');
const { notFound, errorHandler } = require('./src/middleware/errorHandler');

const authRoutes = require('./src/routes/authRoutes');
const materialRoutes = require('./src/routes/materialRoutes');
const aiRoutes = require('./src/routes/aiRoutes');
const adminRoutes = require('./src/routes/adminRoutes');

const app = express();

app.set('trust proxy', 1);

app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);
app.use(compression());
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
if (process.env.NODE_ENV !== 'test') app.use(morgan('dev'));

app.use(
  '/api',
  rateLimit({
    windowMs: 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Too many requests, please slow down.' },
  })
);

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    status: 'ok',
    service: 'AI StudyBuddy API',
    version: '1.0.0',
    author: 'Hasim Rizvi',
    college: 'Mohamed Sathak College of Arts and Science',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    ai: gemini.engineStatus(),
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/materials', materialRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/admin', adminRoutes);

const CLIENT_DIST = path.join(__dirname, '..', 'client', 'dist');
if (fs.existsSync(CLIENT_DIST)) {
  app.use(express.static(CLIENT_DIST));
  app.get(/^(?!\/api).*/, (req, res) => {
    res.sendFile(path.join(CLIENT_DIST, 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.json({
      success: true,
      message:
        'AI StudyBuddy API is running. The frontend build was not found - run "npm run build" in the client folder.',
      docs: '/api/health',
    });
  });
}

app.use(handleUploadErrors);
app.use('/api', notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const start = async () => {
  await connectDB();
  const engine = gemini.engineStatus();
  app.listen(PORT, () => {
    console.log('==============================================');
    console.log('  AI StudyBuddy API');
    console.log(`  Mode        : ${process.env.NODE_ENV || 'development'}`);
    console.log(`  Server      : http://localhost:${PORT}`);
    console.log(`  Health      : http://localhost:${PORT}/api/health`);
    console.log(`  AI engine   : ${engine.engine} (${engine.model})`);
    console.log('==============================================');
  });
};

if (require.main === module) {
  start().catch((error) => {
    console.error(`[Server] Startup failed: ${error.message}`);
    process.exit(1);
  });
}

module.exports = app;
module.exports.start = start;
module.exports.app = app;
