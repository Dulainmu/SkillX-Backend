import { useState } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  Trophy,
  Star,
  Target,
  BookOpen,
  Settings,
  Edit3,
  Save,
  X,
  Medal,
  Zap,
  Award
} from 'lucide-react';

const Profile = () => {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [userInfo, setUserInfo] = useState({
    name: 'Alex Johnson',
    email: 'alex.johnson@example.com',
    phone: '+1 (555) 123-4567',
    location: 'San Francisco, CA',
    joinDate: 'January 2024',
    bio: 'Passionate about technology and career development. Currently exploring UX Design and Software Engineering paths.'
  });

  // Mock user progress data
  const userStats = {
    totalXp: 1450,
    level: 8,
    projectsCompleted: 12,
    skillsLearned: 25,
    careersExplored: 3,
    currentStreak: 7
  };

  const recentAchievements = [
    { id: 1, title: 'First Steps', description: 'Completed your first project', icon: Trophy, earned: true },
    { id: 2, title: 'Skill Collector', description: 'Learned 10 new skills', icon: Star, earned: true },
    { id: 3, title: 'Dedicated Learner', description: 'Maintained 7-day streak', icon: Medal, earned: true },
    { id: 4, title: 'Project Master', description: 'Complete 20 projects', icon: Target, earned: false },
    { id: 5, title: 'Expert Level', description: 'Reach level 15', icon: Award, earned: false }
  ];

  const currentCareers = [
    { name: 'UX Designer', progress: 65, xp: 850, status: 'In Progress' },
    { name: 'Software Engineer', progress: 30, xp: 400, status: 'In Progress' },
    { name: 'Data Scientist', progress: 15, xp: 200, status: 'Started' }
  ];

  const handleSave = () => {
    setIsEditing(false);
    toast({
      title: "Profile Updated",
      description: "Your profile information has been saved successfully.",
    });
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset form data here if needed
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-muted/10">
      <Header />
      
      <main className="flex-1 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-96 h-96 bg-primary/3 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/3 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-accent/3 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-4000"></div>
        </div>

        <div className="relative z-10 py-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            {/* Profile Header */}
            <Card className="mb-8 bg-card/80 backdrop-blur-sm border border-border/50 overflow-hidden">
              <div className="bg-gradient-to-r from-primary/10 to-secondary/10 p-8">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                  <Avatar className="w-24 h-24 border-4 border-white/20">
                    <AvatarImage src="/placeholder-avatar.jpg" alt="Profile" />
                    <AvatarFallback className="text-2xl bg-gradient-to-r from-primary to-secondary text-white">
                      {userInfo.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-4">
                      <h1 className="text-3xl font-bold text-foreground">{userInfo.name}</h1>
                      <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                        Level {userStats.level}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground mb-4">{userInfo.bio}</p>
                    
                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">{userStats.totalXp}</div>
                        <div className="text-xs text-muted-foreground">Total XP</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-secondary">{userStats.projectsCompleted}</div>
                        <div className="text-xs text-muted-foreground">Projects</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-accent">{userStats.skillsLearned}</div>
                        <div className="text-xs text-muted-foreground">Skills</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-500">{userStats.currentStreak}</div>
                        <div className="text-xs text-muted-foreground">Day Streak</div>
                      </div>
                    </div>
                  </div>

                  <Button
                    variant={isEditing ? "destructive" : "outline"}
                    onClick={isEditing ? handleCancel : () => setIsEditing(true)}
                    className="bg-background/80 hover:bg-background"
                  >
                    {isEditing ? (
                      <>
                        <X className="w-4 h-4 mr-2" />
                        Cancel
                      </>
                    ) : (
                      <>
                        <Edit3 className="w-4 h-4 mr-2" />
                        Edit Profile
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </Card>

            {/* Main Content Tabs */}
            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4 bg-card/80 backdrop-blur-sm">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="careers">Career Progress</TabsTrigger>
                <TabsTrigger value="achievements">Achievements</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Personal Information */}
                  <Card className="bg-card/80 backdrop-blur-sm border border-border/50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <User className="w-5 h-5" />
                        Personal Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {isEditing ? (
                        <>
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                            <Input 
                              value={userInfo.name}
                              onChange={(e) => setUserInfo({...userInfo, name: e.target.value})}
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">Bio</label>
                            <Input 
                              value={userInfo.bio}
                              onChange={(e) => setUserInfo({...userInfo, bio: e.target.value})}
                              className="mt-1"
                            />
                          </div>
                          <Button onClick={handleSave} className="w-full">
                            <Save className="w-4 h-4 mr-2" />
                            Save Changes
                          </Button>
                        </>
                      ) : (
                        <>
                          <div className="flex items-center gap-3">
                            <Mail className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm">{userInfo.email}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <Phone className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm">{userInfo.phone}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <MapPin className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm">{userInfo.location}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm">Joined {userInfo.joinDate}</span>
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>

                  {/* Quick Actions */}
                  <Card className="bg-card/80 backdrop-blur-sm border border-border/50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Zap className="w-5 h-5" />
                        Quick Actions
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Button className="w-full justify-start" variant="outline">
                        <BookOpen className="w-4 h-4 mr-2" />
                        Continue Learning
                      </Button>
                      <Button className="w-full justify-start" variant="outline">
                        <Target className="w-4 h-4 mr-2" />
                        Take Career Quiz
                      </Button>
                      <Button className="w-full justify-start" variant="outline">
                        <Trophy className="w-4 h-4 mr-2" />
                        View All Achievements
                      </Button>
                      <Button className="w-full justify-start" variant="outline">
                        <Settings className="w-4 h-4 mr-2" />
                        Account Settings
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Career Progress Tab */}
              <TabsContent value="careers" className="space-y-6">
                <div className="grid gap-6">
                  {currentCareers.map((career, index) => (
                    <Card key={index} className="bg-card/80 backdrop-blur-sm border border-border/50">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">{career.name}</CardTitle>
                          <Badge variant={career.status === 'In Progress' ? 'default' : 'secondary'}>
                            {career.status}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div>
                            <div className="flex justify-between text-sm mb-2">
                              <span>Progress</span>
                              <span>{career.progress}%</span>
                            </div>
                            <Progress value={career.progress} className="h-2" />
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">XP Earned: {career.xp}</span>
                            <Button size="sm" variant="outline">
                              Continue Learning
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* Achievements Tab */}
              <TabsContent value="achievements" className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {recentAchievements.map((achievement) => (
                    <Card 
                      key={achievement.id}
                      className={`bg-card/80 backdrop-blur-sm border border-border/50 ${
                        achievement.earned ? 'ring-2 ring-primary/20' : 'opacity-60'
                      }`}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                            achievement.earned 
                              ? 'bg-gradient-to-r from-primary to-secondary' 
                              : 'bg-muted'
                          }`}>
                            <achievement.icon className={`w-6 h-6 ${
                              achievement.earned ? 'text-white' : 'text-muted-foreground'
                            }`} />
                          </div>
                          <div>
                            <h3 className="font-semibold text-foreground">{achievement.title}</h3>
                            <p className="text-sm text-muted-foreground">{achievement.description}</p>
                          </div>
                          {achievement.earned && (
                            <Badge className="ml-auto bg-primary/10 text-primary border-primary/20">
                              Earned
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* Settings Tab */}
              <TabsContent value="settings" className="space-y-6">
                <Card className="bg-card/80 backdrop-blur-sm border border-border/50">
                  <CardHeader>
                    <CardTitle>Account Settings</CardTitle>
                    <CardDescription>Manage your account preferences and privacy settings</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h4 className="font-medium mb-4">Notifications</h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Email notifications</span>
                          <Button size="sm" variant="outline">Toggle</Button>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Achievement alerts</span>
                          <Button size="sm" variant="outline">Toggle</Button>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Weekly progress reports</span>
                          <Button size="sm" variant="outline">Toggle</Button>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-4">Privacy</h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Public profile</span>
                          <Button size="sm" variant="outline">Toggle</Button>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Show achievements</span>
                          <Button size="sm" variant="outline">Toggle</Button>
                        </div>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-border/50">
                      <Button variant="destructive" size="sm">
                        Delete Account
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Profile;