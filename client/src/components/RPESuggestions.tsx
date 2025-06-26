import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus, Lightbulb } from "lucide-react";
import { calculateRPEAdjustments, generateWorkoutRecommendations, ExerciseHistory } from "@/lib/rpeAdjustments";
import type { WorkoutSet } from "@shared/schema";

interface RPESuggestionsProps {
  userId: number;
  exerciseId: number;
  exerciseName: string;
  lastWeight?: number;
  lastReps?: number;
  lastRestTime?: number;
}

export default function RPESuggestions({ 
  userId, 
  exerciseId, 
  exerciseName, 
  lastWeight = 20, 
  lastReps = 8, 
  lastRestTime = 120 
}: RPESuggestionsProps) {
  const { data: exerciseHistory, isLoading } = useQuery<WorkoutSet[]>({
    queryKey: ['/api/users', userId, 'exercises', exerciseId, 'history'],
    queryFn: () => fetch(`/api/users/${userId}/exercises/${exerciseId}/history?limit=5`).then(res => res.json()),
  });

  if (isLoading) {
    return (
      <Card className="p-4 animate-pulse">
        <div className="h-4 bg-gray-200 rounded mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-3/4"></div>
      </Card>
    );
  }

  if (!exerciseHistory || exerciseHistory.length === 0) {
    return (
      <Card className="p-4 border-blue-200 bg-blue-50">
        <div className="flex items-center gap-2 mb-2">
          <Lightbulb className="h-4 w-4 text-blue-600" />
          <span className="font-medium text-blue-800">Premier essai</span>
        </div>
        <p className="text-sm text-blue-700">
          Commencez avec un poids modéré pour {exerciseName}. Nous analyserons vos performances pour proposer des ajustements lors des prochaines séances.
        </p>
      </Card>
    );
  }

  // Convert workout sets to exercise history format
  const historyData: ExerciseHistory[] = exerciseHistory.map(set => ({
    exerciseId: set.exerciseId!,
    weight: set.weight!,
    reps: set.reps!,
    rpe: set.rpe!,
    date: new Date(set.completedAt!)
  }));

  const adjustment = calculateRPEAdjustments(historyData);
  const recommendations = generateWorkoutRecommendations(
    lastWeight,
    lastReps,
    lastRestTime,
    adjustment
  );

  const getTrendIcon = () => {
    if (adjustment.weightAdjustment > 0) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (adjustment.weightAdjustment < 0) return <TrendingDown className="h-4 w-4 text-red-600" />;
    return <Minus className="h-4 w-4 text-gray-600" />;
  };

  const getTrendColor = () => {
    if (adjustment.weightAdjustment > 0) return "text-green-800 bg-green-50 border-green-200";
    if (adjustment.weightAdjustment < 0) return "text-red-800 bg-red-50 border-red-200";
    return "text-gray-800 bg-gray-50 border-gray-200";
  };

  return (
    <Card className={`p-4 border ${getTrendColor()}`}>
      <div className="flex items-center gap-2 mb-3">
        {getTrendIcon()}
        <span className="font-medium">Suggestions basées sur vos RPE</span>
        <Badge variant="outline" className="text-xs">
          {historyData.length} séance{historyData.length > 1 ? 's' : ''} analysée{historyData.length > 1 ? 's' : ''}
        </Badge>
      </div>

      <div className="space-y-3">
        <div className="grid grid-cols-3 gap-3 text-sm">
          <div className="text-center">
            <div className="font-medium text-lg">{recommendations.recommendedWeight}kg</div>
            <div className="text-gray-600">Poids</div>
          </div>
          <div className="text-center">
            <div className="font-medium text-lg">{recommendations.recommendedReps}</div>
            <div className="text-gray-600">Répétitions</div>
          </div>
          <div className="text-center">
            <div className="font-medium text-lg">{Math.floor(recommendations.recommendedRest / 60)}:{(recommendations.recommendedRest % 60).toString().padStart(2, '0')}</div>
            <div className="text-gray-600">Repos</div>
          </div>
        </div>

        <div className="text-sm space-y-1">
          {recommendations.explanation.split('\n').map((line, index) => {
            if (line.trim() === '') return null;
            return (
              <div key={index} className={line.startsWith('•') ? 'ml-2' : line.startsWith('Raison:') ? 'mt-2 font-medium' : ''}>
                {line}
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}