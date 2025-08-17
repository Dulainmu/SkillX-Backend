// tests/module3/project-learning.test.js
// Module 3: Project-Based Learning System - Automated Test Cases

const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../../src/app');
const User = require('../../src/models/User');
const Project = require('../../src/models/Project');
const ProjectSubmission = require('../../src/models/ProjectSubmission');
const CareerRole = require('../../src/models/CareerRole');

describe('Module 3: Project-Based Learning System', () => {
  let testUser, testMentor, testProject, testCareerRole, userToken, mentorToken;

  beforeEach(async () => {
    // Create test data
    testUser = await global.testUtils.createTestUser(User, {
      email: 'learner@example.com',
      skills: {
        'JavaScript': { level: 3, selected: true },
        'HTML': { level: 2, selected: true }
      }
    });

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
      requiredSkills: [
        { skillName: 'JavaScript', requiredLevel: 2, importance: 'essential' },
        { skillName: 'HTML', requiredLevel: 1, importance: 'important' }
      ]
    });

    testProject = await Project.create({
      title: 'Build a Todo App',
      description: 'Create a simple todo application using JavaScript',
      requirements: [
        'Use vanilla JavaScript',
        'Implement CRUD operations',
        'Add local storage functionality'
      ],
      difficulty: 'intermediate',
      estimatedTime: 120,
      requiredSkills: [
        { skillName: 'JavaScript', requiredLevel: 2 },
        { skillName: 'HTML', requiredLevel: 1 }
      ],
      careerRoleId: testCareerRole._id,
      mentorId: testMentor._id
    });

    // Generate auth tokens
    userToken = jwt.sign({ userId: testUser._id }, process.env.JWT_SECRET || 'test-secret');
    mentorToken = jwt.sign({ userId: testMentor._id }, process.env.JWT_SECRET || 'test-secret');
  });

  describe('TC_AUTO_009: Skill Prerequisite Validation Test', () => {
    test('should allow access to projects when prerequisites are met', async () => {
      const response = await request(app)
        .get('/api/projects/available')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      
      // Should find the test project since user meets prerequisites
      const availableProject = response.body.find(p => p._id === testProject._id.toString());
      expect(availableProject).toBeTruthy();
      expect(availableProject.title).toBe('Build a Todo App');
    });

    test('should block access to projects when prerequisites are not met', async () => {
      // Create a project with higher skill requirements
      const advancedProject = await Project.create({
        title: 'Advanced React App',
        description: 'Build a complex React application',
        requirements: ['Use React hooks', 'Implement state management'],
        difficulty: 'advanced',
        requiredSkills: [
          { skillName: 'React', requiredLevel: 4 },
          { skillName: 'JavaScript', requiredLevel: 5 }
        ],
        careerRoleId: testCareerRole._id,
        mentorId: testMentor._id
      });

      const response = await request(app)
        .get('/api/projects/available')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      
      // Should not find the advanced project since user doesn't meet prerequisites
      const unavailableProject = response.body.find(p => p._id === advancedProject._id.toString());
      expect(unavailableProject).toBeUndefined();
    });

    test('should grant access after completing required skill modules', async () => {
      // Initially, user doesn't have React skills
      const initialResponse = await request(app)
        .get('/api/projects/available')
        .set('Authorization', `Bearer ${userToken}`);

      // Create a React project
      const reactProject = await Project.create({
        title: 'React Basics',
        description: 'Learn React fundamentals',
        requiredSkills: [
          { skillName: 'React', requiredLevel: 2 }
        ],
        careerRoleId: testCareerRole._id,
        mentorId: testMentor._id
      });

      // Initially should not have access
      const initiallyAvailable = initialResponse.body.find(p => p._id === reactProject._id.toString());
      expect(initiallyAvailable).toBeUndefined();

      // Update user skills to include React
      await request(app)
        .post('/api/skills/rate')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          skills: {
            'JavaScript': { level: 3, selected: true },
            'HTML': { level: 2, selected: true },
            'React': { level: 3, selected: true } // Now has React skills
          }
        });

      // Now should have access
      const updatedResponse = await request(app)
        .get('/api/projects/available')
        .set('Authorization', `Bearer ${userToken}`);

      const nowAvailable = updatedResponse.body.find(p => p._id === reactProject._id.toString());
      expect(nowAvailable).toBeTruthy();
    });
  });

  describe('TC_AUTO_010: Project Assignment Logic Test', () => {
    test('should assign projects based on completed skill levels', async () => {
      const response = await request(app)
        .get('/api/projects/assigned')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);

      // Should find projects that match user's skill level
      const assignedProject = response.body.find(p => p._id === testProject._id.toString());
      expect(assignedProject).toBeTruthy();
      expect(assignedProject.difficulty).toBe('intermediate');
    });

    test('should assign projects with appropriate challenge level', async () => {
      // Create projects of different difficulties
      const beginnerProject = await Project.create({
        title: 'Simple Calculator',
        description: 'Build a basic calculator',
        difficulty: 'beginner',
        requiredSkills: [
          { skillName: 'JavaScript', requiredLevel: 1 }
        ],
        careerRoleId: testCareerRole._id,
        mentorId: testMentor._id
      });

      const advancedProject = await Project.create({
        title: 'Full-Stack App',
        description: 'Build a complete web application',
        difficulty: 'advanced',
        requiredSkills: [
          { skillName: 'JavaScript', requiredLevel: 5 },
          { skillName: 'React', requiredLevel: 4 }
        ],
        careerRoleId: testCareerRole._id,
        mentorId: testMentor._id
      });

      const response = await request(app)
        .get('/api/projects/assigned')
        .set('Authorization', `Bearer ${userToken}`);

      // Should find beginner and intermediate projects, but not advanced
      const beginnerFound = response.body.find(p => p._id === beginnerProject._id.toString());
      const advancedFound = response.body.find(p => p._id === advancedProject._id.toString());

      expect(beginnerFound).toBeTruthy();
      expect(advancedFound).toBeUndefined(); // User doesn't meet advanced requirements
    });

    test('should verify assigned project matches skill level', async () => {
      const response = await request(app)
        .get('/api/projects/assigned')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);

      // Check that all assigned projects are appropriate for user's skill level
      response.body.forEach(project => {
        const userSkills = testUser.skills;
        const requiredSkills = project.requiredSkills;

        requiredSkills.forEach(requiredSkill => {
          const userSkill = userSkills[requiredSkill.skillName];
          expect(userSkill).toBeTruthy();
          expect(userSkill.level).toBeGreaterThanOrEqual(requiredSkill.requiredLevel);
        });
      });
    });
  });

  describe('TC_AUTO_011: Project Submission Workflow Test', () => {
    test('should complete project submission and review process', async () => {
      // Submit a project
      const submissionData = {
        projectId: testProject._id,
        submissionUrl: 'https://github.com/user/todo-app',
        description: 'A todo app built with vanilla JavaScript',
        files: ['index.html', 'script.js', 'style.css'],
        notes: 'Implemented all required features including local storage'
      };

      const submitResponse = await request(app)
        .post('/api/projects/submit')
        .set('Authorization', `Bearer ${userToken}`)
        .send(submissionData);

      expect(submitResponse.status).toBe(200);
      expect(submitResponse.body).toHaveProperty('submissionId');
      expect(submitResponse.body).toHaveProperty('status', 'submitted');

      const submissionId = submitResponse.body.submissionId;

      // Verify submission is recorded
      const storedSubmission = await ProjectSubmission.findById(submissionId);
      expect(storedSubmission).toBeTruthy();
      expect(storedSubmission.userId.toString()).toBe(testUser._id.toString());
      expect(storedSubmission.projectId.toString()).toBe(testProject._id.toString());
      expect(storedSubmission.status).toBe('submitted');

      // Mentor should receive notification (simulated)
      const mentorNotifications = await request(app)
        .get('/api/notifications')
        .set('Authorization', `Bearer ${mentorToken}`);

      expect(mentorNotifications.status).toBe(200);
    });

    test('should handle mentor feedback submission', async () => {
      // First submit a project
      const submissionData = {
        projectId: testProject._id,
        submissionUrl: 'https://github.com/user/todo-app',
        description: 'Todo app submission'
      };

      const submitResponse = await request(app)
        .post('/api/projects/submit')
        .set('Authorization', `Bearer ${userToken}`)
        .send(submissionData);

      const submissionId = submitResponse.body.submissionId;

      // Mentor provides feedback
      const feedbackData = {
        submissionId: submissionId,
        score: 85,
        feedback: 'Great work! The app functions well. Consider adding error handling.',
        status: 'approved',
        suggestions: ['Add input validation', 'Improve UI design']
      };

      const feedbackResponse = await request(app)
        .post('/api/projects/feedback')
        .set('Authorization', `Bearer ${mentorToken}`)
        .send(feedbackData);

      expect(feedbackResponse.status).toBe(200);
      expect(feedbackResponse.body).toHaveProperty('message', 'Feedback submitted successfully');

      // Verify feedback is saved
      const updatedSubmission = await ProjectSubmission.findById(submissionId);
      expect(updatedSubmission.status).toBe('approved');
      expect(updatedSubmission.score).toBe(85);
      expect(updatedSubmission.feedback).toBe('Great work! The app functions well. Consider adding error handling.');
    });

    test('should test feedback mechanism for learners', async () => {
      // Submit project
      const submissionData = {
        projectId: testProject._id,
        submissionUrl: 'https://github.com/user/todo-app',
        description: 'Todo app submission'
      };

      const submitResponse = await request(app)
        .post('/api/projects/submit')
        .set('Authorization', `Bearer ${userToken}`)
        .send(submissionData);

      const submissionId = submitResponse.body.submissionId;

      // Mentor provides feedback
      await request(app)
        .post('/api/projects/feedback')
        .set('Authorization', `Bearer ${mentorToken}`)
        .send({
          submissionId: submissionId,
          score: 90,
          feedback: 'Excellent work!',
          status: 'approved'
        });

      // Learner should receive feedback
      const learnerFeedback = await request(app)
        .get(`/api/projects/submissions/${submissionId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(learnerFeedback.status).toBe(200);
      expect(learnerFeedback.body).toHaveProperty('feedback');
      expect(learnerFeedback.body).toHaveProperty('score', 90);
      expect(learnerFeedback.body).toHaveProperty('status', 'approved');
    });
  });

  describe('TC_AUTO_012: Mentor Integration Test', () => {
    test('should assign mentor and enable communication system', async () => {
      // Submit a project
      const submissionData = {
        projectId: testProject._id,
        submissionUrl: 'https://github.com/user/todo-app',
        description: 'Todo app submission'
      };

      const submitResponse = await request(app)
        .post('/api/projects/submit')
        .set('Authorization', `Bearer ${userToken}`)
        .send(submissionData);

      const submissionId = submitResponse.body.submissionId;

      // Verify mentor is assigned
      const submission = await ProjectSubmission.findById(submissionId);
      expect(submission.mentorId.toString()).toBe(testMentor._id.toString());

      // Mentor should see the submission
      const mentorSubmissions = await request(app)
        .get('/api/projects/mentor/submissions')
        .set('Authorization', `Bearer ${mentorToken}`);

      expect(mentorSubmissions.status).toBe(200);
      expect(Array.isArray(mentorSubmissions.body)).toBe(true);
      
      const assignedSubmission = mentorSubmissions.body.find(s => s._id === submissionId);
      expect(assignedSubmission).toBeTruthy();
    });

    test('should test mentor feedback submission', async () => {
      // Submit project
      const submissionData = {
        projectId: testProject._id,
        submissionUrl: 'https://github.com/user/todo-app',
        description: 'Todo app submission'
      };

      const submitResponse = await request(app)
        .post('/api/projects/submit')
        .set('Authorization', `Bearer ${userToken}`)
        .send(submissionData);

      const submissionId = submitResponse.body.submissionId;

      // Mentor submits feedback
      const feedbackData = {
        submissionId: submissionId,
        score: 88,
        feedback: 'Good implementation. Consider adding more features.',
        status: 'approved',
        suggestions: ['Add dark mode', 'Implement filters']
      };

      const feedbackResponse = await request(app)
        .post('/api/projects/feedback')
        .set('Authorization', `Bearer ${mentorToken}`)
        .send(feedbackData);

      expect(feedbackResponse.status).toBe(200);

      // Verify feedback is properly stored
      const updatedSubmission = await ProjectSubmission.findById(submissionId);
      expect(updatedSubmission.score).toBe(88);
      expect(updatedSubmission.feedback).toBe('Good implementation. Consider adding more features.');
      expect(updatedSubmission.status).toBe('approved');
    });

    test('should enable communication between learners and mentors', async () => {
      // Submit project
      const submissionData = {
        projectId: testProject._id,
        submissionUrl: 'https://github.com/user/todo-app',
        description: 'Todo app submission'
      };

      const submitResponse = await request(app)
        .post('/api/projects/submit')
        .set('Authorization', `Bearer ${userToken}`)
        .send(submissionData);

      const submissionId = submitResponse.body.submissionId;

      // Learner sends message to mentor
      const messageData = {
        submissionId: submissionId,
        message: 'I have a question about the project requirements',
        type: 'question'
      };

      const messageResponse = await request(app)
        .post('/api/projects/message')
        .set('Authorization', `Bearer ${userToken}`)
        .send(messageData);

      expect(messageResponse.status).toBe(200);

      // Mentor should receive the message
      const mentorMessages = await request(app)
        .get(`/api/projects/submissions/${submissionId}/messages`)
        .set('Authorization', `Bearer ${mentorToken}`);

      expect(mentorMessages.status).toBe(200);
      expect(Array.isArray(mentorMessages.body)).toBe(true);
      expect(mentorMessages.body.length).toBeGreaterThan(0);
      expect(mentorMessages.body[0].message).toBe('I have a question about the project requirements');
    });
  });
});
