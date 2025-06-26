import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import RestTimer from "@/components/RestTimer";
import { Pause, X, Check, ArrowLeft, ArrowRight } from "lucide-react";

// Mock user ID for demo
const MOCK_USER_ID = 1;

interface Exercise {
  id: number;
  name: string;
  description: string;
  restTime: number;
  instructions: string;
}

interface WorkoutProgram {
  id: number;
  name: string;
  exercises: string[];
}

interface WorkoutSet {
  exerciseId: number;
  setNumber: number;
  weight: number;
  reps: number;
  rpe: number;
  completed: boolean;
}

interface WorkoutSession {
  id: number;
  programId: number;
  userId: number;
  startTime: string;
  status: string;
}

export default function ActiveWorkout() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Extract program ID from URL path (/workout/1 -> get "1")
  const programId = parseInt(location.split('/').pop() || '1');
  
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSetIndex, setCurrentSetIndex] = useState(0);
  const [workoutSets, setWorkoutSets] = useState<WorkoutSet[]>([]);
  const [currentWeight, setCurrentWeight] = useState("");
  const [currentReps, setCurrentReps] = useState("");
  const [currentRPE, setCurrentRPE] = useState([7]);
  const [isResting, setIsResting] = useState(false);
  const [restDuration, setRestDuration] = useState(180);
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [startTime] = useState(new Date());

  const { data: program } = useQuery<WorkoutProgram>({
    queryKey: [`/api/workout-programs/${programId}`],
  });

  const { data: allExercises } = useQuery<Exercise[]>({
    queryKey: ["/api/exercises"],
  });

  // Create workout session on mount
  const createSessionMutation = useMutation({
    mutationFn: (data: { userId: number; programId: number }) =>
      apiRequest("POST", "/api/workout-sessions", data),
    onSuccess: (response) => {
      response.json().then((session: WorkoutSession) => {
        setSessionId(session.id);
      });
    },
  });

  // Save workout set
  const saveSetMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/workout-sets", data),
    onSuccess: () => {
      toast({
        title: "Set completed!",
        description: "Great work! Keep it up.",
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
        description: "Excellent work! You crushed it!",
      });
      setLocation("/");
    },
  });

  useEffect(() => {
    if (programId && !sessionId) {
      createSessionMutation.mutate({
        userId: MOCK_USER_ID,
        programId: programId,
      });
    }
  }, [programId]);

  if (!program || !allExercises) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading workout...</p>
        </div>
      </div>
    );
  }

  const workoutExercises = program.exercises
    ?.map(id => allExercises.find(ex => ex.id === parseInt(id)))
    .filter(Boolean) as Exercise[];

  if (!workoutExercises || workoutExercises.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">No exercises found for this workout.</p>
          <Button onClick={() => setLocation("/")} className="mt-4">
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const currentExercise = workoutExercises[currentExerciseIndex];
  const totalSets = 3; // Default to 3 sets per exercise
  const progressPercentage = ((currentExerciseIndex * totalSets + currentSetIndex + 1) / (workoutExercises.length * totalSets)) * 100;
  
  const elapsedTime = Math.floor((Date.now() - startTime.getTime()) / 1000);
  const minutes = Math.floor(elapsedTime / 60);
  const seconds = elapsedTime % 60;
  const timeDisplay = `${minutes}:${seconds.toString().padStart(2, '0')}`;

  const handleCompleteSet = () => {
    if (!currentWeight || !currentReps || !sessionId) {
      toast({
        title: "Missing information",
        description: "Please enter weight and reps",
        variant: "destructive",
      });
      return;
    }

    const setData = {
      sessionId,
      exerciseId: currentExercise.id,
      setNumber: currentSetIndex + 1,
      weight: parseInt(currentWeight),
      reps: parseInt(currentReps),
      rpe: currentRPE[0],
      restTime: currentExercise.restTime,
    };

    saveSetMutation.mutate(setData);

    // Update local state
    const newSet: WorkoutSet = {
      exerciseId: currentExercise.id,
      setNumber: currentSetIndex + 1,
      weight: parseInt(currentWeight),
      reps: parseInt(currentReps),
      rpe: currentRPE[0],
      completed: true,
    };

    setWorkoutSets([...workoutSets, newSet]);

    // Check if this is the last set of the exercise
    if (currentSetIndex < totalSets - 1) {
      setCurrentSetIndex(currentSetIndex + 1);
      setIsResting(true);
      setRestDuration(currentExercise.restTime);
    } else {
      // Move to next exercise or complete workout
      if (currentExerciseIndex < workoutExercises.length - 1) {
        setCurrentExerciseIndex(currentExerciseIndex + 1);
        setCurrentSetIndex(0);
        setCurrentWeight("");
        setCurrentReps("");
        setIsResting(true);
        setRestDuration(currentExercise.restTime);
      } else {
        // Workout complete
        if (sessionId) {
          const totalVolume = workoutSets.reduce((sum, set) => sum + (set.weight * set.reps), 0);
          const averageRpe = Math.round(workoutSets.reduce((sum, set) => sum + set.rpe, 0) / workoutSets.length);
          
          completeSessionMutation.mutate({
            id: sessionId,
            updates: {
              status: "completed",
              endTime: new Date(),
              totalVolume,
              averageRpe,
            },
          });
        }
      }
    }
  };

  const handlePreviousExercise = () => {
    if (currentExerciseIndex > 0) {
      setCurrentExerciseIndex(currentExerciseIndex - 1);
      setCurrentSetIndex(0);
      setCurrentWeight("");
      setCurrentReps("");
    }
  };

  const handleNextExercise = () => {
    if (currentExerciseIndex < workoutExercises.length - 1) {
      setCurrentExerciseIndex(currentExerciseIndex + 1);
      setCurrentSetIndex(0);
      setCurrentWeight("");
      setCurrentReps("");
    }
  };

  const handleEndWorkout = () => {
    if (confirm("Are you sure you want to end this workout?")) {
      if (sessionId) {
        completeSessionMutation.mutate({
          id: sessionId,
          updates: {
            status: "cancelled",
            endTime: new Date(),
          },
        });
      } else {
        setLocation("/");
      }
    }
  };

  const getCompletedSets = (exerciseId: number) => {
    return workoutSets.filter(set => set.exerciseId === exerciseId);
  };

  const completedSets = getCompletedSets(currentExercise.id);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with progress */}
      <div className="gradient-primary text-white px-6 py-4">
        <div className="flex items-center justify-between mb-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/20 p-2"
            onClick={() => setIsResting(!isResting)}
          >
            <Pause className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold">{program.name}</h1>
          <Button
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/20 p-2"
            onClick={handleEndWorkout}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Progress bar */}
        <div className="bg-blue-400 rounded-full h-2 mb-2">
          <div
            className="bg-white rounded-full h-2 transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        <div className="flex justify-between text-sm text-blue-100">
          <span>Exercise {currentExerciseIndex + 1} of {workoutExercises.length}</span>
          <span>{timeDisplay}</span>
        </div>
      </div>

      {/* Rest Timer */}
      {isResting && (
        <RestTimer
          duration={restDuration}
          onComplete={() => setIsResting(false)}
          onSkip={() => setIsResting(false)}
        />
      )}

      {/* Current Exercise */}
      <div className="p-6">
        <Card className="shadow-sm p-6 mb-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold mb-2">{currentExercise.name}</h2>
            <p className="text-gray-600">{currentExercise.instructions}</p>
          </div>

          {/* Sets tracking */}
          <div className="space-y-3 mb-6">
            {Array.from({ length: totalSets }, (_, index) => {
              const isCompleted = completedSets.some(set => set.setNumber === index + 1);
              const isCurrent = index === currentSetIndex;
              const completedSet = completedSets.find(set => set.setNumber === index + 1);

              return (
                <div
                  key={index}
                  className={`flex items-center justify-between rounded-lg p-3 ${
                    isCurrent
                      ? "bg-blue-50 border-2 border-blue-500"
                      : isCompleted
                      ? "bg-gray-50"
                      : "bg-gray-50 opacity-50"
                  }`}
                >
                  <span className={`font-medium ${isCurrent ? "text-blue-600" : "text-gray-800"}`}>
                    Set {index + 1} {isCurrent && "(Current)"}
                  </span>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Input
                        type="number"
                        placeholder="Weight"
                        value={isCurrent ? currentWeight : completedSet?.weight || ""}
                        onChange={(e) => isCurrent && setCurrentWeight(e.target.value)}
                        className={`w-16 text-center text-sm ${
                          isCurrent ? "border-blue-500 border-2" : ""
                        }`}
                        disabled={!isCurrent}
                      />
                      <span className="text-sm text-gray-500">lbs</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Input
                        type="number"
                        placeholder="Reps"
                        value={isCurrent ? currentReps : completedSet?.reps || ""}
                        onChange={(e) => isCurrent && setCurrentReps(e.target.value)}
                        className={`w-12 text-center text-sm ${
                          isCurrent ? "border-blue-500 border-2" : ""
                        }`}
                        disabled={!isCurrent}
                      />
                      <span className="text-sm text-gray-500">reps</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={isCompleted ? "text-green-600" : "text-gray-400"}
                      disabled={!isCurrent}
                      onClick={isCurrent ? handleCompleteSet : undefined}
                    >
                      <Check className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Complete Set Button */}
          <Button
            className="w-full gradient-secondary text-white font-semibold py-3 mb-4"
            onClick={handleCompleteSet}
            disabled={!currentWeight || !currentReps || saveSetMutation.isPending}
          >
            {saveSetMutation.isPending ? "Saving..." : "Complete Set"}
          </Button>

          {/* RPE Rating */}
          <Card className="bg-gray-50 p-4">
            <h3 className="font-semibold mb-3">Rate of Perceived Exertion (RPE)</h3>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">Easy</span>
              <span className="text-sm text-gray-600">Max Effort</span>
            </div>
            <Slider
              value={currentRPE}
              onValueChange={setCurrentRPE}
              max={10}
              min={1}
              step={1}
              className="w-full mb-2"
            />
            <div className="flex justify-between text-xs text-gray-500 mb-2">
              {Array.from({ length: 10 }, (_, i) => (
                <span key={i}>{i + 1}</span>
              ))}
            </div>
            <div className="text-center">
              <span className="text-lg font-bold text-blue-600">
                RPE: {currentRPE[0]}
              </span>
            </div>
          </Card>
        </Card>

        {/* Navigation */}
        <div className="flex space-x-4 mb-20">
          <Button
            variant="outline"
            className="flex-1 py-3"
            onClick={handlePreviousExercise}
            disabled={currentExerciseIndex === 0}
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Previous
          </Button>
          <Button
            className="flex-1 gradient-primary text-white py-3"
            onClick={handleNextExercise}
            disabled={currentExerciseIndex === workoutExercises.length - 1}
          >
            Next <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
