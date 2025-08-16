const mongoose = require('mongoose');
const Skill = require('../models/Skill');
require('dotenv').config();

// Helper function to generate slug
const generateSlug = (name) => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
};

const skillsData = [
  // ===== FRONTEND DEVELOPMENT =====
  {
    name: 'HTML/CSS',
    description: 'Core web technologies for structuring and styling web pages',
    category: 'frontend',
    subcategory: 'core',
    difficulty: 'Beginner',
    estimatedTimeToLearn: 40,
    xpReward: 100,
    marketDemand: 'very-high',
    averageSalary: 65000,
    jobGrowth: 15,
    tags: ['web', 'markup', 'styling'],
    keywords: ['html', 'css', 'web', 'frontend', 'markup'],
    status: 'active',
    isPublic: true,
    proficiencyLevels: [
      {
        level: 'Beginner',
        title: 'HTML/CSS Fundamentals',
        description: 'Basic understanding of HTML structure and CSS styling',
        expectations: [
          'Create basic HTML documents with proper structure',
          'Use semantic HTML elements (header, nav, main, footer)',
          'Apply basic CSS styling (colors, fonts, spacing)',
          'Create simple layouts using flexbox',
          'Make responsive designs with media queries'
        ],
        projects: [
          'Personal portfolio website',
          'Restaurant menu page',
          'Simple blog layout'
        ],
        timeToAchieve: 40,
        prerequisites: ['Basic computer literacy'],
        resources: [
          {
            type: 'course',
            title: 'HTML & CSS Fundamentals',
            url: 'https://example.com/html-css-basics',
            description: 'Complete beginner course',
            difficulty: 'Beginner',
            estimatedTime: 20,
            isRequired: true
          }
        ]
      },
      {
        level: 'Intermediate',
        title: 'Advanced CSS & Layouts',
        description: 'Master complex layouts and modern CSS techniques',
        expectations: [
          'Create complex layouts using CSS Grid and Flexbox',
          'Implement CSS animations and transitions',
          'Use CSS preprocessors (Sass/SCSS)',
          'Optimize CSS for performance',
          'Create accessible and semantic markup'
        ],
        projects: [
          'E-commerce product grid',
          'Interactive dashboard',
          'Animated landing page'
        ],
        timeToAchieve: 60,
        prerequisites: ['HTML/CSS Fundamentals', 'Basic JavaScript'],
        resources: [
          {
            type: 'course',
            title: 'Advanced CSS Layouts',
            url: 'https://example.com/advanced-css',
            description: 'Grid, Flexbox, and modern techniques',
            difficulty: 'Intermediate',
            estimatedTime: 30,
            isRequired: true
          }
        ]
      },
      {
        level: 'Advanced',
        title: 'CSS Architecture & Performance',
        description: 'Build scalable CSS architectures and optimize performance',
        expectations: [
          'Design and implement CSS architecture (BEM, SMACSS)',
          'Optimize CSS for large applications',
          'Use CSS-in-JS solutions',
          'Implement design systems',
          'Debug complex CSS issues'
        ],
        projects: [
          'Design system implementation',
          'Large-scale website optimization',
          'Component library'
        ],
        timeToAchieve: 80,
        prerequisites: ['Advanced CSS & Layouts', 'JavaScript frameworks'],
        resources: [
          {
            type: 'course',
            title: 'CSS Architecture',
            url: 'https://example.com/css-architecture',
            description: 'Scalable CSS methodologies',
            difficulty: 'Advanced',
            estimatedTime: 40,
            isRequired: true
          }
        ]
      },
      {
        level: 'Expert',
        title: 'CSS Innovation & Leadership',
        description: 'Lead CSS initiatives and innovate in web styling',
        expectations: [
          'Contribute to CSS specifications and standards',
          'Create innovative CSS solutions',
          'Mentor and lead CSS teams',
          'Optimize for extreme performance',
          'Research and implement cutting-edge techniques'
        ],
        projects: [
          'CSS framework development',
          'Performance optimization tools',
          'CSS specification contributions'
        ],
        timeToAchieve: 120,
        prerequisites: ['CSS Architecture & Performance', 'Team leadership'],
        resources: [
          {
            type: 'documentation',
            title: 'CSS Working Group Specs',
            url: 'https://www.w3.org/Style/CSS/',
            description: 'Official CSS specifications',
            difficulty: 'Expert',
            estimatedTime: 60,
            isRequired: true
          }
        ]
      }
    ]
  },
  {
    name: 'JavaScript',
    description: 'Programming language for web development and dynamic content',
    category: 'frontend',
    subcategory: 'programming',
    difficulty: 'Intermediate',
    estimatedTimeToLearn: 80,
    xpReward: 150,
    marketDemand: 'very-high',
    averageSalary: 75000,
    jobGrowth: 20,
    tags: ['programming', 'web', 'dynamic'],
    keywords: ['javascript', 'js', 'ecmascript', 'web', 'frontend'],
    status: 'active',
    isPublic: true,
    proficiencyLevels: [
      {
        level: 'Beginner',
        title: 'JavaScript Fundamentals',
        description: 'Basic JavaScript syntax and programming concepts',
        expectations: [
          'Understand variables, data types, and operators',
          'Write functions and control flow statements',
          'Work with arrays and objects',
          'Handle basic DOM manipulation',
          'Use event listeners and callbacks'
        ],
        projects: [
          'Todo list application',
          'Simple calculator',
          'Interactive form validation'
        ],
        timeToAchieve: 60,
        prerequisites: ['HTML/CSS Fundamentals'],
        resources: [
          {
            type: 'course',
            title: 'JavaScript Basics',
            url: 'https://example.com/js-basics',
            description: 'Complete JavaScript fundamentals',
            difficulty: 'Beginner',
            estimatedTime: 30,
            isRequired: true
          }
        ]
      },
      {
        level: 'Intermediate',
        title: 'Modern JavaScript & ES6+',
        description: 'Advanced JavaScript features and modern development practices',
        expectations: [
          'Use ES6+ features (arrow functions, destructuring, modules)',
          'Understand asynchronous programming (Promises, async/await)',
          'Work with APIs and fetch data',
          'Implement error handling and debugging',
          'Use modern JavaScript tools and bundlers'
        ],
        projects: [
          'Weather app with API integration',
          'Task management system',
          'Real-time chat application'
        ],
        timeToAchieve: 80,
        prerequisites: ['JavaScript Fundamentals'],
        resources: [
          {
            type: 'course',
            title: 'Modern JavaScript',
            url: 'https://example.com/modern-js',
            description: 'ES6+ and modern practices',
            difficulty: 'Intermediate',
            estimatedTime: 40,
            isRequired: true
          }
        ]
      },
      {
        level: 'Advanced',
        title: 'JavaScript Architecture & Patterns',
        description: 'Build scalable JavaScript applications with design patterns',
        expectations: [
          'Implement design patterns (Module, Observer, Factory)',
          'Build modular and maintainable code',
          'Optimize performance and memory usage',
          'Work with testing frameworks',
          'Understand JavaScript engines and optimization'
        ],
        projects: [
          'Single Page Application (SPA)',
          'Plugin architecture system',
          'Performance monitoring tool'
        ],
        timeToAchieve: 100,
        prerequisites: ['Modern JavaScript & ES6+'],
        resources: [
          {
            type: 'course',
            title: 'JavaScript Architecture',
            url: 'https://example.com/js-architecture',
            description: 'Design patterns and best practices',
            difficulty: 'Advanced',
            estimatedTime: 50,
            isRequired: true
          }
        ]
      },
      {
        level: 'Expert',
        title: 'JavaScript Innovation & Leadership',
        description: 'Lead JavaScript initiatives and contribute to the ecosystem',
        expectations: [
          'Contribute to JavaScript libraries and frameworks',
          'Optimize for extreme performance and scale',
          'Mentor and lead JavaScript teams',
          'Research and implement cutting-edge features',
          'Contribute to JavaScript specifications (TC39)'
        ],
        projects: [
          'JavaScript library/framework development',
          'Performance optimization tools',
          'JavaScript specification contributions'
        ],
        timeToAchieve: 150,
        prerequisites: ['JavaScript Architecture & Patterns', 'Team leadership'],
        resources: [
          {
            type: 'documentation',
            title: 'ECMAScript Specifications',
            url: 'https://tc39.es/ecma262/',
            description: 'Official JavaScript specifications',
            difficulty: 'Expert',
            estimatedTime: 80,
            isRequired: true
          }
        ]
      }
    ]
  },
  {
    name: 'React',
    description: 'Popular JavaScript library for building user interfaces',
    category: 'frontend',
    subcategory: 'frameworks',
    difficulty: 'Intermediate',
    estimatedTimeToLearn: 60,
    xpReward: 200,
    marketDemand: 'very-high',
    averageSalary: 85000,
    jobGrowth: 25,
    tags: ['react', 'ui', 'components'],
    keywords: ['react', 'jsx', 'components', 'hooks', 'frontend'],
    status: 'active',
    isPublic: true,
    proficiencyLevels: [
      {
        level: 'Beginner',
        title: 'React Fundamentals',
        description: 'Basic React concepts and component development',
        expectations: [
          'Understand React components and JSX',
          'Create functional and class components',
          'Use props and state management',
          'Handle events and user interactions',
          'Implement basic routing with React Router'
        ],
        projects: [
          'Simple todo app with React',
          'Weather dashboard',
          'Personal portfolio website'
        ],
        timeToAchieve: 60,
        prerequisites: ['JavaScript Fundamentals', 'HTML/CSS Fundamentals'],
        resources: [
          {
            type: 'course',
            title: 'React Basics',
            url: 'https://example.com/react-basics',
            description: 'Complete React fundamentals course',
            difficulty: 'Beginner',
            estimatedTime: 30,
            isRequired: true
          }
        ]
      },
      {
        level: 'Intermediate',
        title: 'Advanced React Patterns',
        description: 'Master React hooks, context, and advanced patterns',
        expectations: [
          'Use React hooks (useState, useEffect, useContext)',
          'Implement custom hooks',
          'Work with React Context for state management',
          'Handle forms and validation',
          'Optimize component performance'
        ],
        projects: [
          'E-commerce product catalog',
          'Real-time chat application',
          'Task management system'
        ],
        timeToAchieve: 80,
        prerequisites: ['React Fundamentals'],
        resources: [
          {
            type: 'course',
            title: 'Advanced React',
            url: 'https://example.com/advanced-react',
            description: 'Hooks, Context, and advanced patterns',
            difficulty: 'Intermediate',
            estimatedTime: 40,
            isRequired: true
          }
        ]
      },
      {
        level: 'Advanced',
        title: 'React Architecture & State Management',
        description: 'Build scalable React applications with advanced state management',
        expectations: [
          'Implement Redux or Zustand for global state',
          'Design component architecture and patterns',
          'Use React Query for server state management',
          'Implement code splitting and lazy loading',
          'Build reusable component libraries'
        ],
        projects: [
          'Large-scale dashboard application',
          'Component library/design system',
          'Micro-frontend architecture'
        ],
        timeToAchieve: 100,
        prerequisites: ['Advanced React Patterns'],
        resources: [
          {
            type: 'course',
            title: 'React Architecture',
            url: 'https://example.com/react-architecture',
            description: 'State management and scalable patterns',
            difficulty: 'Advanced',
            estimatedTime: 50,
            isRequired: true
          }
        ]
      },
      {
        level: 'Expert',
        title: 'React Innovation & Leadership',
        description: 'Lead React initiatives and contribute to the ecosystem',
        expectations: [
          'Contribute to React core or ecosystem libraries',
          'Design and implement React patterns',
          'Mentor and lead React development teams',
          'Optimize for extreme performance and scale',
          'Research and implement cutting-edge React features'
        ],
        projects: [
          'React library/framework development',
          'Performance optimization tools',
          'React specification contributions'
        ],
        timeToAchieve: 120,
        prerequisites: ['React Architecture & State Management', 'Team leadership'],
        resources: [
          {
            type: 'documentation',
            title: 'React Source Code',
            url: 'https://github.com/facebook/react',
            description: 'React source code and documentation',
            difficulty: 'Expert',
            estimatedTime: 60,
            isRequired: true
          }
        ]
      }
    ]
  },
  {
    name: 'Vue.js',
    description: 'Progressive JavaScript framework for building user interfaces',
    category: 'frontend',
    subcategory: 'frameworks',
    difficulty: 'Intermediate',
    estimatedTimeToLearn: 50,
    xpReward: 180,
    marketDemand: 'high',
    averageSalary: 80000,
    jobGrowth: 18,
    tags: ['vue', 'ui', 'progressive'],
    keywords: ['vue', 'vuejs', 'components', 'frontend'],
    status: 'active',
    isPublic: true
  },
  {
    name: 'Angular',
    description: 'Platform for building mobile and desktop web applications',
    category: 'frontend',
    subcategory: 'frameworks',
    difficulty: 'Advanced',
    estimatedTimeToLearn: 100,
    xpReward: 250,
    marketDemand: 'high',
    averageSalary: 90000,
    jobGrowth: 12,
    tags: ['angular', 'typescript', 'enterprise'],
    keywords: ['angular', 'typescript', 'enterprise', 'frontend'],
    status: 'active',
    isPublic: true
  },
  {
    name: 'TypeScript',
    description: 'Typed superset of JavaScript for large-scale applications',
    category: 'frontend',
    subcategory: 'programming',
    difficulty: 'Intermediate',
    estimatedTimeToLearn: 70,
    xpReward: 200,
    marketDemand: 'very-high',
    averageSalary: 85000,
    jobGrowth: 30,
    proficiencyLevels: [
      {
        level: 'Beginner',
        title: 'TypeScript Fundamentals',
        description: 'Basic TypeScript syntax and type system',
        expectations: [
          'Understand TypeScript types and interfaces',
          'Use basic type annotations',
          'Work with functions and parameters',
          'Handle arrays and objects with types',
          'Use TypeScript with React components'
        ],
        projects: [
          'Typed todo application',
          'Simple API client with types',
          'React component library with TypeScript'
        ],
        timeToAchieve: 70,
        prerequisites: ['JavaScript Fundamentals'],
        resources: [
          {
            type: 'course',
            title: 'TypeScript Basics',
            url: 'https://example.com/typescript-basics',
            description: 'Complete TypeScript fundamentals',
            difficulty: 'Beginner',
            estimatedTime: 35,
            isRequired: true
          }
        ]
      },
      {
        level: 'Intermediate',
        title: 'Advanced TypeScript Patterns',
        description: 'Master advanced TypeScript features and patterns',
        expectations: [
          'Use generics and utility types',
          'Implement advanced type patterns',
          'Work with decorators and metadata',
          'Handle complex type scenarios',
          'Optimize TypeScript configuration'
        ],
        projects: [
          'Generic data structures',
          'Type-safe API client',
          'Advanced React patterns with TypeScript'
        ],
        timeToAchieve: 90,
        prerequisites: ['TypeScript Fundamentals'],
        resources: [
          {
            type: 'course',
            title: 'Advanced TypeScript',
            url: 'https://example.com/advanced-typescript',
            description: 'Advanced patterns and features',
            difficulty: 'Intermediate',
            estimatedTime: 45,
            isRequired: true
          }
        ]
      },
      {
        level: 'Advanced',
        title: 'TypeScript Architecture & Tooling',
        description: 'Build scalable TypeScript applications and tools',
        expectations: [
          'Design type-safe architectures',
          'Create custom TypeScript tools',
          'Implement complex type systems',
          'Optimize build and development workflows',
          'Contribute to TypeScript ecosystem'
        ],
        projects: [
          'TypeScript compiler plugin',
          'Custom type definitions library',
          'Type-safe framework development'
        ],
        timeToAchieve: 110,
        prerequisites: ['Advanced TypeScript Patterns'],
        resources: [
          {
            type: 'course',
            title: 'TypeScript Architecture',
            url: 'https://example.com/typescript-architecture',
            description: 'Scalable TypeScript patterns',
            difficulty: 'Advanced',
            estimatedTime: 55,
            isRequired: true
          }
        ]
      },
      {
        level: 'Expert',
        title: 'TypeScript Innovation & Leadership',
        description: 'Lead TypeScript initiatives and contribute to the ecosystem',
        expectations: [
          'Contribute to TypeScript core',
          'Design and implement type systems',
          'Mentor and lead TypeScript teams',
          'Research and implement cutting-edge features',
          'Influence TypeScript language development'
        ],
        projects: [
          'TypeScript language features',
          'Type system research and implementation',
          'TypeScript specification contributions'
        ],
        timeToAchieve: 130,
        prerequisites: ['TypeScript Architecture & Tooling', 'Team leadership'],
        resources: [
          {
            type: 'documentation',
            title: 'TypeScript Source Code',
            url: 'https://github.com/microsoft/TypeScript',
            description: 'TypeScript source code and documentation',
            difficulty: 'Expert',
            estimatedTime: 70,
            isRequired: true
          }
        ]
      }
    ],
    tags: ['typescript', 'typing', 'javascript'],
    keywords: ['typescript', 'ts', 'typing', 'javascript'],
    status: 'active',
    isPublic: true
  },
  {
    name: 'Accessibility',
    description: 'Making web applications usable for people with disabilities',
    category: 'frontend',
    subcategory: 'ux',
    difficulty: 'Intermediate',
    estimatedTimeToLearn: 30,
    xpReward: 120,
    marketDemand: 'high',
    averageSalary: 75000,
    jobGrowth: 20,
    tags: ['a11y', 'accessibility', 'inclusive'],
    keywords: ['accessibility', 'a11y', 'wcag', 'inclusive'],
    status: 'active',
    isPublic: true
  },
  {
    name: 'Testing',
    description: 'Frontend testing methodologies and tools',
    category: 'frontend',
    subcategory: 'testing',
    difficulty: 'Intermediate',
    estimatedTimeToLearn: 40,
    xpReward: 150,
    marketDemand: 'high',
    averageSalary: 80000,
    jobGrowth: 15,
    tags: ['testing', 'quality', 'automation'],
    keywords: ['testing', 'jest', 'cypress', 'frontend'],
    status: 'active',
    isPublic: true
  },
  {
    name: 'Performance',
    description: 'Optimizing frontend applications for speed and efficiency',
    category: 'frontend',
    subcategory: 'optimization',
    difficulty: 'Advanced',
    estimatedTimeToLearn: 50,
    xpReward: 200,
    marketDemand: 'high',
    averageSalary: 90000,
    jobGrowth: 18,
    tags: ['performance', 'optimization', 'speed'],
    keywords: ['performance', 'optimization', 'lighthouse', 'speed'],
    status: 'active',
    isPublic: true
  },
  {
    name: 'Design Systems',
    description: 'Creating and maintaining consistent design patterns',
    category: 'frontend',
    subcategory: 'design',
    difficulty: 'Advanced',
    estimatedTimeToLearn: 60,
    xpReward: 220,
    marketDemand: 'high',
    averageSalary: 95000,
    jobGrowth: 20,
    tags: ['design-systems', 'ui', 'consistency'],
    keywords: ['design-systems', 'storybook', 'components'],
    status: 'active',
    isPublic: true
  },

  // ===== BACKEND DEVELOPMENT =====
  {
    name: 'Node.js',
    description: 'JavaScript runtime for server-side development',
    category: 'backend',
    subcategory: 'javascript',
    difficulty: 'Intermediate',
    estimatedTimeToLearn: 60,
    xpReward: 180,
    marketDemand: 'very-high',
    averageSalary: 85000,
    jobGrowth: 25,
    tags: ['nodejs', 'javascript', 'server'],
    keywords: ['nodejs', 'node', 'javascript', 'backend'],
    status: 'active',
    isPublic: true
  },
  {
    name: 'Python',
    description: 'Versatile programming language for web development and data science',
    category: 'backend',
    subcategory: 'programming',
    difficulty: 'Intermediate',
    estimatedTimeToLearn: 80,
    xpReward: 200,
    marketDemand: 'very-high',
    averageSalary: 90000,
    jobGrowth: 30,
    tags: ['python', 'programming', 'versatile'],
    keywords: ['python', 'django', 'flask', 'backend'],
    status: 'active',
    isPublic: true
  },
  {
    name: 'Java',
    description: 'Object-oriented programming language for enterprise applications',
    category: 'backend',
    subcategory: 'programming',
    difficulty: 'Advanced',
    estimatedTimeToLearn: 120,
    xpReward: 250,
    marketDemand: 'high',
    averageSalary: 95000,
    jobGrowth: 10,
    tags: ['java', 'enterprise', 'oop'],
    keywords: ['java', 'spring', 'enterprise', 'backend'],
    status: 'active',
    isPublic: true
  },
  {
    name: 'C#',
    description: 'Microsoft programming language for .NET applications',
    category: 'backend',
    subcategory: 'programming',
    difficulty: 'Advanced',
    estimatedTimeToLearn: 100,
    xpReward: 220,
    marketDemand: 'high',
    averageSalary: 90000,
    jobGrowth: 12,
    tags: ['csharp', 'dotnet', 'microsoft'],
    keywords: ['c#', 'csharp', 'dotnet', 'aspnet'],
    status: 'active',
    isPublic: true
  },
  {
    name: 'PHP',
    description: 'Server-side scripting language for web development',
    category: 'backend',
    subcategory: 'programming',
    difficulty: 'Intermediate',
    estimatedTimeToLearn: 60,
    xpReward: 150,
    marketDemand: 'medium',
    averageSalary: 70000,
    jobGrowth: 5,
    tags: ['php', 'web', 'wordpress'],
    keywords: ['php', 'laravel', 'wordpress', 'backend'],
    status: 'active',
    isPublic: true
  },
  {
    name: 'Ruby',
    description: 'Dynamic programming language known for Ruby on Rails',
    category: 'backend',
    subcategory: 'programming',
    difficulty: 'Intermediate',
    estimatedTimeToLearn: 70,
    xpReward: 160,
    marketDemand: 'medium',
    averageSalary: 75000,
    jobGrowth: 8,
    tags: ['ruby', 'rails', 'web'],
    keywords: ['ruby', 'rails', 'web', 'backend'],
    status: 'active',
    isPublic: true
  },
  {
    name: 'APIs',
    description: 'Designing and building RESTful and GraphQL APIs',
    category: 'backend',
    subcategory: 'integration',
    difficulty: 'Intermediate',
    estimatedTimeToLearn: 50,
    xpReward: 180,
    marketDemand: 'very-high',
    averageSalary: 85000,
    jobGrowth: 25,
    tags: ['apis', 'rest', 'graphql'],
    keywords: ['apis', 'rest', 'graphql', 'integration'],
    status: 'active',
    isPublic: true
  },
  {
    name: 'Caching',
    description: 'Implementing caching strategies for improved performance',
    category: 'backend',
    subcategory: 'performance',
    difficulty: 'Advanced',
    estimatedTimeToLearn: 40,
    xpReward: 160,
    marketDemand: 'high',
    averageSalary: 85000,
    jobGrowth: 15,
    tags: ['caching', 'performance', 'redis'],
    keywords: ['caching', 'redis', 'memcached', 'performance'],
    status: 'active',
    isPublic: true
  },
  {
    name: 'NoSQL',
    description: 'Working with non-relational databases',
    category: 'backend',
    subcategory: 'database',
    difficulty: 'Intermediate',
    estimatedTimeToLearn: 60,
    xpReward: 180,
    marketDemand: 'high',
    averageSalary: 85000,
    jobGrowth: 20,
    tags: ['nosql', 'mongodb', 'database'],
    keywords: ['nosql', 'mongodb', 'cassandra', 'database'],
    status: 'active',
    isPublic: true
  },
  {
    name: 'Distributed Systems',
    description: 'Building scalable distributed applications',
    category: 'backend',
    subcategory: 'architecture',
    difficulty: 'Expert',
    estimatedTimeToLearn: 120,
    xpReward: 300,
    marketDemand: 'high',
    averageSalary: 120000,
    jobGrowth: 25,
    tags: ['distributed', 'scalability', 'microservices'],
    keywords: ['distributed-systems', 'microservices', 'scalability'],
    status: 'active',
    isPublic: true
  },
  {
    name: 'Security',
    description: 'Implementing security best practices in applications',
    category: 'backend',
    subcategory: 'security',
    difficulty: 'Advanced',
    estimatedTimeToLearn: 80,
    xpReward: 250,
    marketDemand: 'very-high',
    averageSalary: 100000,
    jobGrowth: 30,
    tags: ['security', 'authentication', 'authorization'],
    keywords: ['security', 'oauth', 'jwt', 'authentication'],
    status: 'active',
    isPublic: true
  },
  {
    name: 'Go',
    description: 'Google programming language for efficient system programming',
    category: 'backend',
    subcategory: 'programming',
    difficulty: 'Advanced',
    estimatedTimeToLearn: 90,
    xpReward: 220,
    marketDemand: 'high',
    averageSalary: 95000,
    jobGrowth: 20,
    tags: ['go', 'golang', 'systems'],
    keywords: ['go', 'golang', 'systems', 'backend'],
    status: 'active',
    isPublic: true
  },
  {
    name: 'Observability',
    description: 'Monitoring and debugging distributed systems',
    category: 'backend',
    subcategory: 'monitoring',
    difficulty: 'Advanced',
    estimatedTimeToLearn: 60,
    xpReward: 200,
    marketDemand: 'high',
    averageSalary: 90000,
    jobGrowth: 20,
    tags: ['observability', 'monitoring', 'logging'],
    keywords: ['observability', 'monitoring', 'logging', 'tracing'],
    status: 'active',
    isPublic: true
  },

  // ===== DATA & ANALYTICS =====
  {
    name: 'SQL',
    description: 'Structured Query Language for relational databases',
    category: 'data',
    subcategory: 'database',
    difficulty: 'Intermediate',
    estimatedTimeToLearn: 50,
    xpReward: 150,
    marketDemand: 'very-high',
    averageSalary: 80000,
    jobGrowth: 20,
    tags: ['sql', 'database', 'querying'],
    keywords: ['sql', 'mysql', 'postgresql', 'database'],
    status: 'active',
    isPublic: true
  },
  {
    name: 'R',
    description: 'Programming language for statistical computing and graphics',
    category: 'data',
    subcategory: 'analytics',
    difficulty: 'Intermediate',
    estimatedTimeToLearn: 80,
    xpReward: 180,
    marketDemand: 'high',
    averageSalary: 85000,
    jobGrowth: 15,
    tags: ['r', 'statistics', 'analytics'],
    keywords: ['r', 'statistics', 'analytics', 'data-science'],
    status: 'active',
    isPublic: true
  },
  {
    name: 'Excel',
    description: 'Spreadsheet software for data analysis and visualization',
    category: 'data',
    subcategory: 'analytics',
    difficulty: 'Beginner',
    estimatedTimeToLearn: 30,
    xpReward: 80,
    marketDemand: 'high',
    averageSalary: 60000,
    jobGrowth: 10,
    tags: ['excel', 'spreadsheets', 'analysis'],
    keywords: ['excel', 'spreadsheets', 'analysis', 'data'],
    status: 'active',
    isPublic: true
  },
  {
    name: 'Tableau',
    description: 'Data visualization and business intelligence platform',
    category: 'data',
    subcategory: 'visualization',
    difficulty: 'Intermediate',
    estimatedTimeToLearn: 40,
    xpReward: 150,
    marketDemand: 'high',
    averageSalary: 75000,
    jobGrowth: 18,
    tags: ['tableau', 'visualization', 'bi'],
    keywords: ['tableau', 'visualization', 'bi', 'dashboard'],
    status: 'active',
    isPublic: true
  },
  {
    name: 'Power BI',
    description: 'Microsoft business analytics service for data visualization',
    category: 'data',
    subcategory: 'visualization',
    difficulty: 'Intermediate',
    estimatedTimeToLearn: 45,
    xpReward: 160,
    marketDemand: 'high',
    averageSalary: 75000,
    jobGrowth: 20,
    tags: ['powerbi', 'microsoft', 'bi'],
    keywords: ['power-bi', 'powerbi', 'microsoft', 'bi'],
    status: 'active',
    isPublic: true
  },
  {
    name: 'Data Visualization',
    description: 'Creating effective visual representations of data',
    category: 'data',
    subcategory: 'visualization',
    difficulty: 'Intermediate',
    estimatedTimeToLearn: 50,
    xpReward: 170,
    marketDemand: 'high',
    averageSalary: 80000,
    jobGrowth: 20,
    tags: ['data-viz', 'visualization', 'charts'],
    keywords: ['data-visualization', 'charts', 'graphs', 'd3'],
    status: 'active',
    isPublic: true
  },
  {
    name: 'Statistics',
    description: 'Mathematical foundation for data analysis and inference',
    category: 'data',
    subcategory: 'analytics',
    difficulty: 'Advanced',
    estimatedTimeToLearn: 100,
    xpReward: 200,
    marketDemand: 'high',
    averageSalary: 85000,
    jobGrowth: 15,
    tags: ['statistics', 'math', 'analysis'],
    keywords: ['statistics', 'probability', 'inference', 'math'],
    status: 'active',
    isPublic: true
  },
  {
    name: 'Dashboards',
    description: 'Creating interactive dashboards for data monitoring',
    category: 'data',
    subcategory: 'visualization',
    difficulty: 'Intermediate',
    estimatedTimeToLearn: 40,
    xpReward: 150,
    marketDemand: 'high',
    averageSalary: 75000,
    jobGrowth: 18,
    tags: ['dashboards', 'monitoring', 'kpi'],
    keywords: ['dashboards', 'kpi', 'monitoring', 'metrics'],
    status: 'active',
    isPublic: true
  },
  {
    name: 'Modeling',
    description: 'Building predictive and statistical models',
    category: 'data',
    subcategory: 'analytics',
    difficulty: 'Advanced',
    estimatedTimeToLearn: 120,
    xpReward: 250,
    marketDemand: 'high',
    averageSalary: 95000,
    jobGrowth: 25,
    tags: ['modeling', 'predictive', 'ml'],
    keywords: ['modeling', 'predictive', 'regression', 'ml'],
    status: 'active',
    isPublic: true
  },
  {
    name: 'ML',
    description: 'Machine learning algorithms and applications',
    category: 'data',
    subcategory: 'machine-learning',
    difficulty: 'Advanced',
    estimatedTimeToLearn: 150,
    xpReward: 300,
    marketDemand: 'very-high',
    averageSalary: 110000,
    jobGrowth: 35,
    tags: ['ml', 'machine-learning', 'ai'],
    keywords: ['machine-learning', 'ml', 'ai', 'algorithms'],
    status: 'active',
    isPublic: true
  },
  {
    name: 'Deep Learning',
    description: 'Neural networks and deep learning architectures',
    category: 'data',
    subcategory: 'machine-learning',
    difficulty: 'Expert',
    estimatedTimeToLearn: 200,
    xpReward: 400,
    marketDemand: 'very-high',
    averageSalary: 130000,
    jobGrowth: 40,
    tags: ['deep-learning', 'neural-networks', 'ai'],
    keywords: ['deep-learning', 'neural-networks', 'tensorflow', 'pytorch'],
    status: 'active',
    isPublic: true
  },

  // ===== DESIGN & UX =====
  {
    name: 'Figma',
    description: 'Collaborative interface design tool',
    category: 'design',
    subcategory: 'ui-design',
    difficulty: 'Intermediate',
    estimatedTimeToLearn: 40,
    xpReward: 150,
    marketDemand: 'very-high',
    averageSalary: 75000,
    jobGrowth: 25,
    tags: ['figma', 'design', 'ui'],
    keywords: ['figma', 'design', 'ui', 'prototyping'],
    status: 'active',
    isPublic: true
  },
  {
    name: 'Adobe Creative Suite',
    description: 'Professional design and creative software suite',
    category: 'design',
    subcategory: 'creative',
    difficulty: 'Advanced',
    estimatedTimeToLearn: 100,
    xpReward: 200,
    marketDemand: 'high',
    averageSalary: 80000,
    jobGrowth: 10,
    tags: ['adobe', 'creative', 'design'],
    keywords: ['adobe', 'photoshop', 'illustrator', 'creative'],
    status: 'active',
    isPublic: true
  },
  {
    name: 'Sketch',
    description: 'Digital design tool for UI/UX designers',
    category: 'design',
    subcategory: 'ui-design',
    difficulty: 'Intermediate',
    estimatedTimeToLearn: 35,
    xpReward: 140,
    marketDemand: 'medium',
    averageSalary: 70000,
    jobGrowth: 8,
    tags: ['sketch', 'design', 'ui'],
    keywords: ['sketch', 'design', 'ui', 'mac'],
    status: 'active',
    isPublic: true
  },
  {
    name: 'User Research',
    description: 'Understanding user needs through research methods',
    category: 'design',
    subcategory: 'ux-research',
    difficulty: 'Intermediate',
    estimatedTimeToLearn: 60,
    xpReward: 180,
    marketDemand: 'high',
    averageSalary: 80000,
    jobGrowth: 20,
    tags: ['user-research', 'ux', 'research'],
    keywords: ['user-research', 'ux', 'interviews', 'surveys'],
    status: 'active',
    isPublic: true
  },
  {
    name: 'Prototyping',
    description: 'Creating interactive prototypes for user testing',
    category: 'design',
    subcategory: 'ux-design',
    difficulty: 'Intermediate',
    estimatedTimeToLearn: 50,
    xpReward: 160,
    marketDemand: 'high',
    averageSalary: 75000,
    jobGrowth: 18,
    tags: ['prototyping', 'ux', 'interactive'],
    keywords: ['prototyping', 'ux', 'interactive', 'testing'],
    status: 'active',
    isPublic: true
  },
  {
    name: 'UI Design',
    description: 'Creating user interface designs and layouts',
    category: 'design',
    subcategory: 'ui-design',
    difficulty: 'Intermediate',
    estimatedTimeToLearn: 80,
    xpReward: 200,
    marketDemand: 'very-high',
    averageSalary: 85000,
    jobGrowth: 25,
    tags: ['ui-design', 'interface', 'design'],
    keywords: ['ui-design', 'interface', 'layout', 'design'],
    status: 'active',
    isPublic: true
  },

  // ===== DEVOPS & CLOUD =====
  {
    name: 'Linux',
    description: 'Unix-like operating system administration',
    category: 'devops',
    subcategory: 'systems',
    difficulty: 'Intermediate',
    estimatedTimeToLearn: 60,
    xpReward: 150,
    marketDemand: 'high',
    averageSalary: 80000,
    jobGrowth: 15,
    tags: ['linux', 'unix', 'administration'],
    keywords: ['linux', 'unix', 'administration', 'sysadmin'],
    status: 'active',
    isPublic: true
  },
  {
    name: 'Git',
    description: 'Version control system for tracking code changes',
    category: 'devops',
    subcategory: 'version-control',
    difficulty: 'Beginner',
    estimatedTimeToLearn: 20,
    xpReward: 80,
    marketDemand: 'very-high',
    averageSalary: 70000,
    jobGrowth: 20,
    tags: ['git', 'version-control', 'collaboration'],
    keywords: ['git', 'github', 'version-control', 'collaboration'],
    status: 'active',
    isPublic: true
  },
  {
    name: 'CI/CD',
    description: 'Continuous Integration and Continuous Deployment',
    category: 'devops',
    subcategory: 'automation',
    difficulty: 'Advanced',
    estimatedTimeToLearn: 80,
    xpReward: 200,
    marketDemand: 'very-high',
    averageSalary: 95000,
    jobGrowth: 30,
    tags: ['ci-cd', 'automation', 'deployment'],
    keywords: ['ci-cd', 'jenkins', 'github-actions', 'automation'],
    status: 'active',
    isPublic: true
  },
  {
    name: 'Docker',
    description: 'Containerization platform for application deployment',
    category: 'devops',
    subcategory: 'containers',
    difficulty: 'Intermediate',
    estimatedTimeToLearn: 50,
    xpReward: 180,
    marketDemand: 'very-high',
    averageSalary: 90000,
    jobGrowth: 25,
    tags: ['docker', 'containers', 'deployment'],
    keywords: ['docker', 'containers', 'kubernetes', 'deployment'],
    status: 'active',
    isPublic: true
  },
  {
    name: 'Kubernetes',
    description: 'Container orchestration platform for managing containerized applications',
    category: 'devops',
    subcategory: 'containers',
    difficulty: 'Advanced',
    estimatedTimeToLearn: 100,
    xpReward: 250,
    marketDemand: 'very-high',
    averageSalary: 110000,
    jobGrowth: 35,
    tags: ['kubernetes', 'k8s', 'orchestration'],
    keywords: ['kubernetes', 'k8s', 'orchestration', 'containers'],
    status: 'active',
    isPublic: true
  },
  {
    name: 'Terraform',
    description: 'Infrastructure as Code tool for cloud resource management',
    category: 'devops',
    subcategory: 'iac',
    difficulty: 'Advanced',
    estimatedTimeToLearn: 70,
    xpReward: 200,
    marketDemand: 'high',
    averageSalary: 95000,
    jobGrowth: 25,
    tags: ['terraform', 'iac', 'infrastructure'],
    keywords: ['terraform', 'iac', 'infrastructure-as-code'],
    status: 'active',
    isPublic: true
  },
  {
    name: 'Monitoring',
    description: 'System and application monitoring and alerting',
    category: 'devops',
    subcategory: 'observability',
    difficulty: 'Intermediate',
    estimatedTimeToLearn: 60,
    xpReward: 180,
    marketDemand: 'high',
    averageSalary: 85000,
    jobGrowth: 20,
    tags: ['monitoring', 'alerting', 'observability'],
    keywords: ['monitoring', 'prometheus', 'grafana', 'alerting'],
    status: 'active',
    isPublic: true
  },
  {
    name: 'Networking',
    description: 'Computer networking concepts and protocols',
    category: 'devops',
    subcategory: 'infrastructure',
    difficulty: 'Advanced',
    estimatedTimeToLearn: 90,
    xpReward: 200,
    marketDemand: 'high',
    averageSalary: 90000,
    jobGrowth: 15,
    tags: ['networking', 'protocols', 'infrastructure'],
    keywords: ['networking', 'tcp-ip', 'dns', 'routing'],
    status: 'active',
    isPublic: true
  },
  {
    name: 'Scripting',
    description: 'Automation through shell and programming scripts',
    category: 'devops',
    subcategory: 'automation',
    difficulty: 'Intermediate',
    estimatedTimeToLearn: 40,
    xpReward: 150,
    marketDemand: 'high',
    averageSalary: 80000,
    jobGrowth: 18,
    tags: ['scripting', 'automation', 'bash'],
    keywords: ['scripting', 'bash', 'python', 'automation'],
    status: 'active',
    isPublic: true
  },

  // ===== CYBERSECURITY =====
  {
    name: 'SIEM',
    description: 'Security Information and Event Management systems',
    category: 'cybersecurity',
    subcategory: 'monitoring',
    difficulty: 'Advanced',
    estimatedTimeToLearn: 80,
    xpReward: 250,
    marketDemand: 'high',
    averageSalary: 100000,
    jobGrowth: 25,
    tags: ['siem', 'security', 'monitoring'],
    keywords: ['siem', 'splunk', 'security', 'monitoring'],
    status: 'active',
    isPublic: true
  },
  {
    name: 'Threat Hunting',
    description: 'Proactive security threat detection and analysis',
    category: 'cybersecurity',
    subcategory: 'threat-intelligence',
    difficulty: 'Expert',
    estimatedTimeToLearn: 120,
    xpReward: 300,
    marketDemand: 'high',
    averageSalary: 120000,
    jobGrowth: 30,
    tags: ['threat-hunting', 'security', 'analysis'],
    keywords: ['threat-hunting', 'security', 'analysis', 'forensics'],
    status: 'active',
    isPublic: true
  },
  {
    name: 'Web Security',
    description: 'Securing web applications and preventing vulnerabilities',
    category: 'cybersecurity',
    subcategory: 'application-security',
    difficulty: 'Advanced',
    estimatedTimeToLearn: 70,
    xpReward: 220,
    marketDemand: 'very-high',
    averageSalary: 95000,
    jobGrowth: 25,
    tags: ['web-security', 'owasp', 'vulnerabilities'],
    keywords: ['web-security', 'owasp', 'xss', 'sql-injection'],
    status: 'active',
    isPublic: true
  },

  // ===== MOBILE DEVELOPMENT =====
  {
    name: 'React Native',
    description: 'Cross-platform mobile app development with React',
    category: 'mobile',
    subcategory: 'cross-platform',
    difficulty: 'Intermediate',
    estimatedTimeToLearn: 80,
    xpReward: 200,
    marketDemand: 'high',
    averageSalary: 85000,
    jobGrowth: 20,
    tags: ['react-native', 'mobile', 'cross-platform'],
    keywords: ['react-native', 'mobile', 'cross-platform', 'react'],
    status: 'active',
    isPublic: true
  },
  {
    name: 'Flutter',
    description: 'Google UI toolkit for cross-platform app development',
    category: 'mobile',
    subcategory: 'cross-platform',
    difficulty: 'Intermediate',
    estimatedTimeToLearn: 90,
    xpReward: 220,
    marketDemand: 'high',
    averageSalary: 90000,
    jobGrowth: 25,
    tags: ['flutter', 'dart', 'cross-platform'],
    keywords: ['flutter', 'dart', 'mobile', 'cross-platform'],
    status: 'active',
    isPublic: true
  },
  {
    name: 'iOS',
    description: 'Apple mobile platform development with Swift/Objective-C',
    category: 'mobile',
    subcategory: 'native',
    difficulty: 'Advanced',
    estimatedTimeToLearn: 100,
    xpReward: 250,
    marketDemand: 'high',
    averageSalary: 95000,
    jobGrowth: 15,
    tags: ['ios', 'swift', 'apple'],
    keywords: ['ios', 'swift', 'objective-c', 'apple'],
    status: 'active',
    isPublic: true
  },
  {
    name: 'Android',
    description: 'Google mobile platform development with Kotlin/Java',
    category: 'mobile',
    subcategory: 'native',
    difficulty: 'Advanced',
    estimatedTimeToLearn: 100,
    xpReward: 250,
    marketDemand: 'high',
    averageSalary: 90000,
    jobGrowth: 18,
    tags: ['android', 'kotlin', 'google'],
    keywords: ['android', 'kotlin', 'java', 'google'],
    status: 'active',
    isPublic: true
  },

  // ===== PRODUCT & PROJECT MANAGEMENT =====
  {
    name: 'Communication',
    description: 'Effective communication skills for team collaboration',
    category: 'soft-skills',
    subcategory: 'communication',
    difficulty: 'Beginner',
    estimatedTimeToLearn: 40,
    xpReward: 100,
    marketDemand: 'very-high',
    averageSalary: 70000,
    jobGrowth: 15,
    tags: ['communication', 'soft-skills', 'collaboration'],
    keywords: ['communication', 'presentation', 'writing', 'speaking'],
    status: 'active',
    isPublic: true
  },
  {
    name: 'Analytics',
    description: 'Data-driven decision making and business analytics',
    category: 'product',
    subcategory: 'analytics',
    difficulty: 'Intermediate',
    estimatedTimeToLearn: 60,
    xpReward: 180,
    marketDemand: 'high',
    averageSalary: 85000,
    jobGrowth: 20,
    tags: ['analytics', 'data', 'decision-making'],
    keywords: ['analytics', 'data', 'metrics', 'kpi'],
    status: 'active',
    isPublic: true
  },
  {
    name: 'Agile',
    description: 'Agile project management methodologies',
    category: 'product',
    subcategory: 'methodology',
    difficulty: 'Intermediate',
    estimatedTimeToLearn: 30,
    xpReward: 120,
    marketDemand: 'high',
    averageSalary: 80000,
    jobGrowth: 15,
    tags: ['agile', 'scrum', 'methodology'],
    keywords: ['agile', 'scrum', 'kanban', 'methodology'],
    status: 'active',
    isPublic: true
  },
  {
    name: 'Leadership',
    description: 'Leading teams and driving organizational success',
    category: 'soft-skills',
    subcategory: 'leadership',
    difficulty: 'Advanced',
    estimatedTimeToLearn: 100,
    xpReward: 250,
    marketDemand: 'very-high',
    averageSalary: 100000,
    jobGrowth: 20,
    tags: ['leadership', 'management', 'soft-skills'],
    keywords: ['leadership', 'management', 'team-building', 'strategy'],
    status: 'active',
    isPublic: true
  }
];

