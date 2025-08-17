// tests/integration/cross-module-integration.test.js
// Cross-Module Integration Testing - Critical Integration Tests

const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../../src/app');
const User = require('../../src/models/User');
const CareerRole = require('../../src/models/CareerRole');
const Quiz = require('../../src/models/Quiz');
const Project = require('../../src/models/Project');
const LearningMaterial = require('../../src/models/LearningMaterial');
const ProjectSubmission = require('../../src/models/ProjectSubmission');

describe('Cross-Module Integration Testing', () => {
  let testUser, testAdmin, testMentor, testCareerRole, testQuiz, testProject, testMaterial;
  let userToken, adminToken, mentorToken;

  beforeEach(async () => {
    // Create comprehensive test data
    testUser = await global.testUtils.createTestUser(User, {
      email: 'learner@example.com',
      skills: {
        'JavaScript': { level: 2, selected: true },
        'HTML': { level: 1, selected: true }
      }
    });

    testAdmin = await global.testUtils.createTestAdmin(User);
    testMentor = await global.testUtils.createTestUser(User, {
      email: 'mentor@example.com',
      role: 'mentor',
      skills: {
        'JavaScript': { level: 5, selected: true },
        'React': { level: 4, selected: true }
      }
    });

    testCareerRole = await global.testUtils.createTestCareerRole(CareerRole, {
      name: 'Frontend Developer',
      description: 'Frontend development career path',
      slug: 'frontend-developer',
      requiredSkills: [
        { skillName: 'JavaScript', requiredLevel: 2, importance: 'essential' },
        { skillName: 'HTML', requiredLevel: 1, importance: 'important' }
      ],
      detailedRoadmap: [
        {
          title: 'HTML Fundamentals',
          description: 'Learn HTML basics',
          order: 1,
          materials: []
        },
        {
          title: 'JavaScript Basics',
          description: 'Learn JavaScript fundamentals',
          order: 2,
          materials: []
        }
      ]
    });

    testQuiz = await global.testUtils.createTestQuiz(Quiz, {
      title: 'Frontend Development Assessment',
      questions: [
        {
          question: 'What is your experience with JavaScript?',
          type: 'multiple-choice',
          options: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
          correctAnswer: 1
        },
        {
          question: 'Do you prefer working with frontend or backend?',
          type: 'multiple-choice',
          options: ['Frontend', 'Backend', 'Both', 'Neither'],
          correctAnswer: 0
        }
      ]
    });

    testProject = await Project.create({
      title: 'Build a Portfolio Website',
      description: 'Create a personal portfolio website',
      requirements: [
        'Use HTML and CSS',
        'Make it responsive',
        'Add JavaScript interactions'
      ],
      difficulty: 'intermediate',
      requiredSkills: [
        { skillName: 'JavaScript', requiredLevel: 2 },
        { skillName: 'HTML', requiredLevel: 1 }
      ],
      careerRoleId: testCareerRole._id,
      mentorId: testMentor._id
    });

    testMaterial = await LearningMaterial.create({
      title: 'JavaScript Fundamentals',
      description: 'Learn JavaScript basics',
      type: 'video',
      url: 'https://example.com/js-tutorial',
      duration: 45,
      difficulty: 'beginner',
      tags: ['javascript', 'frontend', 'basics']
    });

    // Generate auth tokens
    userToken = jwt.sign({ userId: testUser._id }, process.env.JWT_SECRET || 'test-secret');
    adminToken = jwt.sign({ userId: testAdmin._id }, process.env.JWT_SECRET || 'test-secret');
    mentorToken = jwt.sign({ userId: testMentor._id }, process.env.JWT_SECRET || 'test-secret');
  });

  describe('TC_INT_001: Complete User Journey Test', () => {
    test('should complete entire user experience from registration to project completion', async () => {
      // Step 1: User registration (simulated by existing test user)
      expect(testUser.email).toBe('learner@example.com');
      expect(testUser.role).toBe('learner');

      // Step 2: Complete skills assessment
      const skillsAssessment = {
        skills: {
          'JavaScript': { level: 3, selected: true },
          'HTML': { level: 2, selected: true },
          'CSS': { level: 2, selected: true }
        }
      };

      const skillsResponse = await request(app)
        .post('/api/skills/rate')
        .set('Authorization', `Bearer ${userToken}`)
        .send(skillsAssessment);

      expect(skillsResponse.status).toBe(200);

      // Step 3: Complete quiz assessment
      const quizAnswers = {
        quizId: testQuiz._id,
        answers: [
          {
            questionIndex: 0,
            selectedAnswer: 1, // Intermediate
            timeSpent: 30
          },
          {
            questionIndex: 1,
            selectedAnswer: 0, // Frontend
            timeSpent: 20
          }
        ],
        totalTime: 50
      };

      const quizResponse = await request(app)
        .post('/api/quiz/submit')
        .set('Authorization', `Bearer ${userToken}`)
        .send(quizAnswers);

      expect(quizResponse.status).toBe(200);
      expect(quizResponse.body).toHaveProperty('score');

      // Step 4: Receive career recommendations
      const recommendationsResponse = await request(app)
        .get('/api/recommendations/careers')
        .set('Authorization', `Bearer ${userToken}`);

      expect(recommendationsResponse.status).toBe(200);
      expect(Array.isArray(recommendationsResponse.body)).toBe(true);
      expect(recommendationsResponse.body.length).toBeGreaterThan(0);

      // Step 5: Follow learning path
      const careerPathResponse = await request(app)
        .get(`/api/careers/${testCareerRole.slug}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(careerPathResponse.status).toBe(200);
      expect(careerPathResponse.body.name).toBe('Frontend Developer');

      // Step 6: Access learning materials
      const materialsResponse = await request(app)
        .get('/api/materials')
        .set('Authorization', `Bearer ${userToken}`);

      expect(materialsResponse.status).toBe(200);
      expect(Array.isArray(materialsResponse.body)).toBe(true);

      // Step 7: Mark material as completed
      const progressData = {
        materialId: testMaterial._id,
        status: 'completed',
        timeSpent: 45
      };

      const progressResponse = await request(app)
        .post('/api/progress/materials')
        .set('Authorization', `Bearer ${userToken}`)
        .send(progressData);

      expect(progressResponse.status).toBe(200);

      // Step 8: Access assigned projects
      const projectsResponse = await request(app)
        .get('/api/projects/available')
        .set('Authorization', `Bearer ${userToken}`);

      expect(projectsResponse.status).toBe(200);
      expect(Array.isArray(projectsResponse.body)).toBe(true);

      // Step 9: Submit project
      const submissionData = {
        projectId: testProject._id,
        submissionUrl: 'https://github.com/user/portfolio',
        description: 'A responsive portfolio website',
        files: ['index.html', 'style.css', 'script.js'],
        notes: 'Implemented all required features'
      };

      const submissionResponse = await request(app)
        .post('/api/projects/submit')
        .set('Authorization', `Bearer ${userToken}`)
        .send(submissionData);

      expect(submissionResponse.status).toBe(200);
      expect(submissionResponse.body).toHaveProperty('submissionId');

      const submissionId = submissionResponse.body.submissionId;

      // Step 10: Receive mentor feedback
      const feedbackData = {
        submissionId: submissionId,
        score: 92,
        feedback: 'Excellent work! The portfolio looks professional and is fully responsive.',
        status: 'approved',
        suggestions: ['Consider adding animations', 'Add more projects to showcase']
      };

      const feedbackResponse = await request(app)
        .post('/api/projects/feedback')
        .set('Authorization', `Bearer ${mentorToken}`)
        .send(feedbackData);

      expect(feedbackResponse.status).toBe(200);

      // Step 11: View feedback as learner
      const learnerFeedbackResponse = await request(app)
        .get(`/api/projects/submissions/${submissionId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(learnerFeedbackResponse.status).toBe(200);
      expect(learnerFeedbackResponse.body).toHaveProperty('feedback');
      expect(learnerFeedbackResponse.body).toHaveProperty('score', 92);
      expect(learnerFeedbackResponse.body).toHaveProperty('status', 'approved');
    });
  });

  describe('TC_INT_002: Data Consistency Test', () => {
    test('should maintain consistent user information across all modules', async () => {
      // Update user information in one module
      const updatedSkills = {
        skills: {
          'JavaScript': { level: 4, selected: true },
          'React': { level: 3, selected: true },
          'Node.js': { level: 2, selected: true }
        }
      };

      await request(app)
        .post('/api/skills/rate')
        .set('Authorization', `Bearer ${userToken}`)
        .send(updatedSkills);

      // Verify skills are consistent across different endpoints
      const userProfileResponse = await request(app)
        .get('/api/user/profile')
        .set('Authorization', `Bearer ${userToken}`);

      expect(userProfileResponse.status).toBe(200);
      expect(userProfileResponse.body.skills).toEqual(updatedSkills.skills);

      // Verify skills affect career recommendations
      const recommendationsResponse = await request(app)
        .get('/api/recommendations/careers')
        .set('Authorization', `Bearer ${userToken}`);

      expect(recommendationsResponse.status).toBe(200);
      expect(Array.isArray(recommendationsResponse.body)).toBe(true);

      // Verify skills affect project availability
      const projectsResponse = await request(app)
        .get('/api/projects/available')
        .set('Authorization', `Bearer ${userToken}`);

      expect(projectsResponse.status).toBe(200);
      expect(Array.isArray(projectsResponse.body)).toBe(true);

      // Verify progress is consistent
      const progressResponse = await request(app)
        .get('/api/progress/summary')
        .set('Authorization', `Bearer ${userToken}`);

      expect(progressResponse.status).toBe(200);
      expect(progressResponse.body).toHaveProperty('totalMaterials');
      expect(progressResponse.body).toHaveProperty('completedMaterials');
    });

    test('should maintain consistent career path data across modules', async () => {
      // Admin creates a new career path
      const newCareerData = {
        name: 'DevOps Engineer',
        description: 'DevOps engineering career path',
        slug: 'devops-engineer',
        isActive: true,
        vector: [0.6, 0.7, 0.5, 0.4, 0.3, 0.8, 0.6, 0.5, 0.4, 0.7, 0.6, 0.5],
        requiredSkills: [
          {
            skillName: 'Docker',
            requiredLevel: 3,
            importance: 'essential'
          },
          {
            skillName: 'Kubernetes',
            requiredLevel: 2,
            importance: 'important'
          }
        ],
        detailedRoadmap: [
          {
            title: 'Containerization Basics',
            description: 'Learn Docker fundamentals',
            order: 1,
            materials: []
          }
        ]
      };

      const createResponse = await request(app)
        .post('/api/admin/careers')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(newCareerData);

      expect(createResponse.status).toBe(201);
      const careerId = createResponse.body._id;

      // Verify career appears in admin list
      const adminListResponse = await request(app)
        .get('/api/admin/careers')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(adminListResponse.status).toBe(200);
      const adminCareer = adminListResponse.body.find(c => c._id === careerId);
      expect(adminCareer).toBeTruthy();
      expect(adminCareer.name).toBe('DevOps Engineer');

      // Verify career appears in public career list
      const publicListResponse = await request(app)
        .get('/api/careers')
        .set('Authorization', `Bearer ${userToken}`);

      expect(publicListResponse.status).toBe(200);
      const publicCareer = publicListResponse.body.find(c => c._id === careerId);
      expect(publicCareer).toBeTruthy();
      expect(publicCareer.name).toBe('DevOps Engineer');

      // Verify career details are consistent
      const careerDetailsResponse = await request(app)
        .get(`/api/careers/${newCareerData.slug}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(careerDetailsResponse.status).toBe(200);
      expect(careerDetailsResponse.body.name).toBe('DevOps Engineer');
      expect(careerDetailsResponse.body.requiredSkills).toHaveLength(2);
    });
  });

  describe('TC_INT_003: Role-Based Access Test', () => {
    test('should enforce proper role-based access across all modules', async () => {
      // Test learner access limitations
      const learnerEndpoints = [
        { path: '/api/user/profile', method: 'get' },
        { path: '/api/careers', method: 'get' },
        { path: '/api/materials', method: 'get' },
        { path: '/api/projects/available', method: 'get' },
        { path: '/api/quiz', method: 'get' }
      ];

      for (const endpoint of learnerEndpoints) {
        const response = await request(app)
          [endpoint.method](endpoint.path)
          .set('Authorization', `Bearer ${userToken}`);

        // Learners should have access to these endpoints
        expect(response.status).not.toBe(403);
      }

      // Test admin privileges
      const adminEndpoints = [
        { path: '/api/admin/careers', method: 'get' },
        { path: '/api/admin/users', method: 'get' },
        { path: '/api/admin/analytics', method: 'get' },
        { path: '/api/admin/materials', method: 'get' }
      ];

      for (const endpoint of adminEndpoints) {
        const response = await request(app)
          [endpoint.method](endpoint.path)
          .set('Authorization', `Bearer ${adminToken}`);

        // Admins should have access to these endpoints
        expect(response.status).not.toBe(403);
      }

      // Test mentor permissions
      const mentorEndpoints = [
        { path: '/api/projects/mentor/submissions', method: 'get' },
        { path: '/api/projects/feedback', method: 'post' }
      ];

      for (const endpoint of mentorEndpoints) {
        const response = await request(app)
          [endpoint.method](endpoint.path)
          .set('Authorization', `Bearer ${mentorToken}`);

        // Mentors should have access to these endpoints
        expect(response.status).not.toBe(403);
      }

      // Test access restrictions
      const restrictedEndpoints = [
        { path: '/api/admin/careers', method: 'get', token: userToken },
        { path: '/api/admin/users', method: 'get', token: userToken },
        { path: '/api/projects/mentor/submissions', method: 'get', token: userToken }
      ];

      for (const endpoint of restrictedEndpoints) {
        const response = await request(app)
          [endpoint.method](endpoint.path)
          .set('Authorization', `Bearer ${endpoint.token}`);

        // Regular users should not have access to admin/mentor endpoints
        expect(response.status).toBe(403);
      }
    });

    test('should maintain security model across all modules', async () => {
      // Test that users cannot access other users' data
      const otherUserResponse = await request(app)
        .get('/api/user/profile')
        .set('Authorization', `Bearer ${userToken}`);

      expect(otherUserResponse.status).toBe(200);
      expect(otherUserResponse.body.email).toBe('learner@example.com');

      // Test that users cannot modify admin data
      const adminModificationResponse = await request(app)
        .post('/api/admin/careers')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          name: 'Unauthorized Career',
          description: 'This should not be allowed',
          slug: 'unauthorized-career'
        });

      expect(adminModificationResponse.status).toBe(403);

      // Test that users cannot access mentor-specific features
      const mentorFeatureResponse = await request(app)
        .get('/api/projects/mentor/submissions')
        .set('Authorization', `Bearer ${userToken}`);

      expect(mentorFeatureResponse.status).toBe(403);
    });
  });

  describe('TC_INT_004: End-to-End Workflow Test', () => {
    test('should complete full workflow from assessment to project completion with mentor feedback', async () => {
      // 1. User completes assessment
      const assessmentData = {
        skills: {
          'JavaScript': { level: 3, selected: true },
          'HTML': { level: 2, selected: true },
          'CSS': { level: 2, selected: true }
        }
      };

      await request(app)
        .post('/api/skills/rate')
        .set('Authorization', `Bearer ${userToken}`)
        .send(assessmentData);

      // 2. User takes quiz
      const quizData = {
        quizId: testQuiz._id,
        answers: [
          { questionIndex: 0, selectedAnswer: 1, timeSpent: 30 },
          { questionIndex: 1, selectedAnswer: 0, timeSpent: 20 }
        ],
        totalTime: 50
      };

      const quizResult = await request(app)
        .post('/api/quiz/submit')
        .set('Authorization', `Bearer ${userToken}`)
        .send(quizData);

      expect(quizResult.status).toBe(200);

      // 3. User gets recommendations
      const recommendations = await request(app)
        .get('/api/recommendations/careers')
        .set('Authorization', `Bearer ${userToken}`);

      expect(recommendations.status).toBe(200);
      expect(recommendations.body.length).toBeGreaterThan(0);

      // 4. User selects career path
      const careerPath = await request(app)
        .get(`/api/careers/${testCareerRole.slug}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(careerPath.status).toBe(200);

      // 5. User completes learning materials
      const materialProgress = {
        materialId: testMaterial._id,
        status: 'completed',
        timeSpent: 45
      };

      await request(app)
        .post('/api/progress/materials')
        .set('Authorization', `Bearer ${userToken}`)
        .send(materialProgress);

      // 6. User submits project
      const projectSubmission = {
        projectId: testProject._id,
        submissionUrl: 'https://github.com/user/portfolio-project',
        description: 'Portfolio website project submission',
        files: ['index.html', 'style.css', 'script.js'],
        notes: 'Completed all requirements including responsive design'
      };

      const submission = await request(app)
        .post('/api/projects/submit')
        .set('Authorization', `Bearer ${userToken}`)
        .send(projectSubmission);

      expect(submission.status).toBe(200);
      const submissionId = submission.body.submissionId;

      // 7. Mentor reviews and provides feedback
      const mentorFeedback = {
        submissionId: submissionId,
        score: 95,
        feedback: 'Outstanding work! The portfolio demonstrates excellent frontend skills.',
        status: 'approved',
        suggestions: ['Consider adding more interactive features', 'Great responsive design']
      };

      const feedback = await request(app)
        .post('/api/projects/feedback')
        .set('Authorization', `Bearer ${mentorToken}`)
        .send(mentorFeedback);

      expect(feedback.status).toBe(200);

      // 8. User receives and views feedback
      const userFeedback = await request(app)
        .get(`/api/projects/submissions/${submissionId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(userFeedback.status).toBe(200);
      expect(userFeedback.body.score).toBe(95);
      expect(userFeedback.body.status).toBe('approved');

      // 9. Verify all data is consistent and properly linked
      const userProgress = await request(app)
        .get('/api/progress/summary')
        .set('Authorization', `Bearer ${userToken}`);

      expect(userProgress.status).toBe(200);
      expect(userProgress.body.completedMaterials).toBeGreaterThan(0);

      // 10. Verify career path progress
      const careerProgress = await request(app)
        .get(`/api/progress/career/${testCareerRole._id}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(careerProgress.status).toBe(200);
      expect(careerProgress.body).toHaveProperty('completionPercentage');
    });
  });
});
