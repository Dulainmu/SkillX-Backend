import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, Briefcase, TrendingUp, DollarSign, Clock, ArrowRight, Rocket } from 'lucide-react';
import { CareerRecommendation } from '@/types/recommendations';

// Sample career data - converted to CareerRecommendation format
const careers: CareerRecommendation[] = [
  {
    id: "data-scientist",
    name: "Data Scientist",
    description: "Analyze large datasets to extract insights and build predictive models using statistical methods and machine learning algorithms",
    matchPercentage: 95,
    averageSalary: "$90,000 - $150,000",
    jobGrowth: "22%",
    difficulty: "Advanced",
    skills: ["Python", "Statistics", "Machine Learning", "SQL", "Data Visualization", "R"],
    roadmap: [
      "Learn Python programming fundamentals",
      "Master statistics and probability",
      "Understand machine learning algorithms",
      "Practice with real datasets",
      "Build portfolio projects"
    ],
    totalXp: 3000
  },
  {
    id: "ux-designer",
    name: "UX Designer", 
    description: "Design user-friendly interfaces and improve user experience through research, testing, and iterative design",
    matchPercentage: 88,
    averageSalary: "$75,000 - $120,000",
    jobGrowth: "13%",
    difficulty: "Intermediate",
    skills: ["Figma", "User Research", "Prototyping", "Design Thinking", "Wireframing", "Usability Testing"],
    roadmap: [
      "Learn design fundamentals",
      "Master design tools like Figma",
      "Understand user research methods",
      "Practice prototyping",
      "Build a design portfolio"
    ],
    totalXp: 2200
  },
  {
    id: "software-engineer",
    name: "Software Engineer",
    description: "Develop and maintain software applications and systems using various programming languages and frameworks",
    matchPercentage: 92,
    averageSalary: "$85,000 - $160,000", 
    jobGrowth: "25%",
    difficulty: "Intermediate",
    skills: ["JavaScript", "React", "Node.js", "Git", "Database Design", "Testing"],
    roadmap: [
      "Master programming fundamentals",
      "Learn web development technologies",
      "Understand database design",
      "Practice with version control",
      "Build full-stack applications"
    ],
    totalXp: 2800
  },
  {
    id: "digital-marketing",
    name: "Digital Marketing Manager",
    description: "Plan and execute digital marketing campaigns across various channels to drive brand awareness and sales",
    matchPercentage: 85,
    averageSalary: "$60,000 - $100,000",
    jobGrowth: "19%", 
    difficulty: "Beginner-Friendly",
    skills: ["SEO", "Google Analytics", "Content Marketing", "Social Media", "PPC", "Email Marketing"],
    roadmap: [
      "Learn digital marketing fundamentals",
      "Master SEO and content creation",
      "Understand analytics and metrics",
      "Practice campaign management",
      "Build marketing portfolio"
    ],
    totalXp: 1800
  },
  {
    id: "cybersecurity-analyst",
    name: "Cybersecurity Analyst",
    description: "Protect organizations from cyber threats and security breaches through monitoring, analysis, and incident response",
    matchPercentage: 90,
    averageSalary: "$80,000 - $130,000",
    jobGrowth: "28%",
    difficulty: "Advanced", 
    skills: ["Network Security", "Risk Assessment", "Incident Response", "Compliance", "Penetration Testing", "SIEM"],
    roadmap: [
      "Learn networking fundamentals",
      "Understand security principles",
      "Master security tools and techniques",
      "Practice incident response",
      "Obtain security certifications"
    ],
    totalXp: 3200
  },
  {
    id: "product-manager",
    name: "Product Manager",
    description: "Guide product development from conception to launch, working with cross-functional teams to deliver successful products",
    matchPercentage: 87,
    averageSalary: "$95,000 - $170,000",
    jobGrowth: "15%",
    difficulty: "Advanced",
    skills: ["Strategy", "Analytics", "Communication", "Agile", "Market Research", "Product Design"],
    roadmap: [
      "Learn product management fundamentals",
      "Understand market research and analytics",
      "Master agile methodologies",
      "Practice stakeholder management",
      "Build product case studies"
    ],
    totalXp: 2600
  }
];

