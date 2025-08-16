const mongoose = require('mongoose');
const CareerRole = require('../src/models/CareerRole');

// Learning materials data for each career path
const learningMaterials = {
  'Frontend Developer': {
    step1: [
      {
        title: "HTML Fundamentals",
        type: "course",
        url: "https://developer.mozilla.org/en-US/docs/Learn/HTML",
        description: "Complete HTML basics and semantic markup"
      },
      {
        title: "CSS Styling Mastery",
        type: "video",
        url: "https://www.youtube.com/watch?v=1PnVor36_40",
        description: "Learn CSS layouts, flexbox, and grid systems"
      },
      {
        title: "JavaScript Essentials",
        type: "tutorial",
        url: "https://javascript.info/",
        description: "Modern JavaScript fundamentals and ES6+ features"
      }
    ],
    step2: [
      {
        title: "React Official Tutorial",
        type: "course",
        url: "https://react.dev/learn",
        description: "Official React documentation and tutorials"
      },
      {
        title: "React Hooks Deep Dive",
        type: "video",
        url: "https://www.youtube.com/watch?v=dpw9EHDh2bM",
        description: "Master React Hooks and modern patterns"
      },
      {
        title: "State Management with Redux",
        type: "article",
        url: "https://redux.js.org/tutorials/essentials/part-1-overview-concepts",
        description: "Learn Redux for state management"
      }
    ]
  },
  'Backend Developer': {
    step1: [
      {
        title: "Node.js Fundamentals",
        type: "course",
        url: "https://nodejs.org/en/learn/getting-started/introduction-to-nodejs",
        description: "Learn Node.js basics and server-side JavaScript"
      },
      {
        title: "Express.js Framework",
        type: "tutorial",
        url: "https://expressjs.com/en/starter/installing.html",
        description: "Build RESTful APIs with Express.js"
      },
      {
        title: "Database Design Principles",
        type: "article",
        url: "https://www.mongodb.com/blog/post/6-rules-of-thumb-for-mongodb-schema-design",
        description: "Learn database design and MongoDB best practices"
      }
    ],
    step2: [
      {
        title: "Authentication & Security",
        type: "course",
        url: "https://auth0.com/blog/node-js-and-typescript-tutorial-building-and-securing-an-api/",
        description: "Implement secure authentication systems"
      },
      {
        title: "API Design Best Practices",
        type: "article",
        url: "https://restfulapi.net/rest-api-design-tutorial-with-example/",
        description: "Design RESTful APIs following best practices"
      },
      {
        title: "Testing with Jest",
        type: "tutorial",
        url: "https://jestjs.io/docs/getting-started",
        description: "Write comprehensive tests for your backend"
      }
    ]
  },
  'Full Stack Developer': {
    step1: [
      {
        title: "Full Stack Architecture",
        type: "course",
        url: "https://www.freecodecamp.org/news/full-stack-development/",
        description: "Understand full stack development concepts"
      },
      {
        title: "MERN Stack Overview",
        type: "video",
        url: "https://www.youtube.com/watch?v=7CqJlxBYj-M",
        description: "Learn MongoDB, Express, React, Node.js stack"
      },
      {
        title: "Version Control with Git",
        type: "tutorial",
        url: "https://git-scm.com/doc",
        description: "Master Git for collaborative development"
      }
    ],
    step2: [
      {
        title: "Deployment Strategies",
        type: "course",
        url: "https://vercel.com/docs/concepts/deployments",
        description: "Deploy full stack applications to production"
      },
      {
        title: "Performance Optimization",
        type: "article",
        url: "https://web.dev/performance/",
        description: "Optimize application performance"
      },
      {
        title: "DevOps Basics",
        type: "tutorial",
        url: "https://www.atlassian.com/devops",
        description: "Learn CI/CD and deployment automation"
      }
    ]
  }
};

