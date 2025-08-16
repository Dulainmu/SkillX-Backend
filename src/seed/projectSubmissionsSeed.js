const mongoose = require('mongoose');
const ProjectSubmission = require('../models/ProjectSubmission');
const User = require('../models/User');
const CareerRole = require('../models/CareerRole');

const projectSubmissionsData = [
  {
    title: 'Responsive Portfolio Website',
    description: 'A modern, responsive portfolio website built with HTML, CSS, and JavaScript',
    submissionUrl: 'https://github.com/user1/portfolio-website',
    fileUrl: 'https://example.com/uploads/portfolio-website.zip',
    attachments: ['https://example.com/uploads/screenshot1.png', 'https://example.com/uploads/screenshot2.png'],
    status: 'approved',
    score: 92,
    feedback: 'Excellent work! The responsive design is well implemented and the code is clean. Great attention to detail.',
    timeSpent: 8,
    difficulty: 'Beginner'
  },
  {
    title: 'React Todo Application',
    description: 'A full-featured todo application built with React and local storage',
    submissionUrl: 'https://github.com/user2/react-todo-app',
    fileUrl: 'https://example.com/uploads/react-todo-app.zip',
    attachments: ['https://example.com/uploads/todo-screenshot.png'],
    status: 'pending',
    score: null,
    feedback: null,
    timeSpent: 12,
    difficulty: 'Intermediate'
  },
  {
    title: 'Node.js REST API',
    description: 'A RESTful API for a blog system built with Node.js and Express',
    submissionUrl: 'https://github.com/user3/blog-api',
    fileUrl: 'https://example.com/uploads/blog-api.zip',
    attachments: ['https://example.com/uploads/api-docs.pdf', 'https://example.com/uploads/postman-collection.json'],
    status: 'approved',
    score: 88,
    feedback: 'Good API design and implementation. Consider adding more error handling and validation.',
    timeSpent: 15,
    difficulty: 'Intermediate'
  },
  {
    title: 'E-commerce Frontend',
    description: 'A modern e-commerce frontend built with React and Redux',
    submissionUrl: 'https://github.com/user4/ecommerce-frontend',
    fileUrl: 'https://example.com/uploads/ecommerce-frontend.zip',
    attachments: ['https://example.com/uploads/ecommerce-screenshots.zip'],
    status: 'rejected',
    score: 65,
    feedback: 'The UI looks good but there are several bugs in the cart functionality. Please fix the issues and resubmit.',
    timeSpent: 20,
    difficulty: 'Advanced'
  },
  {
    title: 'MongoDB Database Design',
    description: 'A well-structured MongoDB database design for a social media platform',
    submissionUrl: 'https://github.com/user5/social-media-db',
    fileUrl: 'https://example.com/uploads/database-design.zip',
    attachments: ['https://example.com/uploads/erd-diagram.png', 'https://example.com/uploads/schema.json'],
    status: 'approved',
    score: 95,
    feedback: 'Outstanding database design! The schema is well thought out and optimized for performance.',
    timeSpent: 6,
    difficulty: 'Intermediate'
  },
  {
    title: 'Authentication System',
    description: 'A secure authentication system with JWT tokens and password hashing',
    submissionUrl: 'https://github.com/user6/auth-system',
    fileUrl: 'https://example.com/uploads/auth-system.zip',
    attachments: ['https://example.com/uploads/security-report.pdf'],
    status: 'approved',
    score: 90,
    feedback: 'Excellent security implementation. The JWT handling and password hashing are properly implemented.',
    timeSpent: 18,
    difficulty: 'Advanced'
  },
  {
    title: 'CSS Grid Layout',
    description: 'A responsive layout using CSS Grid for a magazine-style website',
    submissionUrl: 'https://github.com/user7/css-grid-magazine',
    fileUrl: 'https://example.com/uploads/css-grid-project.zip',
    attachments: ['https://example.com/uploads/magazine-layout.png'],
    status: 'pending',
    score: null,
    feedback: null,
    timeSpent: 5,
    difficulty: 'Beginner'
  },
  {
    title: 'Full Stack Blog',
    description: 'A complete blog application with React frontend and Node.js backend',
    submissionUrl: 'https://github.com/user8/fullstack-blog',
    fileUrl: 'https://example.com/uploads/fullstack-blog.zip',
    attachments: ['https://example.com/uploads/blog-demo.mp4', 'https://example.com/uploads/readme.md'],
    status: 'approved',
    score: 87,
    feedback: 'Great full-stack implementation! The application works well and has good separation of concerns.',
    timeSpent: 25,
    difficulty: 'Advanced'
  },
  {
    title: 'JavaScript Calculator',
    description: 'A functional calculator built with vanilla JavaScript',
    submissionUrl: 'https://github.com/user9/js-calculator',
    fileUrl: 'https://example.com/uploads/calculator.zip',
    attachments: ['https://example.com/uploads/calculator-screenshot.png'],
    status: 'approved',
    score: 78,
    feedback: 'Good basic functionality. Consider adding more advanced operations and better error handling.',
    timeSpent: 4,
    difficulty: 'Beginner'
  },
  {
    title: 'API Testing Suite',
    description: 'Comprehensive API testing using Jest and Supertest',
    submissionUrl: 'https://github.com/user10/api-testing',
    fileUrl: 'https://example.com/uploads/api-testing.zip',
    attachments: ['https://example.com/uploads/test-results.json', 'https://example.com/uploads/coverage-report.html'],
    status: 'approved',
    score: 93,
    feedback: 'Excellent testing coverage! The test suite is comprehensive and well-organized.',
    timeSpent: 10,
    difficulty: 'Intermediate'
  }
];

