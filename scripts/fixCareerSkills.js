const mongoose = require('mongoose');
require('dotenv').config();

async function connectToMongoDB() {
  const mongoURIs = [
    process.env.MONGO_URI,
    'mongodb+srv://dulainmu:abcd@database.n1bm2tm.mongodb.net/skillx?retryWrites=true&w=majority',
    'mongodb://localhost:27017/skillx'
  ];

  for (const uri of mongoURIs) {
    if (uri) {
      try {
        await mongoose.connect(uri, {
          serverSelectionTimeoutMS: 5000,
          socketTimeoutMS: 45000,
        });
        console.log('✅ Connected to MongoDB successfully!');
        return;
      } catch (err) {
        console.log(`Failed to connect with URI: ${uri}`);
        continue;
      }
    }
  }
  
  console.error('Failed to connect to MongoDB with any URI');
  process.exit(1);
}

const careerRolesData = [
  {
    name: "Frontend Developer",
    slug: "frontend-developer",
    description: "Builds modern web interfaces with a focus on UX and accessibility.",
    averageSalary: "$70k–$120k+",
    jobGrowth: "High",
    vector: [0.3, 0.6, 0.7, 0.4, 0.35, 0.4, 0.7, 0.7, 0.5, 0.6, 0.3, 0.6],
    desiredRIASEC: { R: 0.30, I: 0.60, A: 0.70, S: 0.40, E: 0.35, C: 0.40 },
    desiredBigFive: { Openness: 0.70, Conscientiousness: 0.70, Extraversion: 0.50, Agreeableness: 0.60, Neuroticism: 0.30 },
    workValues: ["Achievement", "Independence", "Recognition", "Working Conditions", "Relationships"],
    requiredSkills: [
      { skillId: "html", skillName: "HTML", requiredLevel: 3, importance: "essential" },
      { skillId: "css", skillName: "CSS", requiredLevel: 3, importance: "essential" },
      { skillId: "javascript", skillName: "JavaScript", requiredLevel: 3, importance: "essential" },
      { skillId: "react", skillName: "React", requiredLevel: 2, importance: "important" }
    ],
    detailedRoadmap: [
      {
        id: "step-1",
        title: "HTML & CSS Fundamentals",
        description: "Learn the basics of web markup and styling",
        skills: ["HTML", "CSS"],
        estimatedTime: "4 weeks",
        xpReward: 200,
        projects: [
          {
            id: "project-1",
            title: "Personal Portfolio",
            description: "Create a responsive personal portfolio website",
            difficulty: "Beginner",
            estimatedTime: "2 weeks",
            xpReward: 150,
            skills: ["HTML", "CSS"]
          }
        ],
        resources: [
          {
            title: "HTML Basics",
            type: "video",
            url: "https://www.youtube.com/watch?v=UB1O30fR-EE",
            description: "Complete HTML tutorial for beginners"
          }
        ]
      }
    ]
  },
  {
    name: "Backend Developer",
    slug: "backend-developer",
    description: "Designs and builds server-side systems, APIs, and databases.",
    averageSalary: "$80k–$140k+",
    jobGrowth: "High",
    vector: [0.4, 0.7, 0.2, 0.3, 0.3, 0.6, 0.5, 0.8, 0.4, 0.5, 0.3, 0.6],
    desiredRIASEC: { R: 0.40, I: 0.70, A: 0.20, S: 0.30, E: 0.30, C: 0.60 },
    desiredBigFive: { Openness: 0.50, Conscientiousness: 0.80, Extraversion: 0.40, Agreeableness: 0.50, Neuroticism: 0.30 },
    workValues: ["Achievement", "Independence", "Working Conditions", "Support"],
    requiredSkills: [
      { skillId: "nodejs", skillName: "Node.js", requiredLevel: 3, importance: "essential" },
      { skillId: "sql", skillName: "SQL", requiredLevel: 3, importance: "essential" },
      { skillId: "apis", skillName: "APIs", requiredLevel: 3, importance: "essential" },
      { skillId: "python", skillName: "Python", requiredLevel: 2, importance: "important" }
    ],
    detailedRoadmap: [
      {
        id: "step-1",
        title: "Node.js & Express",
        description: "Learn server-side JavaScript development",
        skills: ["Node.js", "APIs"],
        estimatedTime: "5 weeks",
        xpReward: 250,
        projects: [
          {
            id: "project-1",
            title: "REST API",
            description: "Build a RESTful API with Express.js",
            difficulty: "Beginner",
            estimatedTime: "3 weeks",
            xpReward: 200,
            skills: ["Node.js", "APIs"]
          }
        ],
        resources: [
          {
            title: "Node.js Tutorial",
            type: "video",
            url: "https://www.youtube.com/watch?v=Oe421EPjeBE",
            description: "Complete Node.js and Express tutorial"
          }
        ]
      }
    ]
  },
  {
    name: "UX Designer",
    slug: "ux-designer",
    description: "Designs intuitive and accessible user experiences.",
    averageSalary: "$75k–$130k",
    jobGrowth: "Medium",
    vector: [0.25, 0.45, 0.8, 0.5, 0.35, 0.4, 0.8, 0.6, 0.55, 0.7, 0.35, 0.6],
    desiredRIASEC: { R: 0.25, I: 0.45, A: 0.80, S: 0.50, E: 0.35, C: 0.40 },
    desiredBigFive: { Openness: 0.80, Conscientiousness: 0.60, Extraversion: 0.55, Agreeableness: 0.70, Neuroticism: 0.35 },
    workValues: ["Achievement", "Independence", "Recognition", "Relationships"],
    requiredSkills: [
      { skillId: "figma", skillName: "Figma", requiredLevel: 3, importance: "essential" },
      { skillId: "userresearch", skillName: "User Research", requiredLevel: 3, importance: "essential" },
      { skillId: "prototyping", skillName: "Prototyping", requiredLevel: 3, importance: "essential" },
      { skillId: "ui", skillName: "UI", requiredLevel: 2, importance: "important" }
    ],
    detailedRoadmap: [
      {
        id: "step-1",
        title: "Design Fundamentals",
        description: "Learn design principles and user research",
        skills: ["User Research", "Prototyping"],
        estimatedTime: "5 weeks",
        xpReward: 250,
        projects: [
          {
            id: "project-1",
            title: "User Research Project",
            description: "Conduct user research and create personas",
            difficulty: "Beginner",
            estimatedTime: "2 weeks",
            xpReward: 150,
            skills: ["User Research"]
          }
        ],
        resources: [
          {
            title: "UX Design Fundamentals",
            type: "course",
            url: "https://www.coursera.org/learn/user-experience-design",
            description: "Comprehensive UX design course"
          }
        ]
      }
    ]
  }
];

