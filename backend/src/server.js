const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({
  origin: 'http://localhost:8080',
  credentials: true
}));

app.use(express.json());

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
  res.send('API is running');
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