const seedProjectSubmissions = async () => {
  try {
    console.log('🌱 Seeding project submissions...');

    // Clear existing submissions
    await ProjectSubmission.deleteMany({});
    console.log('✅ Cleared existing project submissions');

    // Get users and career roles
    const students = await User.find({ role: 'student' }).limit(10);
    const mentors = await User.find({ role: 'mentor' }).limit(3);
    const careerRoles = await CareerRole.find().limit(3);

    if (students.length === 0) {
      console.log('⚠️ No students found. Please create some users first.');
      return [];
    }

    if (careerRoles.length === 0) {
      console.log('⚠️ No career roles found. Please create some career roles first.');
      return [];
    }

    // Create project submissions
    const submissions = [];
    const statuses = ['pending', 'approved', 'rejected'];
    const difficulties = ['Beginner', 'Intermediate', 'Advanced'];

    for (let i = 0; i < projectSubmissionsData.length; i++) {
      const submissionData = projectSubmissionsData[i];
      const student = students[i % students.length];
      const careerRole = careerRoles[i % careerRoles.length];
      const mentor = mentors.length > 0 ? mentors[i % mentors.length] : null;

      // Generate step and project IDs
      const stepId = `step_${Math.floor(i / 3) + 1}`;
      const projectId = `project_${i + 1}`;

      const submission = new ProjectSubmission({
        user: student._id,
        careerRole: careerRole._id,
        step: {
          id: stepId,
          title: `Step ${Math.floor(i / 3) + 1}: ${careerRole.name} Fundamentals`
        },
        project: {
          id: projectId,
          title: submissionData.title
        },
        title: submissionData.title,
        description: submissionData.description,
        submissionUrl: submissionData.submissionUrl,
        fileUrl: submissionData.fileUrl,
        attachments: submissionData.attachments,
        submittedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Random date within last 30 days
        status: submissionData.status,
        mentor: mentor?._id,
        feedback: submissionData.feedback,
        score: submissionData.score,
        reviewedAt: submissionData.status !== 'pending' ? new Date() : null,
        reviewedBy: submissionData.status !== 'pending' ? mentor?._id : null,
        reviewNotes: submissionData.feedback,
        timeSpent: submissionData.timeSpent,
        difficulty: submissionData.difficulty
      });

      submissions.push(submission);
    }

    // Save all submissions
    const savedSubmissions = await ProjectSubmission.insertMany(submissions);
    console.log(`✅ Created ${savedSubmissions.length} project submissions`);

    // Update user career progress to reflect these submissions
    for (const submission of savedSubmissions) {
      // This would typically update the user's progress in UserCareerProgress
      // For now, we'll just log the creation
      console.log(`📝 Created submission: ${submission.title} by ${submission.user}`);
    }

    console.log('🎉 Project submissions seeding completed!');
    return savedSubmissions;
  } catch (error) {
    console.error('❌ Error seeding project submissions:', error);
    throw error;
  }
};

const clearProjectSubmissions = async () => {
  try {
    await ProjectSubmission.deleteMany({});
    console.log('✅ Cleared all project submissions');
  } catch (error) {
    console.error('❌ Error clearing project submissions:', error);
    throw error;
  }
};

module.exports = {
  seedProjectSubmissions,
  clearProjectSubmissions
};

// Run seeding if this file is executed directly
if (require.main === module) {
  require('dotenv').config();
  mongoose.connect(process.env.MONGODB_URI)
    .then(() => seedProjectSubmissions())
    .then(() => {
      console.log('✅ Project submissions seeding completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Project submissions seeding failed:', error);
      process.exit(1);
    });
}
