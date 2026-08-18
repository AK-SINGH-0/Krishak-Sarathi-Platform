require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

// Routes
const authRoutes = require('./routes/authRoutes');
const weatherRoutes = require('./routes/weatherRoutes');
const aiRoutes = require('./routes/aiRoutes');
const ttsRoutes = require('./routes/ttsRoutes');
const schemesRoutes = require('./routes/schemesRoutes');
const surveyRoutes = require('./routes/surveyRoutes');
const contactRoutes = require('./routes/contactRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const userRoutes = require('./routes/userRoutes');
const detectionRoutes = require('./routes/detectionRoutes');
const statsRoutes = require('./routes/statsRoutes');

const app = express();

// Connect to MongoDB Atlas
connectDB();

// Middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
  })
);
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

// Simple request logger (helpful while testing with Thunder Client)
app.use((req, res, next) => {
  console.log(`${new Date().toLocaleTimeString()} - ${req.method} ${req.originalUrl}`);
  next();
});

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'Krishak Sarathi API is running 🌱', status: 'ok' });
});
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/tts', ttsRoutes);
app.use('/api/schemes', schemesRoutes);
app.use('/api/survey', surveyRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/users', userRoutes);
app.use('/api/detections', detectionRoutes);
app.use('/api/stats', statsRoutes);

// Error handlers (must be last)
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Krishak Sarathi backend successfuly running on http://localhost:${PORT}`);
});
