import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";
import { Bell, Settings, Play, Dumbbell, ChartLine, Trophy, History } from "lucide-react";
import DemoModeToggle from "@/components/DemoModeToggle";
import { useDemoMode } from "@/hooks/useDemoMode";

import { useCurrentUser } from "@/contexts/UserContext";

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
  
  const { currentUser } = useCurrentUser();
  const userId = currentUser?.id || 1;

  const { data: stats } = useQuery<UserStats>({
    queryKey: [`/api/users/${userId}/stats`],
  });

  const { data: programs } = useQuery<WorkoutProgram[]>({
    queryKey: ["/api/workout-programs"],
  });

  const { data: userBadges } = useQuery({
    queryKey: [`/api/users/${userId}/badges`],
  });

  const { data: allBadges } = useQuery({
    queryKey: ["/api/badges"],
  });

  // Weekly workout schedule
  const weeklySchedule = [
    { day: 0, name: "Repos", programId: null }, // Dimanche
    { day: 1, name: "Haut du corps A - Force", programId: 1 }, // Lundi
    { day: 2, name: "Bas du corps A - Force", programId: 2 }, // Mardi
    { day: 3, name: "Repos", programId: null }, // Mercredi
    { day: 4, name: "Haut du corps B - Volume", programId: 3 }, // Jeudi
    { day: 5, name: "Bas du corps B - Explosivité", programId: 4 }, // Vendredi
    { day: 6, name: "Repos", programId: null }, // Samedi
  ];

  const today = new Date().getDay();
  const todaysSchedule = weeklySchedule.find(schedule => schedule.day === today);
  const todaysWorkout = todaysSchedule?.programId ? programs?.find(p => p.id === todaysSchedule.programId) : null;

  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Bonjour";
    if (hour < 17) return "Bon après-midi";
    return "Bonsoir";
  };

  const recentBadges = Array.isArray(userBadges) ? userBadges.slice(-3) : [];

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
              {getTimeBasedGreeting()}, {currentUser?.name || "Alex"}!
            </h1>
            <p className="text-blue-100 text-sm">Prêt à dominer votre entraînement ?</p>
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
        <Card className="bg-white/10 backdrop-blur-sm border-0 text-white">
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-lg">
                  {todaysSchedule?.name || "Entraînement du jour"}
                </h3>
                <p className="text-blue-100 text-sm">
                  {todaysWorkout ? 
                    `6 exercices • ${todaysWorkout.estimatedDuration}-${todaysWorkout.estimatedDuration + 15} min` :
                    "Jour de repos - Récupération active recommandée"
                  }
                </p>
              </div>
              {todaysWorkout ? (
                <Button
                  className="bg-orange-500 hover:bg-orange-600 text-white"
                  onClick={() => setLocation(`/workout/${todaysWorkout.id}`)}
                >
                  Commencer <Play className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Badge className="bg-green-500/20 text-green-200 border-green-400">
                  Repos
                </Badge>
              )}
            </div>
          </div>
        </Card>
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
                <div className="text-xs text-gray-500">Cette semaine</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {stats?.currentStreak || 0}
                </div>
                <div className="text-xs text-gray-500">Série</div>
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

      {/* Weekly Schedule */}
      <div className="px-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Planning de la semaine</h2>
        <Card className="shadow-sm">
          <div className="p-4">
            <div className="space-y-3">
              {weeklySchedule.map((schedule) => {
                const dayNames = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
                const isToday = schedule.day === today;
                const isRestDay = !schedule.programId;
                
                return (
                  <div
                    key={schedule.day}
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      isToday ? 'bg-blue-50 border-2 border-blue-200' : 'bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-2 h-2 rounded-full ${
                        isToday ? 'bg-blue-500' : isRestDay ? 'bg-gray-400' : 'bg-green-500'
                      }`} />
                      <div>
                        <div className={`font-medium ${isToday ? 'text-blue-900' : 'text-gray-800'}`}>
                          {dayNames[schedule.day]}
                        </div>
                        <div className={`text-sm ${isToday ? 'text-blue-700' : 'text-gray-600'}`}>
                          {schedule.name}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {isToday && (
                        <Badge className="bg-blue-100 text-blue-800 border-blue-300">
                          Aujourd'hui
                        </Badge>
                      )}
                      {isRestDay ? (
                        <Badge variant="outline" className="text-gray-600 border-gray-300">
                          Repos
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-green-600 border-green-300">
                          Entraînement
                        </Badge>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="px-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Actions rapides</h2>
        <div className="grid grid-cols-2 gap-4">
          <Card
            className="shadow-sm cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => setLocation("/workouts")}
          >
            <div className="p-4 text-left">
              <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mb-3">
                <Dumbbell className="text-blue-600 h-6 w-6" />
              </div>
              <h3 className="font-semibold text-gray-800">Commencer l'entraînement</h3>
              <p className="text-sm text-gray-500">Choisissez votre programme</p>
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
              <h3 className="font-semibold text-gray-800">Progrès</h3>
              <p className="text-sm text-gray-500">Suivez vos gains</p>
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
              <p className="text-sm text-gray-500">Voir les réussites</p>
            </div>
          </Card>

          <Card className="shadow-sm cursor-pointer hover:shadow-md transition-shadow">
            <div className="p-4 text-left">
              <div className="bg-purple-100 w-12 h-12 rounded-full flex items-center justify-center mb-3">
                <History className="text-purple-500 h-6 w-6" />
              </div>
              <h3 className="font-semibold text-gray-800">Historique</h3>
              <p className="text-sm text-gray-500">Entraînements passés</p>
            </div>
          </Card>
        </div>
      </div>

      {/* Recent Badges */}
      {recentBadges.length > 0 && (
        <div className="px-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Recent Achievements</h2>
          <div className="flex space-x-3 overflow-x-auto pb-2">
            {recentBadges.map((userBadge: any, index: number) => {
              const badge = Array.isArray(allBadges) ? allBadges.find((b: any) => b.id === userBadge.badgeId) : undefined;
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
