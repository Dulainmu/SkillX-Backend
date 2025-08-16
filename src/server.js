//backend/src/server.js
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
  'https://skill-x-frontend-o0i6xhbpv-dulainmus-projects.vercel.app', // Current Vercel deployment URL
  process.env.FRONTEND_URL, // Additional frontend URL from env
].filter(Boolean); // Remove undefined values

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Allow all Vercel domains
    if (origin.includes('vercel.app') || origin.includes('localhost')) {
      return callback(null, true);
    }
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
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

const careerRoutes = require('./routes/career');
app.use('/api/careers', careerRoutes);

const projectsRoutes = require('./routes/projects');
app.use('/api/projects', projectsRoutes);

const quizRoutes = require('./routes/quiz');
app.use('/api/quiz', quizRoutes);

const recommendationsRoutes = require('./routes/recommendationsRoutes');
app.use('/api/recommendations', recommendationsRoutes);

const userCareerProgressRoutes = require('./routes/userCareerProgressRoutes');
app.use('/api/progress', userCareerProgressRoutes);

const projectSubmissionRoutes = require('./routes/projectSubmissionRoutes');
app.use('/api/submissions', projectSubmissionRoutes);

// Assessment progress routes
const assessmentProgressRoutes = require('./routes/assessmentProgressRoutes');
app.use('/api/assessment-progress', assessmentProgressRoutes);

const skillsRoutes = require('./routes/skills');
app.use('/api/skills', skillsRoutes);

const learningMaterialRoutes = require('./routes/learningMaterialRoutes');
app.use('/api/learning-materials', learningMaterialRoutes);

// Admin routes
const adminLearningJourneyRoutes = require('./routes/adminLearningJourneyRoutes');
const adminProjectSubmissionsRoutes = require('./routes/adminProjectSubmissionsRoutes');
const adminAchievementsRoutes = require('./routes/adminAchievementsRoutes');
const adminUserProgressRoutes = require('./routes/adminUserProgressRoutes');

app.use('/api/admin/learning-journeys', adminLearningJourneyRoutes);
app.use('/api/admin/project-submissions', adminProjectSubmissionsRoutes);
app.use('/api/admin/achievements', adminAchievementsRoutes);
app.use('/api/admin/user-progress', adminUserProgressRoutes);

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

// MongoDB connection function
async function connectToMongoDB() {
  const mongoURIs = [
    process.env.MONGO_URI,
    'mongodb+srv://dulainmu:abcd@database.n1bm2tm.mongodb.net/skillx?retryWrites=true&w=majority',
    'mongodb://localhost:27017/skillx'
  ];

  for (const uri of mongoURIs) {
    if (uri) {
      try {
                       await mongoose.connect(uri, {
                 serverSelectionTimeoutMS: 5000,
                 socketTimeoutMS: 45000,
               });
        console.log('MongoDB connected successfully');
        return;
      } catch (err) {
        console.log(`Failed to connect with URI: ${uri}`);
        continue;
      }
    }
  }
  
  console.error('Failed to connect to MongoDB with any URI');
  process.exit(1);
}

// Connect to MongoDB and start server
connectToMongoDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