const seedSkills = async () => {
  try {
    console.log('🌱 Starting skills seeding...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');
    await Skill.deleteMany({});
    console.log('🗑️  Cleared existing skills');

    // Add slugs to skills data
    const skillsWithSlugs = skillsData.map(skill => ({
      ...skill,
      slug: skill.slug || generateSlug(skill.name)
    }));

    const skills = await Skill.insertMany(skillsWithSlugs);
    console.log(`✅ Successfully seeded ${skills.length} skills`);

    // Log statistics
    const categories = await Skill.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    console.log('\n📊 Skills by Category:');
    categories.forEach(cat => {
      console.log(`  ${cat._id}: ${cat.count} skills`);
    });

    const difficulties = await Skill.aggregate([
      { $group: { _id: '$difficulty', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    console.log('\n📊 Skills by Difficulty:');
    difficulties.forEach(diff => {
      console.log(`  ${diff._id}: ${diff.count} skills`);
    });

    const marketDemand = await Skill.aggregate([
      { $group: { _id: '$marketDemand', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    console.log('\n📊 Skills by Market Demand:');
    marketDemand.forEach(demand => {
      console.log(`  ${demand._id}: ${demand.count} skills`);
    });

  } catch (error) {
    console.error('❌ Error seeding skills:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
};

if (require.main === module) {
  seedSkills();
}

module.exports = { seedSkills };
