// This file contains workout program data and exercise configurations
// In a real app, this would come from the backend

export interface ExerciseConfig {
  id: number;
  name: string;
  sets: number;
  reps: string; // e.g., "8-10", "5", "12-15"
  restTime: number; // in seconds
  rpe: string; // e.g., "7-8", "9-10"
  notes?: string;
}

export interface WorkoutProgramConfig {
  id: number;
  name: string;
  type: 'force' | 'volume' | 'explosivity';
  exercises: ExerciseConfig[];
}

export const workoutPrograms: WorkoutProgramConfig[] = [
  {
    id: 1,
    name: "Upper A - Force",
    type: "force",
    exercises: [
      {
        id: 1,
        name: "Bench Press",
        sets: 3,
        reps: "5-6",
        restTime: 180,
        rpe: "8-9",
        notes: "Focus on explosive concentric"
      },
      {
        id: 4,
        name: "Overhead Press",
        sets: 3,
        reps: "6-8",
        restTime: 150,
        rpe: "7-8"
      },
      {
        id: 5,
        name: "Barbell Row",
        sets: 3,
        reps: "6-8",
        restTime: 150,
        rpe: "7-8"
      },
      {
        id: 6,
        name: "Pull-ups",
        sets: 3,
        reps: "5-8",
        restTime: 120,
        rpe: "8-9"
      },
      {
        id: 7,
        name: "Dips",
        sets: 3,
        reps: "8-10",
        restTime: 120,
        rpe: "7-8"
      },
      {
        id: 9,
        name: "Incline Bench Press",
        sets: 3,
        reps: "6-8",
        restTime: 150,
        rpe: "7-8"
      }
    ]
  },
  {
    id: 2,
    name: "Lower A - Force",
    type: "force",
    exercises: [
      {
        id: 2,
        name: "Squat",
        sets: 3,
        reps: "5-6",
        restTime: 180,
        rpe: "8-9",
        notes: "Focus on depth and control"
      },
      {
        id: 3,
        name: "Deadlift",
        sets: 3,
        reps: "5",
        restTime: 240,
        rpe: "8-9",
        notes: "Reset each rep"
      },
      {
        id: 8,
        name: "Romanian Deadlift",
        sets: 3,
        reps: "8-10",
        restTime: 150,
        rpe: "7-8"
      },
      {
        id: 11,
        name: "Bulgarian Split Squats",
        sets: 3,
        reps: "10-12",
        restTime: 120,
        rpe: "7-8"
      }
    ]
  },
  {
    id: 3,
    name: "Upper B - Volume",
    type: "volume",
    exercises: [
      {
        id: 1,
        name: "Bench Press",
        sets: 4,
        reps: "10-12",
        restTime: 90,
        rpe: "6-7",
        notes: "Focus on muscle contraction"
      },
      {
        id: 4,
        name: "Overhead Press",
        sets: 4,
        reps: "12-15",
        restTime: 90,
        rpe: "6-7"
      },
      {
        id: 5,
        name: "Barbell Row",
        sets: 4,
        reps: "12-15",
        restTime: 90,
        rpe: "6-7"
      },
      {
        id: 6,
        name: "Pull-ups",
        sets: 4,
        reps: "8-12",
        restTime: 90,
        rpe: "6-7"
      },
      {
        id: 7,
        name: "Dips",
        sets: 4,
        reps: "12-15",
        restTime: 90,
        rpe: "6-7"
      },
      {
        id: 9,
        name: "Incline Bench Press",
        sets: 4,
        reps: "12-15",
        restTime: 90,
        rpe: "6-7"
      }
    ]
  },
  {
    id: 4,
    name: "Lower B - Explosivity",
    type: "explosivity",
    exercises: [
      {
        id: 2,
        name: "Squat",
        sets: 5,
        reps: "3",
        restTime: 120,
        rpe: "8-9",
        notes: "Explosive concentric, pause at bottom"
      },
      {
        id: 10,
        name: "Box Jumps",
        sets: 4,
        reps: "5",
        restTime: 90,
        rpe: "7-8",
        notes: "Focus on landing softly"
      },
      {
        id: 11,
        name: "Bulgarian Split Squats",
        sets: 3,
        reps: "8-10",
        restTime: 90,
        rpe: "7-8",
        notes: "Explosive up phase"
      },
      {
        id: 8,
        name: "Romanian Deadlift",
        sets: 3,
        reps: "6-8",
        restTime: 120,
        rpe: "7-8",
        notes: "Controlled eccentric"
      }
    ]
  }
];

export const getWorkoutProgram = (id: number): WorkoutProgramConfig | undefined => {
  return workoutPrograms.find(program => program.id === id);
};

export const getExerciseConfig = (programId: number, exerciseId: number): ExerciseConfig | undefined => {
  const program = getWorkoutProgram(programId);
  return program?.exercises.find(exercise => exercise.id === exerciseId);
};
