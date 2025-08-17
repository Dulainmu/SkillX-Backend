const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// CORS configuration
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

// Import routes
const learningMaterialRoutes = require('./routes/learningMaterialRoutes');
const adminLearningJourneyRoutes = require('./routes/adminLearningJourneyRoutes');
const adminProjectSubmissionsRoutes = require('./routes/adminProjectSubmissionsRoutes');
const adminAchievementsRoutes = require('./routes/adminAchievementsRoutes');
const adminUserProgressRoutes = require('./routes/adminUserProgressRoutes');
const skillGapRoutes = require('./routes/skillGapRoutes');

// Apply routes
app.use('/api/learning-materials', learningMaterialRoutes);
app.use('/api/admin/learning-journeys', adminLearningJourneyRoutes);
app.use('/api/admin/project-submissions', adminProjectSubmissionsRoutes);
app.use('/api/admin/achievements', adminAchievementsRoutes);
app.use('/api/admin/user-progress', adminUserProgressRoutes);
app.use('/api/skill-gap', skillGapRoutes);

app.get('/', (req, res) => {
  res.send('API is running');
});

module.exports = app;
