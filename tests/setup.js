// tests/setup.js
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

let mongod;

// Setup MongoDB Memory Server for testing
beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  await mongoose.connect(uri);
});

// Clean up after each test
afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany();
  }
});

// Cleanup after all tests
afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongod.stop();
});

// Global test utilities
global.testUtils = {
  // Helper to create test users
  createTestUser: async (UserModel, userData = {}) => {
    const defaultUser = {
      email: 'test@example.com',
      password: 'password123',
      firstName: 'Test',
      lastName: 'User',
      role: 'learner',
      ...userData
    };
    return await UserModel.create(defaultUser);
  },

  // Helper to create test admin
  createTestAdmin: async (UserModel, adminData = {}) => {
    const defaultAdmin = {
      email: 'admin@example.com',
      password: 'admin123',
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
      ...adminData
    };
    return await UserModel.create(defaultAdmin);
  },

  // Helper to create test career role
  createTestCareerRole: async (CareerRoleModel, roleData = {}) => {
    const defaultRole = {
      name: 'Test Career Role',
      description: 'A test career role for testing',
      slug: 'test-career-role',
      isActive: true,
      vector: [0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5],
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
          description: 'First step in the roadmap',
          order: 1
        }
      ],
      ...roleData
    };
    return await CareerRoleModel.create(defaultRole);
  },

  // Helper to create test quiz
  createTestQuiz: async (QuizModel, quizData = {}) => {
    const defaultQuiz = {
      title: 'Test Quiz',
      description: 'A test quiz for testing',
      questions: [
        {
          question: 'What is your favorite programming language?',
          type: 'multiple-choice',
          options: ['JavaScript', 'Python', 'Java', 'C++'],
          correctAnswer: 0
        }
      ],
      ...quizData
    };
    return await QuizModel.create(defaultQuiz);
  }
};
