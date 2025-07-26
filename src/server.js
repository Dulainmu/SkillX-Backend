const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 4000;

// CORS configuration for production
const allowedOrigins = [
  'http://localhost:8080', // Local development
  'http://localhost:3000', // Alternative local port
  'http://localhost:5173', // Vite default port
  'https://skill-x-frontend.vercel.app', // Production frontend URL
  process.env.FRONTEND_URL, // Additional frontend URL from env
].filter(Boolean); // Remove undefined values

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json());

// Handle double slash URLs by redirecting to correct path
app.use((req, res, next) => {
  if (req.url.includes('//')) {
    const correctedUrl = req.url.replace(/\/+/g, '/');
    return res.redirect(correctedUrl);
  }
  next();
});

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

const userRoutes = require('./routes/userRoutes');
app.use('/api/users', userRoutes);

const quizRoutes = require('./routes/quizRoutes');
app.use('/api/quiz', quizRoutes);

const recommendationsRoutes = require('./routes/recommendationsRoutes');
app.use('/api/recommendations', recommendationsRoutes);

const userCareerProgressRoutes = require('./routes/userCareerProgressRoutes');
app.use('/api/progress', userCareerProgressRoutes);

const projectSubmissionRoutes = require('./routes/projectSubmissionRoutes');
app.use('/api/submissions', projectSubmissionRoutes);

app.get('/', (req, res) => {
  res.send('SkillX API is running');
});

// Health check endpoint for Railway
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch((err) => console.error('MongoDB connection error:', err));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
