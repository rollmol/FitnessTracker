import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";
import { Bell, Settings, Play, Dumbbell, ChartLine, Trophy, History } from "lucide-react";
import DemoModeToggle from "@/components/DemoModeToggle";
import { useDemoMode } from "@/hooks/useDemoMode";

// Mock user ID for demo - in real app this would come from auth
const MOCK_USER_ID = 1;

interface UserStats {
  weeklyWorkouts: number;
  currentStreak: number;
  totalWorkouts: number;
  totalVolume: number;
  badgeCount: number;
  level: number;
  xp: number;
}

interface WorkoutProgram {
  id: number;
  name: string;
  description: string;
  estimatedDuration: number;
}

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { isDemoMode, toggleDemoMode } = useDemoMode();

  const { data: stats } = useQuery<UserStats>({
    queryKey: [`/api/users/${MOCK_USER_ID}/stats`],
  });

  const { data: programs } = useQuery<WorkoutProgram[]>({
    queryKey: ["/api/workout-programs"],
  });

  const { data: userBadges } = useQuery({
    queryKey: [`/api/users/${MOCK_USER_ID}/badges`],
  });

  const { data: allBadges } = useQuery({
    queryKey: ["/api/badges"],
  });

  // Get today's workout (simplified logic)
  const todaysWorkout = programs?.[0]; // For demo, use first program

  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const recentBadges = userBadges?.slice(-3) || [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Demo Mode Toggle */}
      <div className="p-6 pb-0">
        <DemoModeToggle isDemoMode={isDemoMode} onToggle={toggleDemoMode} />
      </div>
      
      {/* Header with gradient */}
      <div className="gradient-primary text-white p-6 pb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold">
              {getTimeBasedGreeting()}, Alex!
            </h1>
            <p className="text-blue-100 text-sm">Ready to crush your workout?</p>
          </div>
          <div className="flex space-x-3">
            <Button
              variant="ghost"
              size="sm"
              className="relative p-2 bg-white/20 rounded-full hover:bg-white/30"
            >
              <Bell className="h-5 w-5" />
              {stats && stats.badgeCount > 0 && (
                <Badge className="absolute -top-1 -right-1 bg-orange-500 text-xs rounded-full w-5 h-5 flex items-center justify-center p-0">
                  3
                </Badge>
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="p-2 bg-white/20 rounded-full hover:bg-white/30"
            >
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Today's Workout Card */}
        {todaysWorkout && (
          <Card className="bg-white/10 backdrop-blur-sm border-0 text-white">
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg">{todaysWorkout.name}</h3>
                  <p className="text-blue-100 text-sm">
                    6 exercises • {todaysWorkout.estimatedDuration}-{todaysWorkout.estimatedDuration + 15} min
                  </p>
                </div>
                <Button
                  className="bg-orange-500 hover:bg-orange-600 text-white"
                  onClick={() => setLocation(`/workout/${todaysWorkout.id}`)}
                >
                  Start <Play className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Quick Stats */}
      <div className="px-6 -mt-4 mb-6">
        <Card className="shadow-sm">
          <div className="p-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {stats?.weeklyWorkouts || 0}
                </div>
                <div className="text-xs text-gray-500">This Week</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {stats?.currentStreak || 0}
                </div>
                <div className="text-xs text-gray-500">Day Streak</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-500">
                  {stats?.totalWorkouts || 0}
                </div>
                <div className="text-xs text-gray-500">Total</div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="px-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-4">
          <Card
            className="shadow-sm cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => setLocation("/workouts")}
          >
            <div className="p-4 text-left">
              <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mb-3">
                <Dumbbell className="text-blue-600 h-6 w-6" />
              </div>
              <h3 className="font-semibold text-gray-800">Start Workout</h3>
              <p className="text-sm text-gray-500">Choose your program</p>
            </div>
          </Card>

          <Card
            className="shadow-sm cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => setLocation("/progress")}
          >
            <div className="p-4 text-left">
              <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mb-3">
                <ChartLine className="text-green-600 h-6 w-6" />
              </div>
              <h3 className="font-semibold text-gray-800">Progress</h3>
              <p className="text-sm text-gray-500">Track your gains</p>
            </div>
          </Card>

          <Card
            className="shadow-sm cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => setLocation("/badges")}
          >
            <div className="p-4 text-left">
              <div className="bg-orange-100 w-12 h-12 rounded-full flex items-center justify-center mb-3">
                <Trophy className="text-orange-500 h-6 w-6" />
              </div>
              <h3 className="font-semibold text-gray-800">Badges</h3>
              <p className="text-sm text-gray-500">View achievements</p>
            </div>
          </Card>

          <Card className="shadow-sm cursor-pointer hover:shadow-md transition-shadow">
            <div className="p-4 text-left">
              <div className="bg-purple-100 w-12 h-12 rounded-full flex items-center justify-center mb-3">
                <History className="text-purple-500 h-6 w-6" />
              </div>
              <h3 className="font-semibold text-gray-800">History</h3>
              <p className="text-sm text-gray-500">Past workouts</p>
            </div>
          </Card>
        </div>
      </div>

      {/* Recent Badges */}
      {recentBadges.length > 0 && (
        <div className="px-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Recent Achievements</h2>
          <div className="flex space-x-3 overflow-x-auto pb-2">
            {recentBadges.map((userBadge, index) => {
              const badge = allBadges?.find(b => b.id === userBadge.badgeId);
              if (!badge) return null;
              
              const gradients = [
                "gradient-accent",
                "gradient-secondary", 
                "gradient-primary"
              ];
              
              return (
                <div
                  key={userBadge.id}
                  className={`flex-shrink-0 ${gradients[index % gradients.length]} rounded-lg p-3 text-white text-center min-w-[80px]`}
                >
                  <i className={`fas fa-${badge.icon} text-2xl mb-2`}></i>
                  <div className="text-xs font-medium">{badge.name}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* AI Recommendations - shown after 3+ workouts */}
      {stats && stats.totalWorkouts >= 3 && (
        <div className="px-6 mb-20">
          <Card className="gradient-purple text-white border-0">
            <div className="p-4">
              <div className="flex items-center mb-3">
                <i className="fas fa-robot text-2xl mr-3"></i>
                <h2 className="text-lg font-semibold">AI Coach Insights</h2>
              </div>
              <p className="text-sm text-purple-100 mb-3">
                Based on your progress, consider increasing your upper body volume by 10% next week.
              </p>
              <Button
                variant="ghost"
                size="sm"
                className="bg-white/20 text-white text-sm hover:bg-white/30"
              >
                View Details <i className="fas fa-arrow-right ml-1"></i>
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
