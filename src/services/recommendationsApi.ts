import { CareerRecommendation } from '@/types/recommendations';

// Mock API service - replace with real API calls when backend is ready
export const recommendationsApi = {
  async getRecommendations(): Promise<CareerRecommendation[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock recommendations - in real app this would come from your backend
    return [
      {
        id: 'data-scientist',
        name: 'Data Scientist',
        description: 'Analyze large datasets to extract insights and build predictive models using statistical methods and machine learning algorithms',
        matchPercentage: 95,
        averageSalary: '$90,000 - $150,000',
        jobGrowth: '22%',
        difficulty: 'Advanced',
        skills: ['Python', 'Statistics', 'Machine Learning', 'SQL', 'Data Visualization', 'R'],
        roadmap: [
          'Learn Python programming fundamentals',
          'Master statistics and probability',
          'Understand machine learning algorithms',
          'Practice with real datasets',
          'Build portfolio projects'
        ],
        totalXp: 3000
      },
      {
        id: 'ux-designer',
        name: 'UX Designer',
        description: 'Design user-friendly interfaces and improve user experience through research, testing, and iterative design',
        matchPercentage: 88,
        averageSalary: '$75,000 - $120,000',
        jobGrowth: '13%',
        difficulty: 'Intermediate',
        skills: ['Figma', 'User Research', 'Prototyping', 'Design Thinking', 'Wireframing', 'Usability Testing'],
        roadmap: [
          'Learn design fundamentals',
          'Master design tools like Figma',
          'Understand user research methods',
          'Practice prototyping',
          'Build a design portfolio'
        ],
        totalXp: 2200
      },
      {
        id: 'software-engineer',
        name: 'Software Engineer',
        description: 'Develop and maintain software applications and systems using various programming languages and frameworks',
        matchPercentage: 92,
        averageSalary: '$85,000 - $160,000',
        jobGrowth: '25%',
        difficulty: 'Intermediate',
        skills: ['JavaScript', 'React', 'Node.js', 'Git', 'Database Design', 'Testing'],
        roadmap: [
          'Master programming fundamentals',
          'Learn web development technologies',
          'Understand database design',
          'Practice with version control',
          'Build full-stack applications'
        ],
        totalXp: 2800
      },
      {
        id: 'digital-marketing',
        name: 'Digital Marketing Manager',
        description: 'Plan and execute digital marketing campaigns across various channels to drive brand awareness and sales',
        matchPercentage: 85,
        averageSalary: '$60,000 - $100,000',
        jobGrowth: '19%',
        difficulty: 'Beginner-Friendly',
        skills: ['SEO', 'Google Analytics', 'Content Marketing', 'Social Media', 'PPC', 'Email Marketing'],
        roadmap: [
          'Learn digital marketing fundamentals',
          'Master SEO and content creation',
          'Understand analytics and metrics',
          'Practice campaign management',
          'Build marketing portfolio'
        ],
        totalXp: 1800
      },
      {
        id: 'cybersecurity-analyst',
        name: 'Cybersecurity Analyst',
        description: 'Protect organizations from cyber threats and security breaches through monitoring, analysis, and incident response',
        matchPercentage: 90,
        averageSalary: '$80,000 - $130,000',
        jobGrowth: '28%',
        difficulty: 'Advanced',
        skills: ['Network Security', 'Risk Assessment', 'Incident Response', 'Compliance', 'Penetration Testing', 'SIEM'],
        roadmap: [
          'Learn networking fundamentals',
          'Understand security principles',
          'Master security tools and techniques',
          'Practice incident response',
          'Obtain security certifications'
        ],
        totalXp: 3200
      },
      {
        id: 'product-manager',
        name: 'Product Manager',
        description: 'Guide product development from conception to launch, working with cross-functional teams to deliver successful products',
        matchPercentage: 87,
        averageSalary: '$95,000 - $170,000',
        jobGrowth: '15%',
        difficulty: 'Advanced',
        skills: ['Strategy', 'Analytics', 'Communication', 'Agile', 'Market Research', 'Product Design'],
        roadmap: [
          'Learn product management fundamentals',
          'Understand market research and analytics',
          'Master agile methodologies',
          'Practice stakeholder management',
          'Build product case studies'
        ],
        totalXp: 2600
      }
    ];
  }
};