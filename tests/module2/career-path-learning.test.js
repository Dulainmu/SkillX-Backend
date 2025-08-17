// tests/module2/career-path-learning.test.js
// Module 2: Career Path & Learning Materials - Automated Test Cases

const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../../src/app');
const User = require('../../src/models/User');
const CareerRole = require('../../src/models/CareerRole');
const LearningMaterial = require('../../src/models/LearningMaterial');
const UserCareerProgress = require('../../src/models/UserCareerProgress');

describe('Module 2: Career Path & Learning Materials', () => {
  let testUser, testCareerRole, testMaterial, authToken;

  beforeEach(async () => {
    // Create test data
    testUser = await global.testUtils.createTestUser(User);
    
    testCareerRole = await global.testUtils.createTestCareerRole(CareerRole, {
      name: 'Frontend Developer',
      description: 'A frontend developer career path',
      slug: 'frontend-developer',
      detailedRoadmap: [
        {
          title: 'HTML Fundamentals',
          description: 'Learn HTML basics',
          order: 1,
          materials: []
        },
        {
          title: 'CSS Styling',
          description: 'Learn CSS styling',
          order: 2,
          materials: []
        },
        {
          title: 'JavaScript Basics',
          description: 'Learn JavaScript fundamentals',
          order: 3,
          materials: []
        }
      ]
    });

    testMaterial = await LearningMaterial.create({
      title: 'HTML Basics Tutorial',
      description: 'Learn HTML fundamentals',
      type: 'video',
      url: 'https://example.com/html-tutorial',
      duration: 30,
      difficulty: 'beginner',
      tags: ['html', 'frontend', 'basics']
    });

    // Generate auth token
    authToken = jwt.sign({ userId: testUser._id }, process.env.JWT_SECRET || 'test-secret');
  });

  describe('TC_AUTO_006: Career Path Selection Test', () => {
    test('should allow users to browse available career paths', async () => {
      const response = await request(app)
        .get('/api/careers')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);

      const careerPath = response.body[0];
      expect(careerPath).toHaveProperty('_id');
      expect(careerPath).toHaveProperty('name');
      expect(careerPath).toHaveProperty('description');
      expect(careerPath).toHaveProperty('slug');
      expect(careerPath).toHaveProperty('isActive', true);
    });

    test('should allow users to select a specific career path', async () => {
      const response = await request(app)
        .get(`/api/careers/${testCareerRole.slug}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('_id', testCareerRole._id.toString());
      expect(response.body).toHaveProperty('name', 'Frontend Developer');
      expect(response.body).toHaveProperty('description');
      expect(response.body).toHaveProperty('detailedRoadmap');
      expect(Array.isArray(response.body.detailedRoadmap)).toBe(true);
    });

    test('should load learning roadmap with proper structure', async () => {
      const response = await request(app)
        .get(`/api/careers/${testCareerRole.slug}/roadmap`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(3); // 3 roadmap steps

      const roadmapStep = response.body[0];
      expect(roadmapStep).toHaveProperty('title', 'HTML Fundamentals');
      expect(roadmapStep).toHaveProperty('description');
      expect(roadmapStep).toHaveProperty('order', 1);
      expect(roadmapStep).toHaveProperty('materials');
    });

    test('should handle non-existent career path gracefully', async () => {
      const response = await request(app)
        .get('/api/careers/non-existent-path')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe('TC_AUTO_007: Learning Materials Access Test', () => {
    test('should retrieve and display learning materials', async () => {
      const response = await request(app)
        .get('/api/materials')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);

      const material = response.body[0];
      expect(material).toHaveProperty('_id');
      expect(material).toHaveProperty('title');
      expect(material).toHaveProperty('description');
      expect(material).toHaveProperty('type');
      expect(material).toHaveProperty('url');
      expect(material).toHaveProperty('duration');
      expect(material).toHaveProperty('difficulty');
    });

    test('should filter materials by type', async () => {
      const response = await request(app)
        .get('/api/materials?type=video')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      
      // All returned materials should be videos
      response.body.forEach(material => {
        expect(material.type).toBe('video');
      });
    });

    test('should filter materials by difficulty', async () => {
      const response = await request(app)
        .get('/api/materials?difficulty=beginner')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      
      // All returned materials should be beginner level
      response.body.forEach(material => {
        expect(material.difficulty).toBe('beginner');
      });
    });

    test('should get specific material by ID', async () => {
      const response = await request(app)
        .get(`/api/materials/${testMaterial._id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('_id', testMaterial._id.toString());
      expect(response.body).toHaveProperty('title', 'HTML Basics Tutorial');
      expect(response.body).toHaveProperty('url', 'https://example.com/html-tutorial');
    });

    test('should handle different material types correctly', async () => {
      // Create different types of materials
      const videoMaterial = await LearningMaterial.create({
        title: 'Video Tutorial',
        type: 'video',
        url: 'https://example.com/video',
        duration: 45
      });

      const documentMaterial = await LearningMaterial.create({
        title: 'PDF Guide',
        type: 'document',
        url: 'https://example.com/guide.pdf',
        duration: 20
      });

      const linkMaterial = await LearningMaterial.create({
        title: 'External Resource',
        type: 'link',
        url: 'https://example.com/resource',
        duration: 15
      });

      // Test video material
      const videoResponse = await request(app)
        .get(`/api/materials/${videoMaterial._id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(videoResponse.status).toBe(200);
      expect(videoResponse.body.type).toBe('video');

      // Test document material
      const documentResponse = await request(app)
        .get(`/api/materials/${documentMaterial._id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(documentResponse.status).toBe(200);
      expect(documentResponse.body.type).toBe('document');

      // Test link material
      const linkResponse = await request(app)
        .get(`/api/materials/${linkMaterial._id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(linkResponse.status).toBe(200);
      expect(linkResponse.body.type).toBe('link');
    });
  });

  describe('TC_AUTO_008: Progress Tracking Test', () => {
    test('should track learner progress through materials', async () => {
      // Mark a material as completed
      const progressData = {
        materialId: testMaterial._id,
        status: 'completed',
        timeSpent: 25,
        completedAt: new Date()
      };

      const response = await request(app)
        .post('/api/progress/materials')
        .set('Authorization', `Bearer ${authToken}`)
        .send(progressData);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Progress updated successfully');

      // Verify progress is saved
      const userProgress = await UserCareerProgress.findOne({
        userId: testUser._id,
        materialId: testMaterial._id
      });

      expect(userProgress).toBeTruthy();
      expect(userProgress.status).toBe('completed');
      expect(userProgress.timeSpent).toBe(25);
    });

    test('should track progress for career path steps', async () => {
      const stepProgressData = {
        careerRoleId: testCareerRole._id,
        stepIndex: 0, // HTML Fundamentals step
        status: 'in-progress',
        timeSpent: 30
      };

      const response = await request(app)
        .post('/api/progress/career-steps')
        .set('Authorization', `Bearer ${authToken}`)
        .send(stepProgressData);

      expect(response.status).toBe(200);

      // Verify step progress is saved
      const stepProgress = await UserCareerProgress.findOne({
        userId: testUser._id,
        careerRoleId: testCareerRole._id,
        stepIndex: 0
      });

      expect(stepProgress).toBeTruthy();
      expect(stepProgress.status).toBe('in-progress');
    });

    test('should display progress indicators correctly', async () => {
      // First mark some progress
      await request(app)
        .post('/api/progress/materials')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          materialId: testMaterial._id,
          status: 'completed',
          timeSpent: 25
        });

      // Get progress summary
      const response = await request(app)
        .get('/api/progress/summary')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('totalMaterials');
      expect(response.body).toHaveProperty('completedMaterials');
      expect(response.body).toHaveProperty('completionPercentage');
      expect(response.body).toHaveProperty('timeSpent');
    });

    test('should save progress when returning later', async () => {
      // Mark initial progress
      await request(app)
        .post('/api/progress/materials')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          materialId: testMaterial._id,
          status: 'in-progress',
          timeSpent: 15
        });

      // Simulate returning later and updating progress
      await request(app)
        .post('/api/progress/materials')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          materialId: testMaterial._id,
          status: 'completed',
          timeSpent: 30
        });

      // Verify final progress state
      const finalProgress = await UserCareerProgress.findOne({
        userId: testUser._id,
        materialId: testMaterial._id
      });

      expect(finalProgress.status).toBe('completed');
      expect(finalProgress.timeSpent).toBe(30);
    });

    test('should calculate overall career path progress', async () => {
      // Mark progress on multiple steps
      await request(app)
        .post('/api/progress/career-steps')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          careerRoleId: testCareerRole._id,
          stepIndex: 0,
          status: 'completed'
        });

      await request(app)
        .post('/api/progress/career-steps')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          careerRoleId: testCareerRole._id,
          stepIndex: 1,
          status: 'in-progress'
        });

      // Get career path progress
      const response = await request(app)
        .get(`/api/progress/career/${testCareerRole._id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('careerRoleId', testCareerRole._id.toString());
      expect(response.body).toHaveProperty('totalSteps', 3);
      expect(response.body).toHaveProperty('completedSteps');
      expect(response.body).toHaveProperty('inProgressSteps');
      expect(response.body).toHaveProperty('completionPercentage');
    });
  });
});
