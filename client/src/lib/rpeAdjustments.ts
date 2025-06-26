// RPE-based workout adjustment system
export interface WorkoutAdjustment {
  weightAdjustment: number; // percentage change
  repsAdjustment: number; // change in reps
  restAdjustment: number; // change in rest time (seconds)
  suggestion: string;
  rationale: string;
}

export interface ExerciseHistory {
  exerciseId: number;
  weight: number;
  reps: number;
  rpe: number;
  date: Date;
}

/**
 * Calculate workout adjustments based on RPE history
 * RPE Scale:
 * 6-7: Too easy, increase intensity
 * 8: Perfect intensity 
 * 9: High intensity, maintain or slight decrease
 * 10: Maximum effort, decrease intensity
 */
export function calculateRPEAdjustments(
  exerciseHistory: ExerciseHistory[],
  targetRPE: number = 8
): WorkoutAdjustment {
  if (exerciseHistory.length === 0) {
    return {
      weightAdjustment: 0,
      repsAdjustment: 0,
      restAdjustment: 0,
      suggestion: "Commencez avec un poids modéré",
      rationale: "Première séance - établir une base"
    };
  }

  // Get recent performance (last 3 sessions)
  const recentSessions = exerciseHistory
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, 3);

  const avgRPE = recentSessions.reduce((sum, session) => sum + session.rpe, 0) / recentSessions.length;
  const trend = calculateRPETrend(recentSessions);

  return generateAdjustment(avgRPE, trend, targetRPE);
}

function calculateRPETrend(sessions: ExerciseHistory[]): 'increasing' | 'decreasing' | 'stable' {
  if (sessions.length < 2) return 'stable';
  
  const recent = sessions[0].rpe;
  const previous = sessions[1].rpe;
  
  if (recent > previous + 0.5) return 'increasing';
  if (recent < previous - 0.5) return 'decreasing';
  return 'stable';
}

function generateAdjustment(
  avgRPE: number, 
  trend: 'increasing' | 'decreasing' | 'stable',
  targetRPE: number
): WorkoutAdjustment {
  const rpeDifference = avgRPE - targetRPE;
  
  // RPE too low (6-7) - increase intensity
  if (avgRPE < 7.5) {
    return {
      weightAdjustment: trend === 'decreasing' ? 7.5 : 5,
      repsAdjustment: 0,
      restAdjustment: 0,
      suggestion: "Augmentez le poids",
      rationale: `RPE moyen ${avgRPE.toFixed(1)} - vous pouvez pousser plus fort`
    };
  }
  
  // RPE perfect (7.5-8.5) - maintain or slight progression
  if (avgRPE >= 7.5 && avgRPE <= 8.5) {
    return {
      weightAdjustment: trend === 'stable' ? 2.5 : 0,
      repsAdjustment: trend === 'decreasing' ? 1 : 0,
      restAdjustment: 0,
      suggestion: "Maintenez cette intensité",
      rationale: `RPE optimal ${avgRPE.toFixed(1)} - progression contrôlée`
    };
  }
  
  // RPE high (8.5-9.5) - maintain or slight decrease
  if (avgRPE > 8.5 && avgRPE < 9.5) {
    return {
      weightAdjustment: trend === 'increasing' ? -2.5 : 0,
      repsAdjustment: trend === 'increasing' ? -1 : 0,
      restAdjustment: 15,
      suggestion: "Intensité élevée - récupération importante",
      rationale: `RPE ${avgRPE.toFixed(1)} - évitez le surentraînement`
    };
  }
  
  // RPE too high (9.5+) - decrease intensity
  return {
    weightAdjustment: -5,
    repsAdjustment: -1,
    restAdjustment: 30,
    suggestion: "Réduisez l'intensité",
    rationale: `RPE ${avgRPE.toFixed(1)} - risque de surmenage`
  };
}

/**
 * Generate specific recommendations for next workout
 */
export function generateWorkoutRecommendations(
  lastWeight: number,
  lastReps: number,
  lastRestTime: number,
  adjustment: WorkoutAdjustment
): {
  recommendedWeight: number;
  recommendedReps: number;
  recommendedRest: number;
  explanation: string;
} {
  const weightChange = (adjustment.weightAdjustment / 100) * lastWeight;
  const recommendedWeight = Math.round((lastWeight + weightChange) * 2) / 2; // Round to nearest 0.5kg
  
  const recommendedReps = Math.max(1, lastReps + adjustment.repsAdjustment);
  const recommendedRest = Math.max(30, lastRestTime + adjustment.restAdjustment);
  
  let explanation = adjustment.suggestion + "\n";
  
  if (adjustment.weightAdjustment !== 0) {
    const direction = adjustment.weightAdjustment > 0 ? "augmentez" : "diminuez";
    explanation += `• ${direction} le poids à ${recommendedWeight}kg (${adjustment.weightAdjustment > 0 ? '+' : ''}${adjustment.weightAdjustment}%)\n`;
  }
  
  if (adjustment.repsAdjustment !== 0) {
    const direction = adjustment.repsAdjustment > 0 ? "ajoutez" : "retirez";
    explanation += `• ${direction} ${Math.abs(adjustment.repsAdjustment)} répétition(s)\n`;
  }
  
  if (adjustment.restAdjustment !== 0) {
    const direction = adjustment.restAdjustment > 0 ? "augmentez" : "diminuez";
    explanation += `• ${direction} le repos de ${Math.abs(adjustment.restAdjustment)}s\n`;
  }
  
  explanation += `\nRaison: ${adjustment.rationale}`;
  
  return {
    recommendedWeight,
    recommendedReps,
    recommendedRest,
    explanation
  };
}

/**
 * Calculate exercise volume progression
 */
export function calculateVolumeProgression(history: ExerciseHistory[]): {
  currentVolume: number;
  volumeChange: number;
  progressionRate: string;
} {
  if (history.length < 2) {
    return {
      currentVolume: history[0]?.weight * history[0]?.reps || 0,
      volumeChange: 0,
      progressionRate: "Données insuffisantes"
    };
  }
  
  const recent = history[0];
  const previous = history[1];
  
  const currentVolume = recent.weight * recent.reps;
  const previousVolume = previous.weight * previous.reps;
  const volumeChange = ((currentVolume - previousVolume) / previousVolume) * 100;
  
  let progressionRate: string;
  if (volumeChange > 10) progressionRate = "Progression rapide";
  else if (volumeChange > 2.5) progressionRate = "Progression normale";
  else if (volumeChange > -2.5) progressionRate = "Progression stable";
  else progressionRate = "Régression - ajustement nécessaire";
  
  return {
    currentVolume,
    volumeChange,
    progressionRate
  };
}