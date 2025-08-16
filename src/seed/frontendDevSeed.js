const mongoose = require('mongoose');
const CareerRole = require('../models/CareerRole');
require('dotenv').config();

const frontendDev = {
  "name": "frontend-dev",
  "vector": [3, 4, 4, 2, 4, 3, 5, 2, 3, 5, 3, 3],
  "description": "You're creative, detail-oriented, and enjoy visual interfaces.",
  "skills": ["JavaScript", "React", "CSS", "HTML", "UI Design"],
  "roadmap": [
    "Learn HTML, CSS, and JavaScript",
    "Master a frontend framework (React, Vue, etc.)",
    "Understand responsive design",
    "Build portfolio projects",
    "Learn version control (Git)"
  ],
  "detailedRoadmap": [
    {
      "id": "fd-1",
      "title": "Web Foundations",
      "description": "Master the basics of web development.",
      "skills": ["HTML", "CSS", "JavaScript"],
      "estimatedTime": "2 weeks",
      "xpReward": 200,
      "resources": [
        { "title": "MDN HTML Guide", "type": "article", "url": "https://developer.mozilla.org/en-US/docs/Web/HTML", "description": "Comprehensive HTML documentation." },
        { "title": "freeCodeCamp Responsive Web Design", "type": "course", "url": "https://www.freecodecamp.org/learn/responsive-web-design/", "description": "Interactive course on HTML and CSS." },
        { "title": "JavaScript Course for Beginners – Your First Step to Web Development (YouTube)", "type": "video", "url": "http://www.youtube.com/watch?v=W6NZfCO5SIk", "description": "Beginner JavaScript video." },
        { "title": "React.js Essential Training (LinkedIn Learning)", "type": "course", "url": "https://www.linkedin.com/learning/react-js-essential-training", "description": "A beginner-friendly course on React fundamentals." },
        { "title": "JavaScript Crash Course For Beginners (YouTube)", "type": "video", "url": "http://www.youtube.com/watch?v=hdI2bqOjy3c", "description": "A complete JavaScript tutorial for beginners." }
      ],
      "projects": [
        {
          "id": "fd-p1",
          "title": "Personal Portfolio Website",
          "description": "Build a personal portfolio site using HTML, CSS, and JavaScript.",
          "difficulty": "Beginner",
          "estimatedTime": "1 week",
          "skills": ["HTML", "CSS", "JavaScript"],
          "xpReward": 100,
          "resources": [
            { "title": "How to Build a Portfolio Website", "type": "article", "url": "https://www.freecodecamp.org/news/how-to-build-a-portfolio-website/", "description": "Step-by-step guide to building a portfolio." },
            { "title": "How to Make a Portfolio Website | For Beginners (YouTube)", "type": "video", "url": "http://www.youtube.com/watch?v=Tbal1mlwyPo", "description": "Video tutorial for beginners." }
          ]
        }
      ]
    },
    {
      "id": "fd-2",
      "title": "Frontend Frameworks",
      "description": "Learn and master React.",
      "skills": ["React", "JSX", "Component Design"],
      "estimatedTime": "3 weeks",
      "xpReward": 300,
      "resources": [
        { "title": "React Documentation", "type": "article", "url": "https://reactjs.org/docs/getting-started.html", "description": "Official React documentation." },
        { "title": "The Complete React Developer Course (Udemy)", "type": "course", "url": "https://www.udemy.com/course/the-complete-react-developer-course/", "description": "Advanced React course." },
        { "title": "10 React Hooks Explained // Plus Build your own from Scratch (YouTube)", "type": "video", "url": "http://www.youtube.com/watch?v=TNhaISOUy6Q", "description": "React Hooks tutorial." }
      ],
      "projects": [
        {
          "id": "fd-p2",
          "title": "Task Manager App",
          "description": "Create a task manager app using React.",
          "difficulty": "Intermediate",
          "estimatedTime": "2 weeks",
          "skills": ["React", "State Management"],
          "xpReward": 150,
          "resources": [
            { "title": "React To-Do App Tutorial", "type": "article", "url": "https://react.dev/learn/tutorial-tic-tac-toe", "description": "React official tutorial." },
            { "title": "React State Management – Intermediate JavaScript Course (YouTube)", "type": "video", "url": "http://www.youtube.com/watch?v=-bEzt5ISACA", "description": "State management in React." }
          ]
        }
      ]
    },
    {
      "id": "fd-3",
      "title": "Responsive & UI Design",
      "description": "Understand responsive layouts and UI/UX best practices.",
      "skills": ["Responsive Design", "UI Design", "Accessibility"],
      "estimatedTime": "2 weeks",
      "xpReward": 200,
      "resources": [
        { "title": "Responsive Design Basics (MDN)", "type": "article", "url": "https://developer.mozilla.org/en-US/docs/Learn/CSS/CSS_layout/Responsive_Design", "description": "Responsive design fundamentals." },
        { "title": "Figma for Beginners (Udemy)", "type": "course", "url": "https://www.udemy.com/course/figma-for-beginners/", "description": "Figma UI design course." },
        { "title": "The Only Accessibility Video You Will Ever Need (YouTube)", "type": "video", "url": "http://www.youtube.com/watch?v=2oiBKSjOOFE", "description": "Accessibility best practices." }
      ],
      "projects": [
        {
          "id": "fd-p3",
          "title": "Responsive Blog Layout",
          "description": "Build a responsive blog layout with CSS Grid/Flexbox.",
          "difficulty": "Intermediate",
          "estimatedTime": "1 week",
          "skills": ["CSS", "Responsive Design"],
          "xpReward": 100,
          "resources": [
            { "title": "CSS Grid Layout (MDN)", "type": "article", "url": "https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Grid_Layout", "description": "MDN guide to CSS Grid." },
            { "title": "Flexbox Froggy", "type": "course", "url": "https://flexboxfroggy.com/", "description": "Interactive Flexbox game." }
          ]
        }
      ]
    },
    {
      "id": "fd-4",
      "title": "Version Control & Collaboration",
      "description": "Learn Git and collaborative workflows.",
      "skills": ["Git", "GitHub", "Collaboration"],
      "estimatedTime": "1 week",
      "xpReward": 100,
      "resources": [
        { "title": "Git Documentation", "type": "article", "url": "https://git-scm.com/docs", "description": "Official Git documentation." },
        { "title": "GitHub Basics Made Easy: A Fast Beginner's Tutorial! (YouTube)", "type": "video", "url": "http://www.youtube.com/watch?v=Oaj3RBIoGFc", "description": "GitHub basics." },
        { "title": "Branching Strategies Explained (YouTube)", "type": "video", "url": "http://www.youtube.com/watch?v=U_IFGpJDbeU", "description": "Git branching strategies." }
      ],
      "projects": [
        {
          "id": "fd-p4",
          "title": "Open Source Contribution",
          "description": "Contribute to an open source frontend project.",
          "difficulty": "Intermediate",
          "estimatedTime": "1 week",
          "skills": ["Git", "Collaboration"],
          "xpReward": 100
        }
      ]
    }
  ],
  "averageSalary": "$80,000 - $130,000",
  "jobGrowth": "15%"
};

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  await CareerRole.deleteMany({ name: 'frontend-dev' });
  await CareerRole.create(frontendDev);
  console.log('Frontend Developer career role seeded!');
  await mongoose.disconnect();
}

seed();
