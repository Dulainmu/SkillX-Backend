// tests/module4/admin-career-management.test.js
// Module 4: Admin - Career Path Management - Automated Test Cases

const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../../src/app');
const User = require('../../src/models/User');
const CareerRole = require('../../src/models/CareerRole');

describe('Module 4: Admin - Career Path Management', () => {
  let testAdmin, testUser, adminToken, userToken;

  beforeEach(async () => {
    // Create test data
    testAdmin = await global.testUtils.createTestAdmin(User);
    testUser = await global.testUtils.createTestUser(User);

    // Generate auth tokens
    adminToken = jwt.sign({ userId: testAdmin._id }, process.env.JWT_SECRET || 'test-secret');
    userToken = jwt.sign({ userId: testUser._id }, process.env.JWT_SECRET || 'test-secret');
  });

  describe('TC_AUTO_013: Admin Access Control Test', () => {
    test('should allow admin access to management features', async () => {
      const response = await request(app)
        .get('/api/admin/careers')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    test('should prevent regular users from accessing admin features', async () => {
      const response = await request(app)
        .get('/api/admin/careers')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('message');
    });

    test('should prevent unauthorized access without token', async () => {
      const response = await request(app)
        .get('/api/admin/careers');

      expect(response.status).toBe(401);
    });

    test('should verify admin-only features are accessible', async () => {
      // Test various admin endpoints
      const endpoints = [
        '/api/admin/careers',
        '/api/admin/careers/create',
        '/api/admin/users',
        '/api/admin/analytics'
      ];

      for (const endpoint of endpoints) {
        const response = await request(app)
          .get(endpoint)
          .set('Authorization', `Bearer ${adminToken}`);

        // Should not return 403 (forbidden) for admin
        expect(response.status).not.toBe(403);
      }
    });
  });

  describe('TC_AUTO_014: Career Path CRUD Operations Test', () => {
    test('should create a new career path with all required information', async () => {
      const careerData = {
        name: 'Data Scientist',
        description: 'A career path for data science professionals',
        slug: 'data-scientist',
        isActive: true,
        vector: [0.7, 0.8, 0.6, 0.5, 0.4, 0.9, 0.3, 0.7, 0.6, 0.8, 0.5, 0.7],
        requiredSkills: [
          {
            skillName: 'Python',
            requiredLevel: 4,
            importance: 'essential'
          },
          {
            skillName: 'Statistics',
            requiredLevel: 3,
            importance: 'important'
          }
        ],
        detailedRoadmap: [
          {
            title: 'Python Fundamentals',
            description: 'Learn Python basics',
            order: 1,
            materials: []
          },
          {
            title: 'Data Analysis',
            description: 'Learn data analysis techniques',
            order: 2,
            materials: []
          }
        ],
        averageSalary: 85000,
        jobGrowth: 'High'
      };

      const response = await request(app)
        .post('/api/admin/careers')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(careerData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('_id');
      expect(response.body.name).toBe('Data Scientist');
      expect(response.body.slug).toBe('data-scientist');
      expect(response.body.isActive).toBe(true);

      // Verify it's saved in database
      const savedCareer = await CareerRole.findById(response.body._id);
      expect(savedCareer).toBeTruthy();
      expect(savedCareer.name).toBe('Data Scientist');
    });

    test('should read/view career path details', async () => {
      // First create a career path
      const careerData = {
        name: 'UX Designer',
        description: 'User experience design career path',
        slug: 'ux-designer',
        isActive: true,
        vector: [0.5, 0.6, 0.8, 0.7, 0.4, 0.3, 0.9, 0.6, 0.5, 0.4, 0.7, 0.6],
        requiredSkills: [
          {
            skillName: 'Design',
            requiredLevel: 3,
            importance: 'essential'
          }
        ],
        detailedRoadmap: [
          {
            title: 'Design Fundamentals',
            description: 'Learn design basics',
            order: 1,
            materials: []
          }
        ]
      };

      const createResponse = await request(app)
        .post('/api/admin/careers')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(careerData);

      const careerId = createResponse.body._id;

      // Read the career path
      const readResponse = await request(app)
        .get(`/api/admin/careers/${careerId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(readResponse.status).toBe(200);
      expect(readResponse.body).toHaveProperty('_id', careerId);
      expect(readResponse.body.name).toBe('UX Designer');
      expect(readResponse.body.description).toBe('User experience design career path');
      expect(readResponse.body.isActive).toBe(true);
    });

    test('should update existing career path information', async () => {
      // First create a career path
      const careerData = {
        name: 'Web Developer',
        description: 'Web development career path',
        slug: 'web-developer',
        isActive: true,
        vector: [0.6, 0.7, 0.5, 0.4, 0.3, 0.8, 0.6, 0.5, 0.7, 0.6, 0.4, 0.5],
        requiredSkills: [
          {
            skillName: 'JavaScript',
            requiredLevel: 3,
            importance: 'essential'
          }
        ],
        detailedRoadmap: [
          {
            title: 'JavaScript Basics',
            description: 'Learn JavaScript',
            order: 1,
            materials: []
          }
        ]
      };

      const createResponse = await request(app)
        .post('/api/admin/careers')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(careerData);

      const careerId = createResponse.body._id;

      // Update the career path
      const updateData = {
        name: 'Full Stack Developer',
        description: 'Updated description for full stack development',
        averageSalary: 95000,
        jobGrowth: 'Very High'
      };

      const updateResponse = await request(app)
        .put(`/api/admin/careers/${careerId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData);

      expect(updateResponse.status).toBe(200);
      expect(updateResponse.body.name).toBe('Full Stack Developer');
      expect(updateResponse.body.description).toBe('Updated description for full stack development');
      expect(updateResponse.body.averageSalary).toBe(95000);

      // Verify update in database
      const updatedCareer = await CareerRole.findById(careerId);
      expect(updatedCareer.name).toBe('Full Stack Developer');
    });

    test('should delete a career path', async () => {
      // First create a career path
      const careerData = {
        name: 'Mobile Developer',
        description: 'Mobile development career path',
        slug: 'mobile-developer',
        isActive: true,
        vector: [0.5, 0.6, 0.7, 0.4, 0.3, 0.8, 0.6, 0.5, 0.4, 0.7, 0.6, 0.5],
        requiredSkills: [
          {
            skillName: 'React Native',
            requiredLevel: 3,
            importance: 'essential'
          }
        ],
        detailedRoadmap: [
          {
            title: 'Mobile Development Basics',
            description: 'Learn mobile development',
            order: 1,
            materials: []
          }
        ]
      };

      const createResponse = await request(app)
        .post('/api/admin/careers')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(careerData);

      const careerId = createResponse.body._id;

      // Delete the career path
      const deleteResponse = await request(app)
        .delete(`/api/admin/careers/${careerId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(deleteResponse.status).toBe(200);
      expect(deleteResponse.body).toHaveProperty('message', 'Career path deleted successfully');

      // Verify it's deleted from database
      const deletedCareer = await CareerRole.findById(careerId);
      expect(deletedCareer).toBeNull();
    });

    test('should list all career paths', async () => {
      // Create multiple career paths
      const careers = [
        {
          name: 'Frontend Developer',
          description: 'Frontend development career',
          slug: 'frontend-developer',
          isActive: true,
          vector: [0.6, 0.7, 0.5, 0.4, 0.3, 0.8, 0.6, 0.5, 0.4, 0.7, 0.6, 0.5],
          requiredSkills: [],
          detailedRoadmap: []
        },
        {
          name: 'Backend Developer',
          description: 'Backend development career',
          slug: 'backend-developer',
          isActive: true,
          vector: [0.5, 0.6, 0.7, 0.4, 0.3, 0.8, 0.6, 0.5, 0.4, 0.7, 0.6, 0.5],
          requiredSkills: [],
          detailedRoadmap: []
        }
      ];

      for (const career of careers) {
        await request(app)
          .post('/api/admin/careers')
          .set('Authorization', `Bearer ${adminToken}`)
          .send(career);
      }

      // List all career paths
      const listResponse = await request(app)
        .get('/api/admin/careers')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(listResponse.status).toBe(200);
      expect(Array.isArray(listResponse.body)).toBe(true);
      expect(listResponse.body.length).toBeGreaterThanOrEqual(2);

      // Verify career paths are in the list
      const careerNames = listResponse.body.map(c => c.name);
      expect(careerNames).toContain('Frontend Developer');
      expect(careerNames).toContain('Backend Developer');
    });
  });

  describe('TC_AUTO_015: Form Validation Test', () => {
    test('should reject forms with missing required fields', async () => {
      const invalidCareerData = {
        description: 'Missing name and slug',
        isActive: true
      };

      const response = await request(app)
        .post('/api/admin/careers')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidCareerData);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('name');
    });

    test('should reject invalid data formats', async () => {
      const invalidCareerData = {
        name: 'Test Career',
        description: 'Test description',
        slug: 'test-career',
        isActive: 'not-a-boolean', // Invalid boolean
        vector: 'not-an-array', // Invalid array
        requiredSkills: 'not-an-array' // Invalid array
      };

      const response = await request(app)
        .post('/api/admin/careers')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidCareerData);

      expect(response.status).toBe(400);
    });

    test('should validate field length limits', async () => {
      const longName = 'A'.repeat(256); // Exceeds typical name length limit
      const invalidCareerData = {
        name: longName,
        description: 'Test description',
        slug: 'test-career',
        isActive: true
      };

      const response = await request(app)
        .post('/api/admin/careers')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidCareerData);

      expect(response.status).toBe(400);
    });

    test('should accept valid data formats', async () => {
      const validCareerData = {
        name: 'Valid Career',
        description: 'A valid career path description',
        slug: 'valid-career',
        isActive: true,
        vector: [0.5, 0.6, 0.7, 0.4, 0.3, 0.8, 0.6, 0.5, 0.4, 0.7, 0.6, 0.5],
        requiredSkills: [
          {
            skillName: 'JavaScript',
            requiredLevel: 3,
            importance: 'essential'
          }
        ],
        detailedRoadmap: [
          {
            title: 'Step 1',
            description: 'First step',
            order: 1,
            materials: []
          }
        ],
        averageSalary: 75000,
        jobGrowth: 'High'
      };

      const response = await request(app)
        .post('/api/admin/careers')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(validCareerData);

      expect(response.status).toBe(201);
      expect(response.body.name).toBe('Valid Career');
    });

    test('should validate slug uniqueness', async () => {
      // Create first career with slug
      const firstCareer = {
        name: 'First Career',
        description: 'First career description',
        slug: 'duplicate-slug',
        isActive: true,
        vector: [0.5, 0.6, 0.7, 0.4, 0.3, 0.8, 0.6, 0.5, 0.4, 0.7, 0.6, 0.5],
        requiredSkills: [],
        detailedRoadmap: []
      };

      await request(app)
        .post('/api/admin/careers')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(firstCareer);

      // Try to create second career with same slug
      const secondCareer = {
        name: 'Second Career',
        description: 'Second career description',
        slug: 'duplicate-slug', // Same slug
        isActive: true,
        vector: [0.5, 0.6, 0.7, 0.4, 0.3, 0.8, 0.6, 0.5, 0.4, 0.7, 0.6, 0.5],
        requiredSkills: [],
        detailedRoadmap: []
      };

      const response = await request(app)
        .post('/api/admin/careers')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(secondCareer);

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('slug');
    });
  });
});
