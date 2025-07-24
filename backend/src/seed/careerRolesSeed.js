const mongoose = require('mongoose');
const CareerRole = require('../models/CareerRole');
require('dotenv').config();

const roles = [
  {
    "name": "Frontend Developer",
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
  },
  {
    "name": "Backend Developer",
    "vector": [5, 5, 2, 3, 4, 5, 3, 5, 5, 2, 2, 4],
    "description": "You love solving complex problems and building robust systems.",
    "skills": ["Node.js", "APIs", "Databases", "Security", "Testing"],
    "roadmap": [
      "Learn a backend language (Node.js, Python, etc.)",
      "Understand databases (SQL/NoSQL)",
      "Build RESTful APIs",
      "Implement authentication and security",
      "Deploy backend applications"
    ],
    "detailedRoadmap": [
      {
        "id": "bd-1",
        "title": "Backend Language Fundamentals",
        "description": "Learn the basics of Node.js and JavaScript for backend.",
        "skills": ["Node.js", "JavaScript"],
        "estimatedTime": "2 weeks",
        "xpReward": 200,
        "resources": [
          { "title": "Node.js Documentation", "type": "article", "url": "https://nodejs.org/en/docs/", "description": "Official Node.js documentation." },
          { "title": "Learn Express JS In 35 Minutes (YouTube)", "type": "video", "url": "http://www.youtube.com/watch?v=SccSCuHhOw0", "description": "Express.js basics." },
          { "title": "JavaScript for Beginners (freeCodeCamp)", "type": "course", "url": "https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures/", "description": "JavaScript fundamentals." }
        ],
        "projects": [
          {
            "id": "bd-p1",
            "title": "Simple REST API",
            "description": "Build a simple REST API with Node.js and Express.",
            "difficulty": "Beginner",
            "estimatedTime": "1 week",
            "skills": ["Node.js", "Express"],
            "xpReward": 100
          }
        ]
      },
      {
        "id": "bd-2",
        "title": "Databases & Data Modeling",
        "description": "Understand SQL and NoSQL databases.",
        "skills": ["MongoDB", "SQL", "Data Modeling"],
        "estimatedTime": "2 weeks",
        "xpReward": 200,
        "resources": [
          { "title": "MongoDB Documentation", "type": "article", "url": "https://www.mongodb.com/docs/", "description": "Official MongoDB documentation." },
          { "title": "SQL for Beginners (freeCodeCamp)", "type": "course", "url": "https://www.freecodecamp.org/learn/sql/", "description": "Interactive SQL course." },
          { "title": "How do NoSQL databases work? Simply Explained! (YouTube)", "type": "video", "url": "http://www.youtube.com/watch?v=0buKQHokLK8", "description": "NoSQL fundamentals." }
        ],
        "projects": [
          {
            "id": "bd-p2",
            "title": "Blog Database",
            "description": "Design and implement a blog database schema.",
            "difficulty": "Intermediate",
            "estimatedTime": "1 week",
            "skills": ["MongoDB", "Data Modeling"],
            "xpReward": 100
          }
        ]
      },
      {
        "id": "bd-3",
        "title": "API Development",
        "description": "Build and document RESTful APIs.",
        "skills": ["APIs", "Express", "Swagger"],
        "estimatedTime": "2 weeks",
        "xpReward": 200,
        "resources": [
          { "title": "Express.js Documentation", "type": "article", "url": "https://expressjs.com/en/4x/api.html", "description": "Express.js API documentation." },
          { "title": "Swagger Documentation", "type": "article", "url": "https://swagger.io/docs/", "description": "Swagger API documentation." },
          { "title": "Postman API Testing Tutorial | Postman Tutorial For Beginners 2025 (YouTube)", "type": "video", "url": "http://www.youtube.com/watch?v=CLG0ha_a0q8", "description": "Postman API testing." }
        ],
        "projects": [
          {
            "id": "bd-p3",
            "title": "Task API",
            "description": "Create a task management API with authentication.",
            "difficulty": "Intermediate",
            "estimatedTime": "1 week",
            "skills": ["APIs", "Authentication"],
            "xpReward": 100
          }
        ]
      },
      {
        "id": "bd-4",
        "title": "Security & Deployment",
        "description": "Implement security best practices and deploy apps.",
        "skills": ["Security", "Deployment", "Testing"],
        "estimatedTime": "2 weeks",
        "xpReward": 200,
        "resources": [
          { "title": "Node.js Security Best Practices", "type": "article", "url": "https://expressjs.com/en/advanced/best-practice-security.html", "description": "Security best practices for Node.js." },
          { "title": "Heroku Deployment Guide", "type": "article", "url": "https://devcenter.heroku.com/articles/getting-started-with-nodejs", "description": "Heroku deployment guide." },
          { "title": "The Only Docker Tutorial You Need To Get Started (YouTube)", "type": "video", "url": "http://www.youtube.com/watch?v=DQdB7wFEygo", "description": "Docker fundamentals." }
        ],
        "projects": [
          {
            "id": "bd-p4",
            "title": "Secure API Deployment",
            "description": "Deploy a secure API to a cloud platform.",
            "difficulty": "Advanced",
            "estimatedTime": "1 week",
            "skills": ["Deployment", "Security"],
            "xpReward": 100
          }
        ]
      }
    ],
    "averageSalary": "$90,000 - $140,000",
    "jobGrowth": "17%"
  },
  {
    "name": "UX Designer",
    "vector": [2, 3, 5, 3, 3, 3, 5, 1, 2, 5, 2, 3],
    "description": "Strong sense of design, empathy, and collaboration.",
    "skills": ["Figma", "User Research", "Prototyping", "Wireframing", "Usability Testing"],
    "roadmap": [
      "Learn design fundamentals",
      "Master design tools (Figma, Sketch, etc.)",
      "Conduct user research",
      "Build wireframes and prototypes",
      "Test and iterate designs"
    ],
    "detailedRoadmap": [
      {
        "id": "ux-1",
        "title": "Design Foundations",
        "description": "Learn the basics of design principles and color theory.",
        "skills": ["Design Principles", "Color Theory"],
        "estimatedTime": "2 weeks",
        "xpReward": 200,
        "resources": [
          { "title": "Design Fundamentals (Interaction Design Foundation)", "type": "course", "url": "https://www.interaction-design.org/literature/article/design-fundamentals", "description": "Design fundamentals course." },
          { "title": "Color Theory for Noobs | Beginner Guide (YouTube)", "type": "video", "url": "http://www.youtube.com/watch?v=AvgCkHrcj90", "description": "Color theory basics." },
          { "title": "The ULTIMATE Guide To Typography For Beginners (YouTube)", "type": "video", "url": "http://www.youtube.com/watch?v=AXpxZMRM1EY", "description": "Typography basics." }
        ],
        "projects": [
          {
            "id": "ux-p1",
            "title": "Mood Board",
            "description": "Create a mood board for a new app.",
            "difficulty": "Beginner",
            "estimatedTime": "1 week",
            "skills": ["Design Principles"],
            "xpReward": 100
          }
        ]
      },
      {
        "id": "ux-2",
        "title": "Design Tools",
        "description": "Master Figma and Sketch for UI design.",
        "skills": ["Figma", "Sketch"],
        "estimatedTime": "2 weeks",
        "xpReward": 200,
        "resources": [
          { "title": "Figma for Beginners (Udemy)", "type": "course", "url": "https://www.udemy.com/course/figma-for-beginners/", "description": "Figma UI design course." },
          { "title": "How to Draw Heads⚡Easy⚡ (YouTube)", "type": "video", "url": "http://www.youtube.com/watch?v=XBhPz9m0duM", "description": "Sketch basics." },
          { "title": "Build your first plugin: 1. Overview (YouTube)", "type": "video", "url": "http://www.youtube.com/watch?v=4G9RHt2OyuY", "description": "Figma plugins." }
        ],
        "projects": [
          {
            "id": "ux-p2",
            "title": "UI Kit",
            "description": "Design a UI kit in Figma.",
            "difficulty": "Intermediate",
            "estimatedTime": "1 week",
            "skills": ["Figma"],
            "xpReward": 100
          }
        ]
      },
      {
        "id": "ux-3",
        "title": "User Research",
        "description": "Conduct user interviews and usability tests.",
        "skills": ["User Research", "Usability Testing"],
        "estimatedTime": "2 weeks",
        "xpReward": 200,
        "resources": [
          { "title": "User Research Methods (Interaction Design Foundation)", "type": "course", "url": "https://www.interaction-design.org/literature/article/user-research-methods", "description": "User research methods." },
          { "title": "Usability Testing Tips and Examples | Google UX Design Certificate (YouTube)", "type": "video", "url": "http://www.youtube.com/watch?v=nYCJTea1AUQ", "description": "Usability testing basics." },
          { "title": "How To Create A User Persona (Video Guide) (YouTube)", "type": "video", "url": "http://www.youtube.com/watch?v=DvV7ZcRVQ4g", "description": "User persona creation." }
        ],
        "projects": [
          {
            "id": "ux-p3",
            "title": "User Interview Report",
            "description": "Write a report based on user interviews.",
            "difficulty": "Intermediate",
            "estimatedTime": "1 week",
            "skills": ["User Research"],
            "xpReward": 100
          }
        ]
      },
      {
        "id": "ux-4",
        "title": "Wireframing & Prototyping",
        "description": "Build wireframes and interactive prototypes.",
        "skills": ["Wireframing", "Prototyping"],
        "estimatedTime": "2 weeks",
        "xpReward": 200,
        "resources": [
          { "title": "Wireframing (Interaction Design Foundation)", "type": "course", "url": "https://www.interaction-design.org/literature/article/wireframing", "description": "Wireframing basics." },
          { "title": "Figma Prototype Tutorial for Beginners (2025) (YouTube)", "type": "video", "url": "http://www.youtube.com/watch?v=1ucLq6JTxac", "description": "Figma prototyping." },
          { "title": "Figma UX tutorial for beginners - Prototype (YouTube)", "type": "video", "url": "http://www.youtube.com/watch?v=v1UKB-0EUhQ", "description": "Prototyping basics." }
        ],
        "projects": [
          {
            "id": "ux-p4",
            "title": "App Prototype",
            "description": "Create an interactive prototype for a mobile app.",
            "difficulty": "Advanced",
            "estimatedTime": "1 week",
            "skills": ["Prototyping"],
            "xpReward": 100
          }
        ]
      }
    ],
    "averageSalary": "$75,000 - $120,000",
    "jobGrowth": "13%"
  },
  {
    "name": "Data Analyst",
    "vector": [5, 5, 2, 2, 4, 4, 3, 4, 5, 2, 1, 5],
    "description": "You enjoy analyzing data and uncovering insights.",
    "skills": ["Python", "SQL", "Data Visualization", "Statistics", "Excel"],
    "roadmap": [
      "Learn Python and SQL",
      "Master data visualization tools",
      "Understand statistics and probability",
      "Analyze real datasets",
      "Build data projects"
    ],
    "detailedRoadmap": [
      {
        "id": "da-1",
        "title": "Programming Foundations",
        "description": "Learn Python and SQL for data analysis.",
        "skills": ["Python", "SQL"],
        "estimatedTime": "2 weeks",
        "xpReward": 200,
        "resources": [
          { "title": "Python for Everybody (Coursera)", "type": "course", "url": "https://www.coursera.org/learn/python", "description": "Python programming course." },
          { "title": "SQL for Beginners (freeCodeCamp)", "type": "course", "url": "https://www.freecodecamp.org/learn/sql/", "description": "Interactive SQL course." },
          { "title": "Learn Python in Less than 10 Minutes for Beginners (Fast & Easy) (YouTube)", "type": "video", "url": "http://www.youtube.com/watch?v=fWjsdhR3z3c", "description": "Python basics." }
        ],
        "projects": [
          {
            "id": "da-p1",
            "title": "Data Cleaning Script",
            "description": "Write a Python script to clean a messy dataset.",
            "difficulty": "Beginner",
            "estimatedTime": "1 week",
            "skills": ["Python"],
            "xpReward": 100
          }
        ]
      },
      {
        "id": "da-2",
        "title": "Data Visualization",
        "description": "Master tools like Tableau and matplotlib.",
        "skills": ["Data Visualization", "Tableau", "matplotlib"],
        "estimatedTime": "2 weeks",
        "xpReward": 200,
        "resources": [
          { "title": "Tableau Documentation", "type": "article", "url": "https://help.tableau.com/current/pro/desktop/en-us/index.html", "description": "Official Tableau documentation." },
          { "title": "Data Visualization Tutorial For Beginners | Big Data Analytics Tutorial | Simplilearn (YouTube)", "type": "video", "url": "http://www.youtube.com/watch?v=MiiANxRHSv4", "description": "Data visualization basics." },
          { "title": "Python - Matplotlib Tutorial for Beginners (YouTube)", "type": "video", "url": "http://www.youtube.com/watch?v=qErBw-R2Ybk", "description": "Matplotlib basics." }
        ],
        "projects": [
          {
            "id": "da-p2",
            "title": "Sales Dashboard",
            "description": "Create a sales dashboard in Tableau.",
            "difficulty": "Intermediate",
            "estimatedTime": "1 week",
            "skills": ["Data Visualization"],
            "xpReward": 100
          }
        ]
      },
      {
        "id": "da-3",
        "title": "Statistics & Probability",
        "description": "Understand core statistics for data analysis.",
        "skills": ["Statistics", "Probability"],
        "estimatedTime": "2 weeks",
        "xpReward": 200,
        "resources": [
          { "title": "Statistics for Beginners (freeCodeCamp)", "type": "course", "url": "https://www.freecodecamp.org/learn/data-analysis-with-python/statistics-and-probability/", "description": "Statistics fundamentals." },
          { "title": "Math Antics - Basic Probability (YouTube)", "type": "video", "url": "http://www.youtube.com/watch?v=KzfWUEJjG18", "description": "Probability basics." },
          { "title": "What is Statistics? A Beginner's Guide to Statistics (Data Analytics)! (YouTube)", "type": "video", "url": "http://www.youtube.com/watch?v=Gi4GxE4obAc", "description": "Statistics basics." }
        ],
        "projects": [
          {
            "id": "da-p3",
            "title": "A/B Test Analysis",
            "description": "Analyze A/B test results and report findings.",
            "difficulty": "Intermediate",
            "estimatedTime": "1 week",
            "skills": ["Statistics"],
            "xpReward": 100
          }
        ]
      },
      {
        "id": "da-4",
        "title": "Real Data Projects",
        "description": "Work with real datasets and present insights.",
        "skills": ["Excel", "Data Analysis"],
        "estimatedTime": "2 weeks",
        "xpReward": 200,
        "resources": [
          { "title": "A Beginners Guide To The Data Analysis Process (YouTube)", "type": "video", "url": "http://www.youtube.com/watch?v=lgCNTuLBMK4", "description": "Data analysis basics." },
          { "title": "Excel Tutorial for Beginners (YouTube)", "type": "video", "url": "http://www.youtube.com/watch?v=LgXzzu68j7M", "description": "Excel basics." },
          { "title": "A Beginners Guide To The Data Analysis Process (YouTube)", "type": "video", "url": "http://www.youtube.com/watch?v=lgCNTuLBMK4", "description": "Data analysis basics." }
        ],
        "projects": [
          {
            "id": "da-p4",
            "title": "Customer Segmentation",
            "description": "Segment customers using clustering techniques.",
            "difficulty": "Advanced",
            "estimatedTime": "1 week",
            "skills": ["Data Analysis"],
            "xpReward": 100
          }
        ]
      }
    ],
    "averageSalary": "$85,000 - $125,000",
    "jobGrowth": "20%"
  },
  {
    "name": "Product Manager",
    "vector": [3, 3, 5, 5, 5, 4, 4, 2, 3, 3, 5, 4],
    "description": "You're organized, adaptive, and a natural leader.",
    "skills": ["Strategy", "Analytics", "Communication", "Agile", "Market Research"],
    "roadmap": [
      "Learn product management fundamentals",
      "Understand market research and analytics",
      "Master agile methodologies",
      "Practice stakeholder management",
      "Build product case studies"
    ],
    "detailedRoadmap": [
      {
        "id": "pm-1",
        "title": "PM Foundations",
        "description": "Learn the basics of product management.",
        "skills": ["Product Management", "Strategy"],
        "estimatedTime": "2 weeks",
        "xpReward": 200,
        "resources": [
          { "title": "Product Management (Interaction Design Foundation)", "type": "course", "url": "https://www.interaction-design.org/literature/article/product-management", "description": "Product management fundamentals." },
          { "title": "What do product managers do? - Agile Coach (YouTube)", "type": "video", "url": "http://www.youtube.com/watch?v=yUOC-Y0f5ZQ", "description": "Strategy basics." },
          { "title": "What do product managers do? - Agile Coach (YouTube)", "type": "video", "url": "http://www.youtube.com/watch?v=yUOC-Y0f5ZQ", "description": "Product management basics." }
        ],
        "projects": [
          {
            "id": "pm-p1",
            "title": "Product Canvas",
            "description": "Create a product canvas for a new app.",
            "difficulty": "Beginner",
            "estimatedTime": "1 week",
            "skills": ["Product Management"],
            "xpReward": 100
          }
        ]
      },
      {
        "id": "pm-2",
        "title": "Market Research",
        "description": "Understand market research and analytics.",
        "skills": ["Market Research", "Analytics"],
        "estimatedTime": "2 weeks",
        "xpReward": 200,
        "resources": [
          { "title": "Market Research (Interaction Design Foundation)", "type": "course", "url": "https://www.interaction-design.org/literature/article/market-research", "description": "Market research fundamentals." },
          { "title": "How To Do Market Research (Market Research 101) (YouTube)", "type": "video", "url": "http://www.youtube.com/watch?v=kFM72UJhW8s", "description": "Analytics basics." },
          { "title": "How To Do Market Research (Market Research 101) (YouTube)", "type": "video", "url": "http://www.youtube.com/watch?v=kFM72UJhW8s", "description": "Market research basics." }
        ],
        "projects": [
          {
            "id": "pm-p2",
            "title": "Competitor Analysis",
            "description": "Analyze competitors for a product idea.",
            "difficulty": "Intermediate",
            "estimatedTime": "1 week",
            "skills": ["Analytics"],
            "xpReward": 100
          }
        ]
      },
      {
        "id": "pm-3",
        "title": "Agile & Stakeholders",
        "description": "Master agile methodologies and stakeholder management.",
        "skills": ["Agile", "Communication"],
        "estimatedTime": "2 weeks",
        "xpReward": 200,
        "resources": [
          { "title": "Agile (Interaction Design Foundation)", "type": "course", "url": "https://www.interaction-design.org/literature/article/agile", "description": "Agile methodologies." },
          { "title": "How to Manage Difficult Stakeholders [6 COMMON CHALLENGES] (YouTube)", "type": "video", "url": "http://www.youtube.com/watch?v=NaGhBpfZLzg", "description": "Stakeholder management basics." },
          { "title": "What do product managers do? - Agile Coach (YouTube)", "type": "video", "url": "http://www.youtube.com/watch?v=yUOC-Y0f5ZQ", "description": "Agile basics." }
        ],
        "projects": [
          {
            "id": "pm-p3",
            "title": "Sprint Planning",
            "description": "Plan a sprint for a cross-functional team.",
            "difficulty": "Intermediate",
            "estimatedTime": "1 week",
            "skills": ["Agile"],
            "xpReward": 100
          }
        ]
      },
      {
        "id": "pm-4",
        "title": "Product Case Studies",
        "description": "Build and present product case studies.",
        "skills": ["Case Studies", "Presentation"],
        "estimatedTime": "2 weeks",
        "xpReward": 200,
        "resources": [
          { "title": "Product Case Studies (Interaction Design Foundation)", "type": "course", "url": "https://www.interaction-design.org/literature/article/product-case-studies", "description": "Product case studies." },
          { "title": "Answer Product Sense Interview Questions Like A Pro (YouTube)", "type": "video", "url": "http://www.youtube.com/watch?v=WE0KeryvpXE", "description": "Presentation basics." },
          { "title": "Answer Product Sense Interview Questions Like A Pro (YouTube)", "type": "video", "url": "http://www.youtube.com/watch?v=WE0KeryvpXE", "description": "Product case studies basics." }
        ],
        "projects": [
          {
            "id": "pm-p4",
            "title": "Case Study Presentation",
            "description": "Present a product case study to stakeholders.",
            "difficulty": "Advanced",
            "estimatedTime": "1 week",
            "skills": ["Presentation"],
            "xpReward": 100
          }
        ]
      }
    ],
    "averageSalary": "$100,000 - $160,000",
    "jobGrowth": "12%"
  }
]

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  await CareerRole.deleteMany({});
  await CareerRole.insertMany(roles);
  console.log('Career roles seeded!');
  await mongoose.disconnect();
}

seed(); 