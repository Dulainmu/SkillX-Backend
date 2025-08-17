// tests/module1/career-assessment.test.js
// Module 1: Career Assessment & Quiz System - Automated Test Cases

const request = require('supertest');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const app = require('../../src/app');
const User = require('../../src/models/User');
const Quiz = require('../../src/models/Quiz');
const QuizResult = require('../../src/models/QuizResult');
const CareerRole = require('../../src/models/CareerRole');

describe('Module 1: Career Assessment & Quiz System', () => {
  let testUser, testAdmin, testQuiz, testCareerRole, authToken, adminToken;

  beforeEach(async () => {
    // Create test data
    testUser = await global.testUtils.createTestUser(User);
    testAdmin = await global.testUtils.createTestAdmin(User);
    testQuiz = await global.testUtils.createTestQuiz(Quiz);
    testCareerRole = await global.testUtils.createTestCareerRole(CareerRole);

    // Generate auth tokens
    authToken = jwt.sign({ userId: testUser._id }, process.env.JWT_SECRET || 'test-secret');
    adminToken = jwt.sign({ userId: testAdmin._id }, process.env.JWT_SECRET || 'test-secret');
  });

  describe('TC_AUTO_001: Login Functionality Test', () => {
    test('should successfully log in with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe('test@example.com');
      expect(response.body.user.role).toBe('learner');
    });

    test('should reject login with invalid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message');
    });

    test('should reject login with non-existent email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(401);
    });
  });

  describe('TC_AUTO_002: Quiz Questions Loading Test', () => {
    test('should load quiz questions successfully', async () => {
      const response = await request(app)
        .get('/api/quiz')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      
      const quiz = response.body[0];
      expect(quiz).toHaveProperty('title');
      expect(quiz).toHaveProperty('description');
      expect(quiz).toHaveProperty('questions');
      expect(Array.isArray(quiz.questions)).toBe(true);
    });

    test('should load specific quiz by ID', async () => {
      const response = await request(app)
        .get(`/api/quiz/${testQuiz._id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('_id', testQuiz._id.toString());
      expect(response.body).toHaveProperty('title', 'Test Quiz');
      expect(response.body).toHaveProperty('questions');
    });

    test('should handle non-existent quiz gracefully', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await request(app)
        .get(`/api/quiz/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe('TC_AUTO_003: Answer Validation Test', () => {
    test('should validate and store quiz answers correctly', async () => {
      const quizAnswers = {
        quizId: testQuiz._id,
        answers: [
          {
            questionIndex: 0,
            selectedAnswer: 0, // Correct answer
            timeSpent: 30
          }
        ],
        totalTime: 30
      };

      const response = await request(app)
        .post('/api/quiz/submit')
        .set('Authorization', `Bearer ${authToken}`)
        .send(quizAnswers);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('resultId');
      expect(response.body).toHaveProperty('score');
      expect(response.body).toHaveProperty('totalQuestions');
      expect(response.body).toHaveProperty('correctAnswers');

      // Verify result is stored in database
      const storedResult = await QuizResult.findById(response.body.resultId);
      expect(storedResult).toBeTruthy();
      expect(storedResult.userId.toString()).toBe(testUser._id.toString());
      expect(storedResult.quizId.toString()).toBe(testQuiz._id.toString());
    });

    test('should calculate correct score for mixed answers', async () => {
      const quizAnswers = {
        quizId: testQuiz._id,
        answers: [
          {
            questionIndex: 0,
            selectedAnswer: 1, // Wrong answer
            timeSpent: 30
          }
        ],
        totalTime: 30
      };

      const response = await request(app)
        .post('/api/quiz/submit')
        .set('Authorization', `Bearer ${authToken}`)
        .send(quizAnswers);

      expect(response.status).toBe(200);
      expect(response.body.score).toBe(0); // Should be 0 for wrong answer
      expect(response.body.correctAnswers).toBe(0);
    });

    test('should reject invalid quiz submission', async () => {
      const invalidAnswers = {
        quizId: 'invalid-id',
        answers: []
      };

      const response = await request(app)
        .post('/api/quiz/submit')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidAnswers);

      expect(response.status).toBe(400);
    });
  });

  describe('TC_AUTO_004: Career Recommendation Engine Test', () => {
    test('should generate relevant career recommendations based on quiz results', async () => {
      // First submit a quiz result
      const quizAnswers = {
        quizId: testQuiz._id,
        answers: [
          {
            questionIndex: 0,
            selectedAnswer: 0,
            timeSpent: 30
          }
        ],
        totalTime: 30
      };

      await request(app)
        .post('/api/quiz/submit')
        .set('Authorization', `Bearer ${authToken}`)
        .send(quizAnswers);

      // Get career recommendations
      const response = await request(app)
        .get('/api/recommendations/careers')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);

      // Verify recommendation structure
      const recommendation = response.body[0];
      expect(recommendation).toHaveProperty('id');
      expect(recommendation).toHaveProperty('name');
      expect(recommendation).toHaveProperty('description');
      expect(recommendation).toHaveProperty('weightedScore');
      expect(recommendation).toHaveProperty('skillFit');
      expect(recommendation).toHaveProperty('personalityFit');
      expect(typeof recommendation.weightedScore).toBe('number');
      expect(recommendation.weightedScore).toBeGreaterThanOrEqual(0);
      expect(recommendation.weightedScore).toBeLessThanOrEqual(100);
    });

    test('should rank recommendations by relevance score', async () => {
      const response = await request(app)
        .get('/api/recommendations/careers')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      
      // Check if recommendations are sorted by score (highest first)
      const scores = response.body.map(rec => rec.weightedScore);
      const sortedScores = [...scores].sort((a, b) => b - a);
      expect(scores).toEqual(sortedScores);
    });

    test('should include missing skills analysis', async () => {
      const response = await request(app)
        .get('/api/recommendations/careers')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      
      const recommendation = response.body[0];
      expect(recommendation).toHaveProperty('missingSkills');
      expect(Array.isArray(recommendation.missingSkills)).toBe(true);
    });
  });

  describe('TC_AUTO_005: Skills Rating System Test', () => {
    test('should save technical skills ratings correctly', async () => {
      const skillsData = {
        skills: {
          'JavaScript': { level: 3, selected: true },
          'Python': { level: 2, selected: true },
          'React': { level: 4, selected: true }
        }
      };

      const response = await request(app)
        .post('/api/skills/rate')
        .set('Authorization', `Bearer ${authToken}`)
        .send(skillsData);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Skills rated successfully');

      // Verify skills are saved in user profile
      const updatedUser = await User.findById(testUser._id);
      expect(updatedUser.skills).toEqual(skillsData.skills);
    });

    test('should save personal qualities ratings', async () => {
      const personalQualities = {
        'Communication': { level: 4, selected: true },
        'Leadership': { level: 3, selected: true },
        'Problem Solving': { level: 5, selected: true }
      };

      const response = await request(app)
        .post('/api/skills/rate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ skills: personalQualities });

      expect(response.status).toBe(200);

      // Verify personal qualities are saved
      const updatedUser = await User.findById(testUser._id);
      expect(updatedUser.skills).toEqual(personalQualities);
    });

    test('should validate skill level ranges', async () => {
      const invalidSkills = {
        'JavaScript': { level: 7, selected: true } // Invalid level > 5
      };

      const response = await request(app)
        .post('/api/skills/rate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ skills: invalidSkills });

      expect(response.status).toBe(400);
    });

    test('should update existing skills ratings', async () => {
      // First save initial ratings
      const initialSkills = {
        'JavaScript': { level: 2, selected: true }
      };

      await request(app)
        .post('/api/skills/rate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ skills: initialSkills });

      // Update the rating
      const updatedSkills = {
        'JavaScript': { level: 4, selected: true }
      };

      const response = await request(app)
        .post('/api/skills/rate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ skills: updatedSkills });

      expect(response.status).toBe(200);

      // Verify the update
      const updatedUser = await User.findById(testUser._id);
      expect(updatedUser.skills['JavaScript'].level).toBe(4);
    });
  });
});
