import { useState, useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface WorkoutState {
  sessionId: number | null;
  currentExerciseIndex: number;
  currentSetIndex: number;
  startTime: Date;
  isActive: boolean;
  isResting: boolean;
}

interface WorkoutSet {
  exerciseId: number;
  setNumber: number;
  weight: number;
  reps: number;
  rpe: number;
  restTime: number;
}

export function useWorkout(userId: number, programId: number) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [workoutState, setWorkoutState] = useState<WorkoutState>({
    sessionId: null,
    currentExerciseIndex: 0,
    currentSetIndex: 0,
    startTime: new Date(),
    isActive: false,
    isResting: false,
  });

  const [completedSets, setCompletedSets] = useState<WorkoutSet[]>([]);

  // Create workout session
  const createSessionMutation = useMutation({
    mutationFn: (data: { userId: number; programId: number }) =>
      apiRequest("POST", "/api/workout-sessions", data),
    onSuccess: async (response) => {
      const session = await response.json();
      setWorkoutState(prev => ({
        ...prev,
        sessionId: session.id,
        isActive: true,
        startTime: new Date(session.startTime),
      }));
    },
  });

  // Save workout set
  const saveSetMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/workout-sets", data),
    onSuccess: () => {
      toast({
        title: "Set completed!",
        description: "Keep up the great work!",
      });
    },
  });

  // Complete workout session
  const completeSessionMutation = useMutation({
    mutationFn: ({ id, updates }: { id: number; updates: any }) =>
      apiRequest("PUT", `/api/workout-sessions/${id}`, updates),
    onSuccess: () => {
      toast({
        title: "Workout completed!",
        description: "Amazing work! You've crushed this workout!",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}/workout-sessions`] });
      queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}/stats`] });
    },
  });

  const startWorkout = useCallback(() => {
    if (!workoutState.sessionId) {
      createSessionMutation.mutate({ userId, programId });
    }
  }, [userId, programId, workoutState.sessionId]);

  const completeSet = useCallback((setData: WorkoutSet) => {
    if (!workoutState.sessionId) return;

    const apiData = {
      sessionId: workoutState.sessionId,
      ...setData,
    };

    saveSetMutation.mutate(apiData);
    setCompletedSets(prev => [...prev, setData]);
  }, [workoutState.sessionId]);

  const nextExercise = useCallback(() => {
    setWorkoutState(prev => ({
      ...prev,
      currentExerciseIndex: prev.currentExerciseIndex + 1,
      currentSetIndex: 0,
    }));
  }, []);

  const nextSet = useCallback(() => {
    setWorkoutState(prev => ({
      ...prev,
      currentSetIndex: prev.currentSetIndex + 1,
    }));
  }, []);

  const startRest = useCallback(() => {
    setWorkoutState(prev => ({
      ...prev,
      isResting: true,
    }));
  }, []);

  const endRest = useCallback(() => {
    setWorkoutState(prev => ({
      ...prev,
      isResting: false,
    }));
  }, []);

  const completeWorkout = useCallback(() => {
    if (!workoutState.sessionId) return;

    const totalVolume = completedSets.reduce((sum, set) => sum + (set.weight * set.reps), 0);
    const averageRpe = completedSets.length > 0 
      ? Math.round(completedSets.reduce((sum, set) => sum + set.rpe, 0) / completedSets.length)
      : null;

    completeSessionMutation.mutate({
      id: workoutState.sessionId,
      updates: {
        status: "completed",
        endTime: new Date(),
        totalVolume,
        averageRpe,
      },
    });

    setWorkoutState(prev => ({
      ...prev,
      isActive: false,
    }));
  }, [workoutState.sessionId, completedSets]);

  const cancelWorkout = useCallback(() => {
    if (!workoutState.sessionId) return;

    completeSessionMutation.mutate({
      id: workoutState.sessionId,
      updates: {
        status: "cancelled",
        endTime: new Date(),
      },
    });

    setWorkoutState(prev => ({
      ...prev,
      isActive: false,
    }));
  }, [workoutState.sessionId]);

  return {
    workoutState,
    completedSets,
    startWorkout,
    completeSet,
    nextExercise,
    nextSet,
    startRest,
    endRest,
    completeWorkout,
    cancelWorkout,
    isLoading: createSessionMutation.isPending || saveSetMutation.isPending || completeSessionMutation.isPending,
  };
}
