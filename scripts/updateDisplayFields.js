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

async function updateDisplayFields() {
  try {
    await connectToMongoDB();
    const CareerRole = require('../src/models/CareerRole');

    // Default display skills and tasks for each career
    const careerDefaults = {
      'Frontend Developer': {
        displaySkills: [
          'HTML & CSS',
          'JavaScript',
          'React/Vue/Angular',
          'Responsive Design',
          'UI/UX Principles',
          'Performance Optimization'
        ],
        displayTasks: [
          'Build responsive web interfaces',
          'Create interactive user experiences',
          'Optimize website performance',
          'Ensure cross-browser compatibility'
        ]
      },
      'Backend Developer': {
        displaySkills: [
          'Node.js/Python/Java',
          'Database Design',
          'API Development',
          'Server Architecture',
          'Security Best Practices',
          'Cloud Services'
        ],
        displayTasks: [
          'Develop server-side applications',
          'Design and manage databases',
          'Build RESTful APIs',
          'Implement security measures'
        ]
      },
      'Full Stack Developer': {
        displaySkills: [
          'JavaScript/TypeScript',
          'React & Node.js',
          'Database Management',
          'API Integration',
          'Deployment & DevOps',
          'Full Stack Architecture'
        ],
        displayTasks: [
          'Build complete web applications',
          'Work on both frontend and backend',
          'Deploy applications to production',
          'Manage the entire development stack'
        ]
      },
      'UX Designer': {
        displaySkills: [
          'User Research',
          'Wireframing & Prototyping',
          'UI Design Tools',
          'User Testing',
          'Design Systems',
          'Interaction Design'
        ],
        displayTasks: [
          'Conduct user research and testing',
          'Create wireframes and prototypes',
          'Design user interfaces',
          'Improve user experience flows'
        ]
      },
      'Data Scientist': {
        displaySkills: [
          'Python/R Programming',
          'Machine Learning',
          'Statistical Analysis',
          'Data Visualization',
          'Big Data Technologies',
          'Predictive Modeling'
        ],
        displayTasks: [
          'Analyze large datasets',
          'Build machine learning models',
          'Create data visualizations',
          'Make data-driven decisions'
        ]
      },
      'DevOps Engineer': {
        displaySkills: [
          'CI/CD Pipelines',
          'Cloud Platforms',
          'Containerization',
          'Infrastructure as Code',
          'Monitoring & Logging',
          'Security & Compliance'
        ],
        displayTasks: [
          'Automate deployment processes',
          'Manage cloud infrastructure',
          'Monitor system performance',
          'Ensure continuous integration'
        ]
      },
      'Mobile Developer': {
        displaySkills: [
          'iOS/Android Development',
          'Mobile UI/UX',
          'App Store Optimization',
          'Performance Tuning',
          'Cross-platform Development',
          'Mobile Security'
        ],
        displayTasks: [
          'Build native mobile apps',
          'Optimize app performance',
          'Handle app store submissions',
          'Implement mobile-specific features'
        ]
      },
      'Cybersecurity Analyst': {
        displaySkills: [
          'Security Assessment',
          'Threat Detection',
          'Incident Response',
          'Network Security',
          'Compliance & Auditing',
          'Security Tools & Technologies'
        ],
        displayTasks: [
          'Protect systems from threats',
          'Conduct security assessments',
          'Monitor network activity',
          'Respond to security incidents'
        ]
      }
    };

    console.log('🔄 Updating career roles with display skills and tasks...');

    let updatedCount = 0;
    let skippedCount = 0;

    for (const [careerName, defaults] of Object.entries(careerDefaults)) {
      try {
        const career = await CareerRole.findOne({ name: careerName });
        
        if (career) {
          // Check if display fields already exist and have content
          const hasDisplaySkills = career.displaySkills && career.displaySkills.length > 0;
          const hasDisplayTasks = career.displayTasks && career.displayTasks.length > 0;

          if (!hasDisplaySkills || !hasDisplayTasks) {
            const updateData = {};
            
            if (!hasDisplaySkills) {
              updateData.displaySkills = defaults.displaySkills;
            }
            
            if (!hasDisplayTasks) {
              updateData.displayTasks = defaults.displayTasks;
            }

            await CareerRole.findByIdAndUpdate(career._id, updateData);
            console.log(`✅ Updated ${careerName}`);
            updatedCount++;
          } else {
            console.log(`⏭️  Skipped ${careerName} (already has display fields)`);
            skippedCount++;
          }
        } else {
          console.log(`⚠️  Career not found: ${careerName}`);
        }
      } catch (error) {
        console.error(`❌ Error updating ${careerName}:`, error.message);
      }
    }

    console.log('\n📊 Update Summary:');
    console.log(`✅ Updated: ${updatedCount} career roles`);
    console.log(`⏭️  Skipped: ${skippedCount} career roles (already had display fields)`);
    console.log(`📝 Total processed: ${Object.keys(careerDefaults).length} career types`);

    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

updateDisplayFields();
