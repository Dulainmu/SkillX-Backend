const mongoose = require('mongoose');
const CareerRole = require('../src/models/CareerRole');
require('dotenv').config();

// Learning materials for each step
const materials = {
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

async function updateMaterials() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI || 'mongodb+srv://dulainmu:abcd@database.n1bm2tm.mongodb.net/skillx');
    console.log('✅ Connected to MongoDB');

    const careerRoles = await CareerRole.find({});
    console.log(`📊 Found ${careerRoles.length} career roles`);

    for (const role of careerRoles) {
      console.log(`\n🔧 Updating: ${role.name}`);
      
      const roleMaterials = materials[role.name];
      if (!roleMaterials) {
        console.log(`⚠️  No materials found for: ${role.name}`);
        continue;
      }

      // Update each step with learning materials
      const updatedRoadmap = role.detailedRoadmap.map((step, index) => {
        const stepNumber = index + 1;
        const stepMaterials = roleMaterials[`step${stepNumber}`] || [];
        
        console.log(`  📝 Step ${stepNumber}: Adding ${stepMaterials.length} learning materials`);
        
        return {
          ...step,
          resources: stepMaterials
        };
      });

      // Update the career role
      await CareerRole.findByIdAndUpdate(role._id, {
        detailedRoadmap: updatedRoadmap
      });

      console.log(`✅ Updated ${role.name} with learning materials`);
    }

    console.log('\n🎉 All career paths updated successfully!');
    
    // Verify the updates
    const updatedRoles = await CareerRole.find({});
    console.log('\n📋 Verification Summary:');
    for (const role of updatedRoles) {
      const totalMaterials = role.detailedRoadmap.reduce((sum, step) => sum + (step.resources?.length || 0), 0);
      console.log(`• ${role.name}: ${totalMaterials} learning materials`);
    }

  } catch (error) {
    console.error('❌ Error updating materials:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

updateMaterials();
