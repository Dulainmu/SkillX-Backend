const mongoose = require('mongoose');
const CareerRole = require('../src/models/CareerRole');
require('dotenv').config();

// Learning materials data for Frontend Developer
const frontendMaterials = {
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
};

// Project data for Frontend Developer
const frontendProjects = {
  step1: [
    {
      id: "proj-1",
      title: "Personal Portfolio Website",
      description: "Build a responsive portfolio website showcasing your skills and projects",
      difficulty: "Beginner",
      estimatedTime: "1 week",
      skills: ["HTML", "CSS", "JavaScript"],
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
      skills: ["React", "JavaScript", "CSS"],
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
};

async function updateFrontendDeveloper() {
  try {
    // Use the same connection method as the working checkCareerById script
    await mongoose.connect(process.env.MONGO_URI || 'mongodb+srv://dulainmu:abcd@database.n1bm2tm.mongodb.net/skillx');
    console.log('✅ Connected to MongoDB');

    // Find the Frontend Developer career role
    const frontendRole = await CareerRole.findOne({ name: 'Frontend Developer' });
    
    if (!frontendRole) {
      console.log('❌ Frontend Developer career role not found');
      return;
    }

    console.log(`🔧 Updating Frontend Developer career role...`);

    // Update the detailed roadmap with learning materials and projects
    console.log('🔍 Current roadmap structure:', JSON.stringify(frontendRole.detailedRoadmap[0], null, 2));
    
    const updatedRoadmap = frontendRole.detailedRoadmap.map((step, index) => {
      const stepNumber = index + 1;
      const stepMaterials = frontendMaterials[`step${stepNumber}`] || [];
      const stepProjects = frontendProjects[`step${stepNumber}`] || [];
      
      console.log(`📝 Step ${stepNumber}: Adding ${stepMaterials.length} materials and ${stepProjects.length} projects`);
      
      const updatedStep = {
        ...step,
        resources: stepMaterials,
        projects: stepProjects
      };
      
      console.log(`✅ Updated step ${stepNumber}:`, JSON.stringify(updatedStep, null, 2));
      
      return updatedStep;
    });

    // Update the career role
    await CareerRole.findByIdAndUpdate(frontendRole._id, {
      detailedRoadmap: updatedRoadmap
    });

    console.log('✅ Frontend Developer updated successfully!');
    
    // Verify the update
    const updatedRole = await CareerRole.findById(frontendRole._id);
    const totalMaterials = updatedRole.detailedRoadmap.reduce((sum, step) => sum + (step.resources?.length || 0), 0);
    const totalProjects = updatedRole.detailedRoadmap.reduce((sum, step) => sum + (step.projects?.length || 0), 0);
    
    console.log(`📊 Verification: ${totalMaterials} learning materials, ${totalProjects} projects added`);
    
    // Show sample data
    console.log('\n📋 Sample Step 1 Data:');
    console.log('Learning Materials:', updatedRole.detailedRoadmap[0].resources.length);
    console.log('Projects:', updatedRole.detailedRoadmap[0].projects.length);
    
    console.log('\n📋 Sample Step 2 Data:');
    console.log('Learning Materials:', updatedRole.detailedRoadmap[1].resources.length);
    console.log('Projects:', updatedRole.detailedRoadmap[1].projects.length);

  } catch (error) {
    console.error('❌ Error updating Frontend Developer:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

updateFrontendDeveloper();