// Project data for each career path
const projectData = {
  'Frontend Developer': {
    step1: [
      {
        id: "proj-1",
        title: "Personal Portfolio Website",
        description: "Build a responsive portfolio website showcasing your skills and projects",
        difficulty: "Beginner",
        estimatedTime: "1 week",
        xpReward: 100,
        requirements: [
          "Responsive design that works on mobile and desktop",
          "Navigation menu with smooth scrolling",
          "About, Skills, Projects, and Contact sections",
          "Contact form with validation",
          "Smooth animations and transitions"
        ],
        deliverables: [
          "Live website deployed on GitHub Pages or Netlify",
          "Source code with clean, well-commented HTML/CSS/JS",
          "README file with setup instructions",
          "Screenshots of the website on different devices"
        ],
        resources: [
          {
            title: "Portfolio Design Inspiration",
            type: "article",
            url: "https://www.behance.net/search/projects?search=portfolio",
            description: "Get inspired by professional portfolio designs"
          },
          {
            title: "CSS Grid Layout Guide",
            type: "tutorial",
            url: "https://css-tricks.com/snippets/css/complete-guide-grid/",
            description: "Learn CSS Grid for modern layouts"
          }
        ]
      }
    ],
    step2: [
      {
        id: "proj-2",
        title: "Task Manager App",
        description: "Create a React-based task management application with local storage",
        difficulty: "Intermediate",
        estimatedTime: "2 weeks",
        xpReward: 150,
        requirements: [
          "Add, edit, and delete tasks",
          "Mark tasks as complete/incomplete",
          "Filter tasks by status (all, active, completed)",
          "Persist data using localStorage",
          "Responsive design with modern UI"
        ],
        deliverables: [
          "Working React application",
          "Clean component structure",
          "State management implementation",
          "Responsive CSS styling",
          "README with setup and usage instructions"
        ],
        resources: [
          {
            title: "React State Management",
            type: "video",
            url: "https://www.youtube.com/watch?v=O6P86uwfdR0",
            description: "Learn React state management patterns"
          },
          {
            title: "React Hooks Tutorial",
            type: "tutorial",
            url: "https://react.dev/reference/react",
            description: "Master React Hooks for state and effects"
          }
        ]
      }
    ]
  },
  'Backend Developer': {
    step1: [
      {
        id: "proj-1",
        title: "RESTful API Server",
        description: "Build a complete REST API with Express.js and MongoDB",
        difficulty: "Beginner",
        estimatedTime: "1 week",
        xpReward: 100,
        requirements: [
          "CRUD operations for a resource (e.g., users, posts)",
          "Input validation and error handling",
          "MongoDB integration with Mongoose",
          "Environment variable configuration",
          "API documentation with examples"
        ],
        deliverables: [
          "Working API server with all CRUD endpoints",
          "MongoDB database with sample data",
          "Postman collection or API documentation",
          "Error handling and validation middleware",
          "README with setup and API usage instructions"
        ],
        resources: [
          {
            title: "Express.js Routing",
            type: "tutorial",
            url: "https://expressjs.com/en/guide/routing.html",
            description: "Learn Express.js routing and middleware"
          },
          {
            title: "MongoDB with Mongoose",
            type: "course",
            url: "https://mongoosejs.com/docs/",
            description: "Master MongoDB integration with Mongoose"
          }
        ]
      }
    ],
    step2: [
      {
        id: "proj-2",
        title: "Authentication System",
        description: "Implement JWT-based authentication with user registration and login",
        difficulty: "Intermediate",
        estimatedTime: "2 weeks",
        xpReward: 150,
        requirements: [
          "User registration with password hashing",
          "JWT token generation and validation",
          "Protected routes middleware",
          "Password reset functionality",
          "Input validation and security measures"
        ],
        deliverables: [
          "Complete authentication system",
          "JWT middleware implementation",
          "Password hashing with bcrypt",
          "Protected API endpoints",
          "Security best practices documentation"
        ],
        resources: [
          {
            title: "JWT Authentication",
            type: "article",
            url: "https://jwt.io/introduction",
            description: "Learn JWT token-based authentication"
          },
          {
            title: "Password Security",
            type: "tutorial",
            url: "https://auth0.com/blog/hashing-in-action-understanding-bcrypt/",
            description: "Implement secure password hashing"
          }
        ]
      }
    ]
  },
  'Full Stack Developer': {
    step1: [
      {
        id: "proj-1",
        title: "Blog Platform",
        description: "Create a full-stack blog application with user authentication",
        difficulty: "Intermediate",
        estimatedTime: "2 weeks",
        xpReward: 150,
        requirements: [
          "User registration and authentication",
          "Create, edit, and delete blog posts",
          "Comment system on posts",
          "User profiles and author information",
          "Responsive frontend with React"
        ],
        deliverables: [
          "Complete blog application",
          "User authentication system",
          "Blog post CRUD operations",
          "Comment functionality",
          "Deployed application with documentation"
        ],
        resources: [
          {
            title: "MERN Stack Tutorial",
            type: "course",
            url: "https://www.youtube.com/watch?v=7CqJlxBYj-M",
            description: "Complete MERN stack development guide"
          },
          {
            title: "Full Stack Architecture",
            type: "article",
            url: "https://www.freecodecamp.org/news/full-stack-development/",
            description: "Understand full stack application architecture"
          }
        ]
      }
    ],
    step2: [
      {
        id: "proj-2",
        title: "E-commerce Platform",
        description: "Build a complete e-commerce platform with payment integration",
        difficulty: "Advanced",
        estimatedTime: "3 weeks",
        xpReward: 200,
        requirements: [
          "Product catalog with categories",
          "Shopping cart functionality",
          "User authentication and profiles",
          "Order management system",
          "Payment integration (Stripe/PayPal)",
          "Admin dashboard for product management"
        ],
        deliverables: [
          "Complete e-commerce application",
          "Payment processing integration",
          "Admin dashboard",
          "Order management system",
          "Deployed application with documentation"
        ],
        resources: [
          {
            title: "Stripe Payment Integration",
            type: "tutorial",
            url: "https://stripe.com/docs/payments",
            description: "Learn to integrate Stripe payments"
          },
          {
            title: "E-commerce Best Practices",
            type: "article",
            url: "https://www.shopify.com/blog/ecommerce-best-practices",
            description: "E-commerce development best practices"
          }
        ]
      }
    ]
  }
};

