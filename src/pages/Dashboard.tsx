import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCareer } from '@/contexts/CareerContext';
import { useToast } from '@/hooks/use-toast';
import ProjectSubmission from '@/components/ProjectSubmission';
import { 
  BookOpen, 
  Trophy, 
  Target, 
  Clock, 
  Star,
  CheckCircle2,
  PlayCircle,
  Award,
  TrendingUp,
  Calendar,
  Zap,
  Video,
  FileText,
  ExternalLink,
  Users
} from 'lucide-react';

interface Course {
  id: string;
  title: string;
  type: 'video' | 'article' | 'quiz' | 'hands-on';
  duration: string;
  completed: boolean;
}

interface LearningModule {
  id: string;
  title: string;
  description: string;
  duration: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  completed: boolean;
  progress: number;
  xpReward: number;
  courses: Course[];
  skillsLearned: string[];
}

interface Project {
  id: string;
  title: string;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  status: 'not-started' | 'in-progress' | 'completed' | 'submitted' | 'approved';
  progress: number;
  estimatedTime: string;
  xpReward: number;
  skills: string[];
  brief?: string;
  requirements?: string[];
  deliverables?: string[];
  submission?: any;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { hasStartedCareer, currentCareer, resetCareer } = useCareer();
  const { toast } = useToast();
  const [totalXp, setTotalXp] = useState(1250);
  const [level, setLevel] = useState(3);
  const [learningModules, setLearningModules] = useState<LearningModule[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    if (!hasStartedCareer) {
      navigate('/');
      return;
    }

    // Initialize learning modules and projects
    setLearningModules([
      {
        id: '1',
        title: 'Python Fundamentals',
        description: 'Master the basics of Python programming',
        duration: '4 hours',
        difficulty: 'Beginner',
        completed: true,
        progress: 100,
        xpReward: 200,
        skillsLearned: ['Variables & Data Types', 'Functions', 'Control Flow', 'Error Handling'],
        courses: [
          { id: '1-1', title: 'Introduction to Python', type: 'video', duration: '30 min', completed: true },
          { id: '1-2', title: 'Variables and Data Types', type: 'hands-on', duration: '45 min', completed: true },
          { id: '1-3', title: 'Functions Deep Dive', type: 'video', duration: '40 min', completed: true },
          { id: '1-4', title: 'Python Basics Quiz', type: 'quiz', duration: '15 min', completed: true }
        ]
      },
      {
        id: '2',
        title: 'Data Analysis with Pandas',
        description: 'Learn to manipulate and analyze data using Pandas',
        duration: '6 hours',
        difficulty: 'Intermediate',
        completed: false,
        progress: 65,
        xpReward: 300,
        skillsLearned: ['DataFrames', 'Data Cleaning', 'Aggregation', 'Visualization'],
        courses: [
          { id: '2-1', title: 'Introduction to Pandas', type: 'video', duration: '35 min', completed: true },
          { id: '2-2', title: 'Working with DataFrames', type: 'hands-on', duration: '50 min', completed: true },
          { id: '2-3', title: 'Data Cleaning Techniques', type: 'article', duration: '25 min', completed: true },
          { id: '2-4', title: 'Advanced Data Manipulation', type: 'hands-on', duration: '60 min', completed: false },
          { id: '2-5', title: 'Pandas Mastery Quiz', type: 'quiz', duration: '20 min', completed: false }
        ]
      },
      {
        id: '3',
        title: 'Machine Learning Basics',
        description: 'Introduction to supervised and unsupervised learning',
        duration: '8 hours',
        difficulty: 'Intermediate',
        completed: false,
        progress: 0,
        xpReward: 400,
        skillsLearned: ['Supervised Learning', 'Model Evaluation', 'Feature Engineering', 'Cross-validation'],
        courses: [
          { id: '3-1', title: 'ML Fundamentals', type: 'video', duration: '45 min', completed: false },
          { id: '3-2', title: 'Scikit-learn Basics', type: 'hands-on', duration: '60 min', completed: false },
          { id: '3-3', title: 'Model Training & Evaluation', type: 'hands-on', duration: '75 min', completed: false },
          { id: '3-4', title: 'Feature Engineering Guide', type: 'article', duration: '30 min', completed: false },
          { id: '3-5', title: 'ML Concepts Quiz', type: 'quiz', duration: '25 min', completed: false }
        ]
      }
    ]);

    setProjects([
      {
        id: '1',
        title: 'Customer Segmentation Analysis',
        description: 'Use clustering algorithms to segment customers based on purchasing behavior',
        difficulty: 'Intermediate',
        status: 'approved',
        progress: 100,
        estimatedTime: '1 week',
        xpReward: 500,
        skills: ['Python', 'Pandas', 'K-means', 'Data Visualization'],
        brief: 'In this project, you will analyze customer data to identify distinct customer segments using unsupervised learning techniques. This is a fundamental skill in marketing analytics and customer relationship management.',
        requirements: [
          'Load and explore the customer dataset',
          'Perform data preprocessing and cleaning',
          'Apply K-means clustering algorithm',
          'Visualize customer segments',
          'Interpret and document findings'
        ],
        deliverables: [
          'Python notebook with complete analysis',
          'Customer segmentation visualizations',
          'Business insights and recommendations',
          'Code documentation and README'
        ]
      },
      {
        id: '2',
        title: 'Sales Prediction Model',
        description: 'Build a machine learning model to predict future sales',
        difficulty: 'Intermediate',
        status: 'in-progress',
        progress: 40,
        estimatedTime: '2 weeks',
        xpReward: 750,
        skills: ['Python', 'Scikit-learn', 'Linear Regression', 'Feature Engineering'],
        brief: 'Develop a predictive model to forecast sales based on historical data and various business factors. This project will teach you the complete machine learning pipeline from data preparation to model deployment.',
        requirements: [
          'Analyze historical sales data',
          'Create relevant features from raw data',
          'Train and validate multiple models',
          'Evaluate model performance',
          'Create predictions for future periods'
        ],
        deliverables: [
          'Complete ML pipeline code',
          'Model performance analysis',
          'Feature importance analysis',
          'Sales predictions with confidence intervals'
        ]
      },
      {
        id: '3',
        title: 'Real-time Data Dashboard',
        description: 'Create an interactive dashboard for real-time data monitoring',
        difficulty: 'Advanced',
        status: 'not-started',
        progress: 0,
        estimatedTime: '3 weeks',
        xpReward: 1000,
        skills: ['Python', 'Streamlit', 'APIs', 'Real-time Processing'],
        brief: 'Build a comprehensive dashboard that displays real-time data from multiple sources. This project combines data engineering, web development, and visualization skills.',
        requirements: [
          'Set up real-time data sources',
          'Design responsive dashboard layout',
          'Implement data refresh mechanisms',
          'Add interactive filtering and controls',
          'Deploy dashboard to cloud platform'
        ],
        deliverables: [
          'Complete dashboard application',
          'Data pipeline documentation',
          'User interface mockups',
          'Deployment guide and live demo'
        ]
      }
    ]);
  }, [hasStartedCareer, navigate]);

  const completedModules = learningModules.filter(m => m.completed).length;
  const completedProjects = projects.filter(p => p.status === 'completed').length;
  const overallProgress = ((completedModules + completedProjects) / (learningModules.length + projects.length)) * 100;

  const updateModuleProgress = (moduleId: string, newProgress: number) => {
    setLearningModules(prev => prev.map(module => 
      module.id === moduleId 
        ? { ...module, progress: newProgress, completed: newProgress === 100 }
        : module
    ));

    if (newProgress === 100) {
      const module = learningModules.find(m => m.id === moduleId);
      if (module && !module.completed) {
        setTotalXp(prev => prev + module.xpReward);
        toast({
          title: "🎉 Module Completed!",
          description: `You earned ${module.xpReward} XP!`,
        });
      }
    }
  };

  const updateProjectStatus = (projectId: string, status: Project['status']) => {
    setProjects(prev => prev.map(project => 
      project.id === projectId 
        ? { ...project, status, progress: status === 'completed' ? 100 : project.progress }
        : project
    ));

    if (status === 'completed') {
      const project = projects.find(p => p.id === projectId);
      if (project && project.status !== 'completed') {
        setTotalXp(prev => prev + project.xpReward);
        toast({
          title: "🚀 Project Completed!",
          description: `You earned ${project.xpReward} XP!`,
        });
      }
    }
  };

  const handleProjectSubmission = (projectId: string, submission: any) => {
    setProjects(prev => prev.map(project => 
      project.id === projectId 
        ? { ...project, status: 'submitted', submission, progress: 100 }
        : project
    ));

    toast({
      title: "🎯 Project Submitted!",
      description: "Your project has been sent to mentors for review.",
    });
  };

  const completeCourse = (moduleId: string, courseId: string) => {
    setLearningModules(prev => prev.map(module => {
      if (module.id === moduleId) {
        const updatedCourses = module.courses.map(course => 
          course.id === courseId ? { ...course, completed: true } : course
        );
        const completedCount = updatedCourses.filter(c => c.completed).length;
        const newProgress = Math.round((completedCount / updatedCourses.length) * 100);
        
        return {
          ...module,
          courses: updatedCourses,
          progress: newProgress,
          completed: newProgress === 100
        };
      }
      return module;
    }));

    toast({
      title: "📚 Course Completed!",
      description: "Great job! Keep up the momentum.",
    });
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'secondary';
      case 'Intermediate': return 'default';
      case 'Advanced': return 'destructive';
      default: return 'outline';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600';
      case 'approved': return 'text-green-600';
      case 'submitted': return 'text-blue-600';
      case 'in-progress': return 'text-yellow-600';
      case 'not-started': return 'text-muted-foreground';
      default: return 'text-muted-foreground';
    }
  };

  const getCourseIcon = (type: string) => {
    switch (type) {
      case 'video': return Video;
      case 'article': return FileText;
      case 'quiz': return Target;
      case 'hands-on': return PlayCircle;
      default: return BookOpen;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-muted/10">
      <Header />
      
      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="mb-8">
            <div className="bg-card/80 backdrop-blur-sm rounded-3xl shadow-xl border border-border/50 p-8">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
                    Your Learning Dashboard
                  </h1>
                  <p className="text-muted-foreground">
                    Track your progress on your {currentCareer} journey
                  </p>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-muted/30 rounded-xl p-4 text-center">
                    <Trophy className="w-6 h-6 text-primary mx-auto mb-2" />
                    <div className="text-xl font-bold text-foreground">{totalXp}</div>
                    <div className="text-xs text-muted-foreground">Total XP</div>
                  </div>
                  <div className="bg-muted/30 rounded-xl p-4 text-center">
                    <Award className="w-6 h-6 text-secondary mx-auto mb-2" />
                    <div className="text-xl font-bold text-foreground">Level {level}</div>
                    <div className="text-xs text-muted-foreground">Current Level</div>
                  </div>
                  <div className="bg-muted/30 rounded-xl p-4 text-center">
                    <BookOpen className="w-6 h-6 text-accent mx-auto mb-2" />
                    <div className="text-xl font-bold text-foreground">{completedModules}/{learningModules.length}</div>
                    <div className="text-xs text-muted-foreground">Modules</div>
                  </div>
                  <div className="bg-muted/30 rounded-xl p-4 text-center">
                    <Target className="w-6 h-6 text-green-600 mx-auto mb-2" />
                    <div className="text-xl font-bold text-foreground">{completedProjects}/{projects.length}</div>
                    <div className="text-xs text-muted-foreground">Projects</div>
                  </div>
                </div>
              </div>

              {/* Overall Progress */}
              <div className="mt-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-foreground">Overall Progress</span>
                  <span className="text-sm text-muted-foreground">{Math.round(overallProgress)}%</span>
                </div>
                <Progress value={overallProgress} className="h-3" />
              </div>
            </div>
          </div>

          {/* Content Tabs */}
          <Tabs defaultValue="learning" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="learning">Skill Development</TabsTrigger>
              <TabsTrigger value="projects">Projects</TabsTrigger>
              <TabsTrigger value="resources">Learning Resources</TabsTrigger>
            </TabsList>

            {/* Learning Modules Tab */}
            <TabsContent value="learning">
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-foreground mb-4">Skill Development</h2>
                {learningModules.map((module) => (
                  <Card key={module.id} className="bg-card/80 backdrop-blur-sm border border-border/50">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg text-foreground flex items-center gap-2">
                            {module.completed ? (
                              <CheckCircle2 className="w-5 h-5 text-green-600" />
                            ) : (
                              <PlayCircle className="w-5 h-5 text-primary" />
                            )}
                            {module.title}
                          </CardTitle>
                          <p className="text-muted-foreground mt-1">{module.description}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={getDifficultyColor(module.difficulty)}>
                            {module.difficulty}
                          </Badge>
                          <Badge variant="outline">
                            <Zap className="w-3 h-3 mr-1" />
                            {module.xpReward} XP
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {module.duration}
                        </span>
                        <span className="text-sm text-muted-foreground">{module.progress}%</span>
                      </div>
                      <Progress value={module.progress} className="h-3 mb-4" />

                      {/* Skills Learned */}
                      <div className="mb-4">
                        <h4 className="text-sm font-medium mb-2">Skills You'll Master</h4>
                        <div className="flex flex-wrap gap-1">
                          {module.skillsLearned.map((skill, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Course List */}
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium">Courses</h4>
                        <div className="space-y-2">
                          {module.courses.map((course) => {
                            const CourseIcon = getCourseIcon(course.type);
                            return (
                              <div 
                                key={course.id} 
                                className="flex items-center justify-between p-3 bg-muted/20 rounded-lg"
                              >
                                <div className="flex items-center gap-3">
                                  <CourseIcon className={`w-4 h-4 ${course.completed ? 'text-green-600' : 'text-primary'}`} />
                                  <div>
                                    <div className={`text-sm font-medium ${course.completed ? 'line-through text-muted-foreground' : ''}`}>
                                      {course.title}
                                    </div>
                                    <div className="text-xs text-muted-foreground flex items-center gap-2">
                                      <span>{course.duration}</span>
                                      <Badge variant="outline" className="text-xs capitalize">
                                        {course.type}
                                      </Badge>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  {course.completed ? (
                                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                                  ) : (
                                    <Button 
                                      size="sm" 
                                      variant="outline"
                                      onClick={() => completeCourse(module.id, course.id)}
                                    >
                                      Start
                                    </Button>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {!module.completed && (
                        <div className="flex gap-2 pt-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => updateModuleProgress(module.id, Math.min(100, module.progress + 25))}
                          >
                            Continue Learning
                          </Button>
                          <Button variant="ghost" size="sm">
                            <ExternalLink className="w-4 h-4 mr-1" />
                            View All Courses
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Projects Tab */}
            <TabsContent value="projects">
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-foreground mb-4">Practice Projects</h2>
                {projects.map((project) => (
                  <Card key={project.id} className="bg-card/80 backdrop-blur-sm border border-border/50">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg text-foreground">{project.title}</CardTitle>
                          <p className="text-muted-foreground mt-1">{project.description}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={getDifficultyColor(project.difficulty)}>
                            {project.difficulty}
                          </Badge>
                          <Badge variant="outline">
                            <Star className="w-3 h-3 mr-1" />
                            {project.xpReward} XP
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {project.estimatedTime}
                        </span>
                        <span className={`text-sm font-medium ${getStatusColor(project.status)}`}>
                          {project.status.replace('-', ' ').toUpperCase()}
                        </span>
                      </div>
                      
                      {project.status !== 'not-started' && (
                        <>
                          <Progress value={project.progress} className="h-2 mb-3" />
                          <div className="text-sm text-muted-foreground mb-3">{project.progress}% Complete</div>
                        </>
                      )}
                      
                      <div className="flex flex-wrap gap-1 mb-4">
                        {project.skills.map((skill, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>

                      <div className="flex gap-2">
                        <ProjectSubmission 
                          project={project} 
                          onSubmit={handleProjectSubmission}
                        />
                        {project.status === 'not-started' && (
                          <Button 
                            size="sm"
                            onClick={() => updateProjectStatus(project.id, 'in-progress')}
                          >
                            Start Project
                          </Button>
                        )}
                        {project.status === 'in-progress' && (
                          <Button 
                            size="sm"
                            variant="outline"
                            onClick={() => updateProjectStatus(project.id, 'completed')}
                          >
                            Mark Complete
                          </Button>
                        )}
                        {project.status === 'completed' && (
                          <Badge variant="default" className="bg-green-600">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Completed
                          </Badge>
                        )}
                        {project.status === 'submitted' && (
                          <Badge variant="default" className="bg-blue-600">
                            <Clock className="w-3 h-3 mr-1" />
                            Under Review
                          </Badge>
                        )}
                        {project.status === 'approved' && (
                          <Badge variant="default" className="bg-green-600">
                            <Award className="w-3 h-3 mr-1" />
                            Approved
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Resources Tab */}
            <TabsContent value="resources">
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="bg-card/80 backdrop-blur-sm border border-border/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="w-5 h-5" />
                      Recommended Books
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="p-3 bg-muted/20 rounded-lg">
                      <div className="font-medium">Python for Data Analysis</div>
                      <div className="text-sm text-muted-foreground">by Wes McKinney</div>
                    </div>
                    <div className="p-3 bg-muted/20 rounded-lg">
                      <div className="font-medium">Hands-On Machine Learning</div>
                      <div className="text-sm text-muted-foreground">by Aurélien Géron</div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-card/80 backdrop-blur-sm border border-border/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5" />
                      Industry Tools
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="p-3 bg-muted/20 rounded-lg">
                      <div className="font-medium">Jupyter Notebooks</div>
                      <div className="text-sm text-muted-foreground">Interactive development environment</div>
                    </div>
                    <div className="p-3 bg-muted/20 rounded-lg">
                      <div className="font-medium">Docker</div>
                      <div className="text-sm text-muted-foreground">Containerization platform</div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>

          {/* Reset Career Button */}
          <div className="mt-8 text-center">
            <Button 
              variant="outline" 
              onClick={() => {
                resetCareer();
                navigate('/');
                toast({
                  title: "Career Reset",
                  description: "You can now choose a different career path.",
                });
              }}
            >
              Choose Different Career
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Dashboard;