async function fixCareerRoles() {
  try {
    await connectToMongoDB();
    
    const CareerRole = require('../src/models/CareerRole');
    
    console.log('🔧 Starting career role fixes...');
    console.log('=====================================');
    
    let createdCount = 0;
    let updatedCount = 0;
    
    for (const careerData of careerRolesData) {
      try {
        let existingCareer = await CareerRole.findOne({ slug: careerData.slug });
        
        if (existingCareer) {
          console.log(`📝 Updating existing career: ${careerData.name}`);
          Object.assign(existingCareer, careerData);
          existingCareer.isActive = true;
          existingCareer.version = (existingCareer.version || 0) + 1;
          await existingCareer.save();
          updatedCount++;
          console.log(`✅ Updated: ${careerData.name}`);
        } else {
          console.log(`🆕 Creating new career: ${careerData.name}`);
          const newCareer = new CareerRole({
            ...careerData,
            isActive: true,
            version: 1
          });
          await newCareer.save();
          createdCount++;
          console.log(`✅ Created: ${careerData.name}`);
        }
      } catch (error) {
        console.error(`❌ Error processing ${careerData.name}:`, error.message);
      }
    }
    
    console.log('\n📊 Fix Summary:');
    console.log('================');
    console.log(`✅ Created: ${createdCount} career roles`);
    console.log(`📝 Updated: ${updatedCount} career roles`);
    
    await mongoose.disconnect();
    console.log('\n✅ Fix complete!');
    
  } catch (error) {
    console.error('Error fixing career roles:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

fixCareerRoles();
