const mongoose = require('mongoose');
const Skill = require('../models/Skill');
require('dotenv').config();

// Default proficiency levels template
const getDefaultProficiencyLevels = (skillName, category) => {
  const baseLevels = [
    {
      level: 'Beginner',
      title: `${skillName} Fundamentals`,
      description: `Basic understanding and foundational knowledge of ${skillName}`,
      expectations: [
        `Understand basic ${skillName} concepts and terminology`,
        `Complete simple ${skillName} tasks and exercises`,
        `Follow ${skillName} best practices and conventions`,
        `Use basic ${skillName} tools and resources`,
        `Apply fundamental ${skillName} principles`
      ],
      projects: [
        `Simple ${skillName} project`,
        `Basic ${skillName} tutorial completion`,
        `Small ${skillName} practice exercises`
      ],
      timeToAchieve: 40,
      prerequisites: ['Basic computer literacy'],
      resources: [
        {
          type: 'course',
          title: `${skillName} Fundamentals Course`,
          url: `https://example.com/${skillName.toLowerCase()}-fundamentals`,
          description: `Complete beginner course for ${skillName}`,
          difficulty: 'Beginner',
          estimatedTime: 20,
          isRequired: true
        }
      ]
    },
    {
      level: 'Intermediate',
      title: `Advanced ${skillName} Concepts`,
      description: `Intermediate level proficiency with practical application of ${skillName}`,
      expectations: [
        `Apply ${skillName} concepts to real-world scenarios`,
        `Debug and troubleshoot ${skillName} issues`,
        `Optimize ${skillName} performance and efficiency`,
        `Integrate ${skillName} with other technologies`,
        `Follow ${skillName} design patterns and architectures`
      ],
      projects: [
        `Medium complexity ${skillName} project`,
        `${skillName} integration project`,
        `Performance optimization project`
      ],
      timeToAchieve: 60,
      prerequisites: [`${skillName} Fundamentals`, 'Basic problem-solving skills'],
      resources: [
        {
          type: 'course',
          title: `Advanced ${skillName} Course`,
          url: `https://example.com/${skillName.toLowerCase()}-advanced`,
          description: `Intermediate to advanced ${skillName} concepts`,
          difficulty: 'Intermediate',
          estimatedTime: 30,
          isRequired: true
        }
      ]
    },
    {
      level: 'Advanced',
      title: `${skillName} Expert Level`,
      description: `Advanced mastery of ${skillName} with complex problem-solving capabilities`,
      expectations: [
        `Design and architect complex ${skillName} solutions`,
        `Mentor others in ${skillName} best practices`,
        `Contribute to ${skillName} community and open source`,
        `Optimize ${skillName} for enterprise-scale applications`,
        `Innovate and create new ${skillName} approaches`
      ],
      projects: [
        `Large-scale ${skillName} application`,
        `${skillName} framework or library development`,
        `Enterprise ${skillName} solution`
      ],
      timeToAchieve: 80,
      prerequisites: [`Advanced ${skillName} Concepts`, 'Strong problem-solving skills'],
      resources: [
        {
          type: 'course',
          title: `${skillName} Expert Masterclass`,
          url: `https://example.com/${skillName.toLowerCase()}-expert`,
          description: `Expert-level ${skillName} training`,
          difficulty: 'Advanced',
          estimatedTime: 40,
          isRequired: true
        }
      ]
    },
    {
      level: 'Expert',
      title: `${skillName} Master`,
      description: `Complete mastery of ${skillName} with ability to innovate and lead`,
      expectations: [
        `Lead ${skillName} strategy and architecture decisions`,
        `Create industry-leading ${skillName} solutions`,
        `Contribute to ${skillName} standards and specifications`,
        `Mentor and train ${skillName} experts`,
        `Drive ${skillName} innovation and research`
      ],
      projects: [
        `Industry-leading ${skillName} platform`,
        `${skillName} research and development`,
        `${skillName} consulting and advisory services`
      ],
      timeToAchieve: 120,
      prerequisites: [`${skillName} Expert Level`, 'Leadership experience'],
      resources: [
        {
          type: 'course',
          title: `${skillName} Master Program`,
          url: `https://example.com/${skillName.toLowerCase()}-master`,
          description: `Master-level ${skillName} program`,
          difficulty: 'Expert',
          estimatedTime: 60,
          isRequired: true
        }
      ]
    }
  ];

  // Customize based on category
  if (category === 'frontend') {
    baseLevels[0].expectations = [
      'Create basic user interfaces and layouts',
      'Implement responsive design principles',
      'Use modern frontend development tools',
      'Apply accessibility best practices',
      'Debug frontend issues effectively'
    ];
    baseLevels[1].expectations = [
      'Build complex interactive applications',
      'Optimize frontend performance',
      'Implement state management solutions',
      'Use modern frontend frameworks',
      'Create reusable component libraries'
    ];
  } else if (category === 'backend') {
    baseLevels[0].expectations = [
      'Create basic APIs and server applications',
      'Handle data storage and retrieval',
      'Implement basic security measures',
      'Use backend development tools',
      'Debug server-side issues'
    ];
    baseLevels[1].expectations = [
      'Design scalable backend architectures',
      'Implement advanced security features',
      'Optimize database performance',
      'Create microservices',
      'Handle high-traffic applications'
    ];
  } else if (category === 'data') {
    baseLevels[0].expectations = [
      'Collect and clean data effectively',
      'Perform basic data analysis',
      'Create simple data visualizations',
      'Use data analysis tools',
      'Interpret data insights'
    ];
    baseLevels[1].expectations = [
      'Build complex data pipelines',
      'Create advanced analytics models',
      'Design data architectures',
      'Implement data governance',
      'Optimize data processing performance'
    ];
  } else if (category === 'design') {
    baseLevels[0].expectations = [
      'Create basic design mockups',
      'Apply design principles and theory',
      'Use design tools effectively',
      'Understand user experience basics',
      'Create simple prototypes'
    ];
    baseLevels[1].expectations = [
      'Design complex user interfaces',
      'Conduct user research and testing',
      'Create design systems',
      'Optimize user experience',
      'Lead design projects'
    ];
  } else if (category === 'devops') {
    baseLevels[0].expectations = [
      'Set up basic development environments',
      'Use version control systems',
      'Deploy simple applications',
      'Monitor basic system metrics',
      'Follow DevOps practices'
    ];
    baseLevels[1].expectations = [
      'Automate deployment pipelines',
      'Manage cloud infrastructure',
      'Implement monitoring and logging',
      'Optimize system performance',
      'Lead DevOps initiatives'
    ];
  } else if (category === 'mobile') {
    baseLevels[0].expectations = [
      'Create basic mobile applications',
      'Use mobile development tools',
      'Implement basic mobile UI',
      'Handle mobile-specific features',
      'Test mobile applications'
    ];
    baseLevels[1].expectations = [
      'Build complex mobile applications',
      'Optimize mobile performance',
      'Implement advanced mobile features',
      'Handle cross-platform development',
      'Lead mobile development teams'
    ];
  } else if (category === 'security') {
    baseLevels[0].expectations = [
      'Understand basic security concepts',
      'Identify common security threats',
      'Implement basic security measures',
      'Use security testing tools',
      'Follow security best practices'
    ];
    baseLevels[1].expectations = [
      'Conduct security assessments',
      'Implement advanced security controls',
      'Design secure architectures',
      'Respond to security incidents',
      'Lead security initiatives'
    ];
  } else if (category === 'soft-skills') {
    baseLevels[0].expectations = [
      'Communicate effectively in professional settings',
      'Work collaboratively in teams',
      'Manage time and priorities',
      'Adapt to changing requirements',
      'Learn new skills independently'
    ];
    baseLevels[1].expectations = [
      'Lead teams and projects',
      'Mentor junior team members',
      'Negotiate and resolve conflicts',
      'Present complex ideas clearly',
      'Drive organizational change'
    ];
  }

  return baseLevels;
};