const BrowseCareers = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('');

  const industries = ["All", "Technology", "Design", "Marketing", "Business", "Healthcare", "Finance"];

  const filteredCareers = careers.filter(career => {
    const matchesSearch = career.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         career.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         career.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Map career types to industries for filtering
    const getIndustry = (name: string) => {
      if (name.includes('Engineer') || name.includes('Data') || name.includes('Cybersecurity')) return 'Technology';
      if (name.includes('Designer')) return 'Design';
      if (name.includes('Marketing')) return 'Marketing';
      if (name.includes('Manager')) return 'Business';
      return 'Technology';
    };
    
    const matchesIndustry = selectedIndustry === '' || selectedIndustry === 'All' || getIndustry(career.name) === selectedIndustry;
    return matchesSearch && matchesIndustry;
  });

  const handleStartCareerPath = (career: CareerRecommendation) => {
    navigate(`/career/${career.id}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-muted/10">
      <Header />
      
      <main className="flex-1 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-96 h-96 bg-secondary/3 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/3 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-accent/3 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-4000"></div>
        </div>

        <div className="relative z-10 py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            {/* Enhanced Header Section */}
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 bg-secondary/10 text-secondary px-4 py-2 rounded-full text-sm font-medium mb-8">
                <Search className="w-4 h-4" />
                Career Explorer
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-secondary via-secondary to-primary bg-clip-text text-transparent mb-8">
                Explore Career Paths
              </h1>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                Browse our comprehensive database of careers. Find detailed information about 
                <span className="text-foreground font-medium"> roles, skills required, and growth opportunities</span>
              </p>
            </div>

            {/* Enhanced Search and Filter Section */}
            <div className="mb-12">
              <div className="bg-card/80 backdrop-blur-sm rounded-3xl shadow-xl border border-border/50 p-8">
                <div className="flex flex-col lg:flex-row gap-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      placeholder="Search careers, skills, or keywords..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-12 h-14 text-lg bg-background/50 border-2 hover:border-primary/50 focus:border-primary transition-all duration-300"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <Filter className="h-5 w-5 text-muted-foreground" />
                    <select
                      value={selectedIndustry}
                      onChange={(e) => setSelectedIndustry(e.target.value)}
                      className="h-14 px-4 rounded-xl border-2 border-border bg-background/50 text-foreground hover:border-primary/50 focus:border-primary focus:outline-none transition-all duration-300 min-w-[180px]"
                    >
                      {industries.map(industry => (
                        <option key={industry} value={industry}>
                          {industry} Industry
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Results Count */}
                <div className="mt-6 pt-6 border-t border-border/50">
                  <p className="text-muted-foreground text-center">
                    <span className="font-semibold text-foreground">{filteredCareers.length}</span> career{filteredCareers.length !== 1 ? 's' : ''} found
                    {searchTerm && <span> for "<span className="text-primary font-medium">{searchTerm}</span>"</span>}
                    {selectedIndustry && selectedIndustry !== 'All' && <span> in <span className="text-secondary font-medium">{selectedIndustry}</span></span>}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {filteredCareers.map((career, index) => (
                <Card 
                  key={career.id} 
                  className="group hover:shadow-2xl transition-all duration-500 border-2 hover:border-secondary/50 hover:-translate-y-2 bg-card/80 backdrop-blur-sm relative overflow-hidden"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Decorative Elements */}
                  <div className="absolute -top-2 -right-2 w-16 h-16 bg-gradient-to-br from-secondary/20 to-primary/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  <CardHeader className="relative z-10">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <CardTitle className="text-xl group-hover:text-secondary transition-colors duration-300">
                            {career.name}
                          </CardTitle>
                          <Badge variant="secondary" className="bg-secondary/10 text-secondary border-secondary/20">
                            {career.matchPercentage}% Match
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 mb-3">
                          <Badge variant="outline" className={`text-xs ${
                            career.difficulty === 'Beginner-Friendly' ? 'border-green-500/30 text-green-600 bg-green-50/50' :
                            career.difficulty === 'Intermediate' ? 'border-yellow-500/30 text-yellow-600 bg-yellow-50/50' :
                            'border-red-500/30 text-red-600 bg-red-50/50'
                          }`}>
                            {career.difficulty}
                          </Badge>
                          {career.totalXp && (
                            <Badge variant="outline" className="text-xs border-primary/20 text-primary bg-primary/5">
                              {career.totalXp} XP
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="w-12 h-12 bg-gradient-to-r from-secondary/10 to-primary/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 border border-secondary/20">
                        <Rocket className="h-6 w-6 text-secondary" />
                      </div>
                    </div>
                    <CardDescription className="text-sm leading-relaxed">
                      {career.description}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="space-y-6 relative z-10">
                    {/* Enhanced Key Metrics */}
                    <div className="grid grid-cols-1 gap-4">
                      <div className="flex items-center text-sm bg-muted/50 p-3 rounded-lg">
                        <DollarSign className="h-5 w-5 mr-3 text-success" />
                        <span className="font-semibold">{career.averageSalary}</span>
                      </div>
                      <div className="flex items-center text-sm bg-muted/50 p-3 rounded-lg">
                        <TrendingUp className="h-5 w-5 mr-3 text-success" />
                        <span className="font-medium">{career.jobGrowth} growth rate</span>
                      </div>
                    </div>

                    {/* Enhanced Skills */}
                    <div>
                      <h4 className="font-semibold text-sm mb-3 text-foreground">Key Skills:</h4>
                      <div className="flex flex-wrap gap-2">
                        {career.skills.slice(0, 3).map((skill) => (
                          <Badge key={skill} variant="outline" className="text-xs border-primary/20 hover:bg-primary/10 transition-colors duration-200">
                            {skill}
                          </Badge>
                        ))}
                        {career.skills.length > 3 && (
                          <Badge variant="outline" className="text-xs border-muted-foreground/20">
                            +{career.skills.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Roadmap Preview */}
                    <div>
                      <h4 className="font-semibold text-sm mb-3 text-foreground">Learning Path:</h4>
                      <ul className="text-xs text-muted-foreground space-y-1">
                        {career.roadmap.slice(0, 2).map((step, stepIndex) => (
                          <li key={stepIndex} className="flex items-center">
                            <div className="w-1.5 h-1.5 bg-primary rounded-full mr-2 flex-shrink-0"></div>
                            {step}
                          </li>
                        ))}
                        {career.roadmap.length > 2 && (
                          <li className="text-primary font-medium">
                            + {career.roadmap.length - 2} more steps...
                          </li>
                        )}
                      </ul>
                    </div>

                    {/* Enhanced Action Button */}
                    <Button 
                      className="w-full h-12 mt-6 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 group-hover:scale-105 transition-all duration-300 shadow-lg" 
                      onClick={() => handleStartCareerPath(career)}
                    >
                      <ArrowRight className="w-4 h-4 mr-2" />
                      Start Career Path
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Enhanced Empty State */}
            {filteredCareers.length === 0 && (
              <div className="text-center py-20">
                <div className="bg-card/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-border/50 p-12 max-w-md mx-auto">
                  <div className="w-20 h-20 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Search className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-4">No careers found</h3>
                  <p className="text-muted-foreground mb-8">
                    Try adjusting your search terms or filters to find more careers.
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedIndustry('All');
                    }}
                    className="w-full h-12 hover:scale-105 transition-transform duration-200"
                  >
                    Clear Filters
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default BrowseCareers;