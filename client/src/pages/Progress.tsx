import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";
import { ArrowLeft, CalendarDays, Flame, Trophy, TrendingUp } from "lucide-react";

// Mock user ID for demo
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

interface WorkoutSession {
  id: number;
  programId: number;
  startTime: string;
  endTime: string;
  status: string;
  totalVolume: number;
}

interface WorkoutProgram {
  id: number;
  name: string;
}

interface PersonalRecord {
  id: number;
  exerciseId: number;
  weight: number;
  reps: number;
  achievedAt: string;
}

interface Exercise {
  id: number;
  name: string;
}

export default function Progress() {
  const [, setLocation] = useLocation();

  const { data: stats } = useQuery<UserStats>({
    queryKey: [`/api/users/${MOCK_USER_ID}/stats`],
  });

  const { data: sessions } = useQuery<WorkoutSession[]>({
    queryKey: [`/api/users/${MOCK_USER_ID}/workout-sessions`],
  });

  const { data: programs } = useQuery<WorkoutProgram[]>({
    queryKey: ["/api/workout-programs"],
  });

  const { data: personalRecords } = useQuery<PersonalRecord[]>({
    queryKey: [`/api/users/${MOCK_USER_ID}/personal-records`],
  });

  const { data: exercises } = useQuery<Exercise[]>({
    queryKey: ["/api/exercises"],
  });

  const getWorkoutName = (programId: number) => {
    return programs?.find(p => p.id === programId)?.name || "Unknown Workout";
  };

  const getExerciseName = (exerciseId: number) => {
    return exercises?.find(e => e.id === exerciseId)?.name || "Unknown Exercise";
  };

  const formatDuration = (startTime: string, endTime: string) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const duration = Math.floor((end.getTime() - start.getTime()) / (1000 * 60));
    return `${duration} min`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return "Yesterday";
    if (diffDays <= 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  const recentSessions = sessions
    ?.filter(s => s.status === 'completed')
    .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
    .slice(0, 5) || [];

  const topRecords = personalRecords
    ?.sort((a, b) => new Date(b.achievedAt).getTime() - new Date(a.achievedAt).getTime())
    .slice(0, 3) || [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4 flex items-center">
        <Button
          variant="ghost"
          size="sm"
          className="mr-4 p-2"
          onClick={() => setLocation("/")}
        >
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </Button>
        <h1 className="text-xl font-semibold">Progress</h1>
      </div>

      <div className="p-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Card className="gradient-primary text-white p-4">
            <CalendarDays className="h-6 w-6 mb-2" />
            <div className="text-2xl font-bold">{stats?.weeklyWorkouts || 0}</div>
            <div className="text-sm text-blue-100">Workouts this week</div>
          </Card>
          
          <Card className="gradient-secondary text-white p-4">
            <Flame className="h-6 w-6 mb-2" />
            <div className="text-2xl font-bold">{stats?.currentStreak || 0}</div>
            <div className="text-sm text-green-100">Day streak</div>
          </Card>
          
          <Card className="gradient-accent text-white p-4">
            <Trophy className="h-6 w-6 mb-2" />
            <div className="text-2xl font-bold">{stats?.badgeCount || 0}</div>
            <div className="text-sm text-orange-100">Badges earned</div>
          </Card>
          
          <Card className="gradient-purple text-white p-4">
            <TrendingUp className="h-6 w-6 mb-2" />
            <div className="text-2xl font-bold">{stats?.totalVolume || 0}K</div>
            <div className="text-sm text-purple-100">Total volume (lbs)</div>
          </Card>
        </div>

        {/* Progress Chart Placeholder */}
        <Card className="shadow-sm p-4 mb-6">
          <h3 className="font-semibold text-gray-800 mb-4">Strength Progress</h3>
          <div className="h-40 bg-gray-50 rounded-lg flex items-center justify-center text-gray-500">
            <div className="text-center">
              <TrendingUp className="h-8 w-8 mx-auto mb-2" />
              <div className="font-medium">Progress Chart</div>
              <div className="text-sm">Your strength gains over time</div>
            </div>
          </div>
        </Card>

        {/* Personal Records */}
        {topRecords.length > 0 && (
          <Card className="shadow-sm p-4 mb-6">
            <h3 className="font-semibold text-gray-800 mb-4">Personal Records</h3>
            <div className="space-y-3">
              {topRecords.map((record) => (
                <div key={record.id} className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{getExerciseName(record.exerciseId)}</div>
                    <div className="text-sm text-gray-500">
                      Set {formatDate(record.achievedAt)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-blue-600">{record.weight} lbs</div>
                    <div className="text-sm text-green-600">
                      {record.reps} reps
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Recent Workouts */}
        {recentSessions.length > 0 && (
          <Card className="shadow-sm p-4 mb-20">
            <h3 className="font-semibold text-gray-800 mb-4">Recent Workouts</h3>
            <div className="space-y-3">
              {recentSessions.map((session) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                >
                  <div>
                    <div className="font-medium">{getWorkoutName(session.programId)}</div>
                    <div className="text-sm text-gray-500">
                      {formatDate(session.startTime)}, {new Date(session.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      Completed
                    </Badge>
                    <div className="text-xs text-gray-500 mt-1">
                      {session.endTime && formatDuration(session.startTime, session.endTime)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Empty State */}
        {(!recentSessions.length && !topRecords.length) && (
          <Card className="shadow-sm p-8 text-center">
            <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              No progress data yet
            </h3>
            <p className="text-gray-600 mb-4">
              Complete your first workout to start tracking your progress!
            </p>
            <Button onClick={() => setLocation("/workouts")}>
              Start Your First Workout
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}