async function updateCareerMaterials() {
  try {
    // Use the same connection method as the working scripts
    await mongoose.connect(process.env.MONGO_URI || 'mongodb+srv://dulainmu:abcd@database.n1bm2tm.mongodb.net/skillx');
    console.log('✅ Connected to MongoDB');

    const careerRoles = await CareerRole.find({});
    console.log(`📊 Found ${careerRoles.length} career roles to update`);

    for (const role of careerRoles) {
      console.log(`\n🔧 Updating: ${role.name}`);
      
      const materials = learningMaterials[role.name];
      const projects = projectData[role.name];
      
      if (materials && projects) {
        // Update the detailed roadmap with learning materials and projects
        const updatedRoadmap = role.detailedRoadmap.map((step, index) => {
          const stepNumber = index + 1;
          const stepMaterials = materials[`step${stepNumber}`] || [];
          const stepProjects = projects[`step${stepNumber}`] || [];
          
          return {
            ...step,
            resources: stepMaterials,
            projects: stepProjects
          };
        });

        await CareerRole.findByIdAndUpdate(role._id, {
          detailedRoadmap: updatedRoadmap
        });

        console.log(`✅ Updated ${role.name} with learning materials and projects`);
      } else {
        console.log(`⚠️  No materials/projects data found for: ${role.name}`);
      }
    }

    console.log('\n🎉 Learning materials and projects added successfully!');
    
    // Verify the updates
    const updatedRoles = await CareerRole.find({});
    console.log('\n📋 Verification Summary:');
    for (const role of updatedRoles) {
      const totalMaterials = role.detailedRoadmap.reduce((sum, step) => sum + (step.resources?.length || 0), 0);
      const totalProjects = role.detailedRoadmap.reduce((sum, step) => sum + (step.projects?.length || 0), 0);
      console.log(`• ${role.name}: ${totalMaterials} materials, ${totalProjects} projects`);
    }

  } catch (error) {
    console.error('❌ Error updating career materials:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

updateCareerMaterials();
