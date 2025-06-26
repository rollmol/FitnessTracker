import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";
import { ArrowLeft, Star, Crown, Rocket } from "lucide-react";

// Mock user ID for demo
const MOCK_USER_ID = 1;

interface UserStats {
  level: number;
  xp: number;
}

interface BadgeData {
  id: number;
  name: string;
  description: string;
  icon: string;
  xpReward: number;
}

interface UserBadge {
  id: number;
  badgeId: number;
  earnedAt: string;
}

export default function Badges() {
  const [, setLocation] = useLocation();

  const { data: stats } = useQuery<UserStats>({
    queryKey: [`/api/users/${MOCK_USER_ID}/stats`],
  });

  const { data: allBadges } = useQuery<BadgeData[]>({
    queryKey: ["/api/badges"],
  });

  const { data: userBadges } = useQuery<UserBadge[]>({
    queryKey: [`/api/users/${MOCK_USER_ID}/badges`],
  });

  const earnedBadgeIds = userBadges?.map(ub => ub.badgeId) || [];
  const earnedBadges = allBadges?.filter(badge => earnedBadgeIds.includes(badge.id)) || [];
  const lockedBadges = allBadges?.filter(badge => !earnedBadgeIds.includes(badge.id)) || [];

  // Calculate XP progress to next level
  const currentXP = stats?.xp || 0;
  const currentLevel = stats?.level || 1;
  const xpForNextLevel = currentLevel * 250; // 250 XP per level
  const xpProgress = (currentXP % xpForNextLevel) / xpForNextLevel * 100;
  const xpNeeded = xpForNextLevel - (currentXP % xpForNextLevel);

  const getBadgeIcon = (iconName: string) => {
    const iconMap: { [key: string]: string } = {
      'dumbbell': 'fas fa-dumbbell',
      'fire': 'fas fa-fire',
      'medal': 'fas fa-medal',
      'target': 'fas fa-target',
      'chart-line': 'fas fa-chart-line',
      'trophy': 'fas fa-trophy',
      'star': 'fas fa-star',
      'crown': 'fas fa-crown',
      'rocket': 'fas fa-rocket',
    };
    return iconMap[iconName] || 'fas fa-medal';
  };

  const getBadgeGradient = (index: number) => {
    const gradients = [
      'gradient-accent',
      'gradient-secondary',
      'gradient-primary',
      'from-purple-500 to-indigo-600',
      'from-pink-500 to-red-500',
      'from-teal-500 to-cyan-600',
    ];
    return gradients[index % gradients.length];
  };

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
        <h1 className="text-xl font-semibold">Badges</h1>
      </div>

      <div className="p-6">
        {/* XP Progress */}
        <Card className="gradient-purple text-white p-4 mb-6">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-2xl font-bold">Level {currentLevel}</div>
              <div className="text-purple-100">{currentXP.toLocaleString()} XP</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-purple-100">Next Level</div>
              <div className="text-lg font-semibold">{xpNeeded} XP to go</div>
            </div>
          </div>
          <div className="bg-purple-400 rounded-full h-2">
            <div
              className="bg-white rounded-full h-2 transition-all duration-300"
              style={{ width: `${xpProgress}%` }}
            />
          </div>
        </Card>

        {/* Earned Badges */}
        {earnedBadges.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Earned Badges ({earnedBadges.length})
            </h2>
            <div className="grid grid-cols-3 gap-4">
              {earnedBadges.map((badge, index) => (
                <Card
                  key={badge.id}
                  className={`bg-gradient-to-br ${getBadgeGradient(index)} text-white p-4 text-center`}
                >
                  <i className={`${getBadgeIcon(badge.icon)} text-3xl mb-2`}></i>
                  <div className="text-xs font-medium">{badge.name}</div>
                  <div className="text-xs opacity-90 mt-1">{badge.description}</div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Locked Badges */}
        {lockedBadges.length > 0 && (
          <div className="mb-20">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Locked Badges ({lockedBadges.length})
            </h2>
            <div className="grid grid-cols-3 gap-4">
              {lockedBadges.map((badge) => (
                <Card
                  key={badge.id}
                  className="bg-gray-100 border-2 border-dashed border-gray-300 p-4 text-center"
                >
                  <i className={`${getBadgeIcon(badge.icon)} text-3xl text-gray-400 mb-2`}></i>
                  <div className="text-xs font-medium text-gray-600">{badge.name}</div>
                  <div className="text-xs text-gray-400 mt-1">{badge.description}</div>
                  {badge.xpReward > 0 && (
                    <Badge variant="outline" className="mt-2 text-xs">
                      +{badge.xpReward} XP
                    </Badge>
                  )}
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {earnedBadges.length === 0 && (
          <Card className="shadow-sm p-8 text-center">
            <div className="text-6xl mb-4">🏆</div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              No badges earned yet
            </h3>
            <p className="text-gray-600 mb-4">
              Complete workouts and reach milestones to earn your first badges!
            </p>
            <Button onClick={() => setLocation("/workouts")}>
              Start Working Out
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}