// Connect to MongoDB
const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
    if (!mongoUri) {
      console.error('No MongoDB URI found. Please set MONGO_URI or MONGODB_URI environment variable.');
      process.exit(1);
    }
    await mongoose.connect(mongoUri);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Add proficiency levels to all skills
const addProficiencyLevels = async () => {
  try {
    console.log('Starting to add proficiency levels to all skills...');
    
    // Get all skills
    const skills = await Skill.find({});
    console.log(`Found ${skills.length} skills in the database`);
    
    let updatedCount = 0;
    let skippedCount = 0;
    
    for (const skill of skills) {
      // Check if skill already has proficiency levels
      if (skill.proficiencyLevels && skill.proficiencyLevels.length > 0) {
        console.log(`Skipping ${skill.name} - already has proficiency levels`);
        skippedCount++;
        continue;
      }
      
      // Add default proficiency levels
      const defaultLevels = getDefaultProficiencyLevels(skill.name, skill.category);
      
      // Update the skill with proficiency levels
      await Skill.findByIdAndUpdate(
        skill._id,
        { 
          $set: { proficiencyLevels: defaultLevels },
          $currentDate: { updatedAt: true }
        }
      );
      
      console.log(`✅ Added proficiency levels to ${skill.name}`);
      updatedCount++;
    }
    
    console.log('\n=== SUMMARY ===');
    console.log(`Total skills processed: ${skills.length}`);
    console.log(`Skills updated: ${updatedCount}`);
    console.log(`Skills skipped (already had levels): ${skippedCount}`);
    console.log('Proficiency levels addition completed successfully!');
    
  } catch (error) {
    console.error('Error adding proficiency levels:', error);
  }
};

// Run the script
const run = async () => {
  await connectDB();
  await addProficiencyLevels();
  await mongoose.disconnect();
  console.log('Database connection closed');
  process.exit(0);
};

run().catch(console.error);
