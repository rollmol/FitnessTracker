import { 
  users, exercises, workoutPrograms, workoutSessions, workoutSets, badges, userBadges, personalRecords,
  type User, type InsertUser, type Exercise, type WorkoutProgram, type WorkoutSession, 
  type WorkoutSet, type InsertWorkoutSession, type InsertWorkoutSet, type Badge, 
  type UserBadge, type PersonalRecord, type InsertPersonalRecord
} from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserXpAndLevel(id: number, xp: number, level: number): Promise<User>;
  updateUserStreak(id: number, streak: number): Promise<User>;
  
  // Exercises
  getAllExercises(): Promise<Exercise[]>;
  getExercise(id: number): Promise<Exercise | undefined>;
  
  // Workout Programs
  getAllWorkoutPrograms(): Promise<WorkoutProgram[]>;
  getWorkoutProgram(id: number): Promise<WorkoutProgram | undefined>;
  
  // Workout Sessions
  createWorkoutSession(session: InsertWorkoutSession): Promise<WorkoutSession>;
  getWorkoutSession(id: number): Promise<WorkoutSession | undefined>;
  getUserWorkoutSessions(userId: number): Promise<WorkoutSession[]>;
  updateWorkoutSession(id: number, updates: Partial<WorkoutSession>): Promise<WorkoutSession>;
  
  // Workout Sets
  createWorkoutSet(set: InsertWorkoutSet): Promise<WorkoutSet>;
  getSessionSets(sessionId: number): Promise<WorkoutSet[]>;
  
  // Badges
  getAllBadges(): Promise<Badge[]>;
  getUserBadges(userId: number): Promise<UserBadge[]>;
  awardBadge(userId: number, badgeId: number): Promise<UserBadge>;
  
  // Personal Records
  getUserPersonalRecords(userId: number): Promise<PersonalRecord[]>;
  createPersonalRecord(record: InsertPersonalRecord): Promise<PersonalRecord>;
  getExercisePersonalRecord(userId: number, exerciseId: number): Promise<PersonalRecord | undefined>;
  
  // Exercise History
  getUserExerciseHistory(userId: number, exerciseId: number, limit?: number): Promise<WorkoutSet[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User> = new Map();
  private exercises: Map<number, Exercise> = new Map();
  private workoutPrograms: Map<number, WorkoutProgram> = new Map();
  private workoutSessions: Map<number, WorkoutSession> = new Map();
  private workoutSets: Map<number, WorkoutSet> = new Map();
  private badges: Map<number, Badge> = new Map();
  private userBadges: Map<number, UserBadge> = new Map();
  private personalRecords: Map<number, PersonalRecord> = new Map();
  
  private currentUserId = 1;
  private currentExerciseId = 1;
  private currentProgramId = 1;
  private currentSessionId = 1;
  private currentSetId = 1;
  private currentBadgeId = 1;
  private currentUserBadgeId = 1;
  private currentRecordId = 1;

  constructor() {
    this.initializeData();
  }

  private initializeData() {
    // Initialize default exercises
    const defaultExercises: Omit<Exercise, 'id'>[] = [
      { name: "Bench Press", description: "Chest compound movement", muscleGroups: ["chest", "triceps", "shoulders"], instructions: "Keep your core tight and control the descent", restTime: 180 },
      { name: "Squat", description: "Lower body compound movement", muscleGroups: ["quadriceps", "glutes", "hamstrings"], instructions: "Keep your knees tracking over your toes", restTime: 180 },
      { name: "Deadlift", description: "Full body compound movement", muscleGroups: ["hamstrings", "glutes", "back"], instructions: "Keep the bar close to your body", restTime: 240 },
      { name: "Overhead Press", description: "Shoulder compound movement", muscleGroups: ["shoulders", "triceps", "core"], instructions: "Keep your core braced throughout", restTime: 150 },
      { name: "Barbell Row", description: "Back compound movement", muscleGroups: ["back", "biceps"], instructions: "Pull to your lower chest", restTime: 150 },
      { name: "Pull-ups", description: "Upper body bodyweight exercise", muscleGroups: ["back", "biceps"], instructions: "Full range of motion", restTime: 120 },
      { name: "Dips", description: "Triceps compound movement", muscleGroups: ["triceps", "chest", "shoulders"], instructions: "Lower until shoulders are below elbows", restTime: 120 },
      { name: "Romanian Deadlift", description: "Hamstring focused movement", muscleGroups: ["hamstrings", "glutes"], instructions: "Focus on hip hinge movement", restTime: 150 },
      { name: "Incline Bench Press", description: "Upper chest movement", muscleGroups: ["chest", "triceps", "shoulders"], instructions: "45 degree incline", restTime: 180 },
      { name: "Box Jumps", description: "Plyometric exercise", muscleGroups: ["quadriceps", "glutes", "calves"], instructions: "Land softly on the box", restTime: 90 },
      { name: "Bulgarian Split Squats", description: "Single leg strength", muscleGroups: ["quadriceps", "glutes"], instructions: "Keep most weight on front leg", restTime: 120 }
    ];

    defaultExercises.forEach(exercise => {
      this.exercises.set(this.currentExerciseId, { ...exercise, id: this.currentExerciseId });
      this.currentExerciseId++;
    });

    // Initialize workout programs
    const defaultPrograms: Omit<WorkoutProgram, 'id'>[] = [
      {
        name: "Upper A - Force",
        description: "Focus on compound movements with heavy weights. Build maximum strength.",
        type: "force",
        targetMuscles: "Upper body",
        estimatedDuration: 50,
        exercises: ["1", "4", "5", "6", "7", "9"] // Bench, OHP, Row, Pull-ups, Dips, Incline
      },
      {
        name: "Lower A - Force", 
        description: "Heavy squats and deadlifts. Maximum lower body strength development.",
        type: "force",
        targetMuscles: "Lower body",
        estimatedDuration: 55,
        exercises: ["2", "3", "8", "11"] // Squat, Deadlift, RDL, Bulgarian Split
      },
      {
        name: "Upper B - Volume",
        description: "Higher rep ranges for muscle growth and endurance. Pump focused.",
        type: "volume", 
        targetMuscles: "Upper body",
        estimatedDuration: 65,
        exercises: ["1", "4", "5", "6", "7", "9"] // Same as Upper A but different rep ranges
      },
      {
        name: "Lower B - Explosivity",
        description: "Power and speed focused. Plyometrics and explosive movements.",
        type: "explosivity",
        targetMuscles: "Lower body", 
        estimatedDuration: 45,
        exercises: ["2", "10", "11", "8"] // Squat, Box Jumps, Bulgarian Split, RDL
      }
    ];

    defaultPrograms.forEach(program => {
      this.workoutPrograms.set(this.currentProgramId, { ...program, id: this.currentProgramId });
      this.currentProgramId++;
    });

    // Initialize badges
    const defaultBadges: Omit<Badge, 'id'>[] = [
      { name: "First Steps", description: "Complete your first workout", icon: "dumbbell", criteria: "complete_first_workout", xpReward: 50 },
      { name: "Week Warrior", description: "Complete 4 workouts in a week", icon: "fire", criteria: "4_workouts_week", xpReward: 100 },
      { name: "Consistent", description: "Maintain a 10 day streak", icon: "medal", criteria: "10_day_streak", xpReward: 150 },
      { name: "Goal Getter", description: "Set a new personal record", icon: "target", criteria: "new_personal_record", xpReward: 75 },
      { name: "Progress", description: "Track 20 workouts", icon: "chart-line", criteria: "20_workouts_tracked", xpReward: 125 },
      { name: "Strong", description: "Lift 1000+ lbs total in one session", icon: "trophy", criteria: "1000_lbs_session", xpReward: 200 }
    ];

    defaultBadges.forEach(badge => {
      this.badges.set(this.currentBadgeId, { ...badge, id: this.currentBadgeId });
      this.currentBadgeId++;
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const user: User = { 
      ...insertUser, 
      id: this.currentUserId++,
      level: 1,
      xp: 0,
      streak: 0,
      createdAt: new Date()
    };
    this.users.set(user.id, user);
    return user;
  }

  async updateUserXpAndLevel(id: number, xp: number, level: number): Promise<User> {
    const user = this.users.get(id);
    if (!user) throw new Error("User not found");
    
    const updatedUser = { ...user, xp, level };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async updateUserStreak(id: number, streak: number): Promise<User> {
    const user = this.users.get(id);
    if (!user) throw new Error("User not found");
    
    const updatedUser = { ...user, streak };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Exercise methods
  async getAllExercises(): Promise<Exercise[]> {
    return Array.from(this.exercises.values());
  }

  async getExercise(id: number): Promise<Exercise | undefined> {
    return this.exercises.get(id);
  }

  // Workout Program methods
  async getAllWorkoutPrograms(): Promise<WorkoutProgram[]> {
    return Array.from(this.workoutPrograms.values());
  }

  async getWorkoutProgram(id: number): Promise<WorkoutProgram | undefined> {
    return this.workoutPrograms.get(id);
  }

  // Workout Session methods
  async createWorkoutSession(insertSession: InsertWorkoutSession): Promise<WorkoutSession> {
    const session: WorkoutSession = {
      ...insertSession,
      id: this.currentSessionId++,
      startTime: new Date(),
      endTime: null,
      status: "active",
      totalVolume: 0,
      averageRpe: null
    };
    this.workoutSessions.set(session.id, session);
    return session;
  }

  async getWorkoutSession(id: number): Promise<WorkoutSession | undefined> {
    return this.workoutSessions.get(id);
  }

  async getUserWorkoutSessions(userId: number): Promise<WorkoutSession[]> {
    return Array.from(this.workoutSessions.values()).filter(session => session.userId === userId);
  }

  async updateWorkoutSession(id: number, updates: Partial<WorkoutSession>): Promise<WorkoutSession> {
    const session = this.workoutSessions.get(id);
    if (!session) throw new Error("Session not found");
    
    const updatedSession = { ...session, ...updates };
    this.workoutSessions.set(id, updatedSession);
    return updatedSession;
  }

  // Workout Set methods
  async createWorkoutSet(insertSet: InsertWorkoutSet): Promise<WorkoutSet> {
    const set: WorkoutSet = {
      ...insertSet,
      id: this.currentSetId++,
      completedAt: new Date()
    };
    this.workoutSets.set(set.id, set);
    return set;
  }

  async getSessionSets(sessionId: number): Promise<WorkoutSet[]> {
    return Array.from(this.workoutSets.values()).filter(set => set.sessionId === sessionId);
  }

  // Badge methods
  async getAllBadges(): Promise<Badge[]> {
    return Array.from(this.badges.values());
  }

  async getUserBadges(userId: number): Promise<UserBadge[]> {
    return Array.from(this.userBadges.values()).filter(userBadge => userBadge.userId === userId);
  }

  async awardBadge(userId: number, badgeId: number): Promise<UserBadge> {
    const userBadge: UserBadge = {
      id: this.currentUserBadgeId++,
      userId,
      badgeId,
      earnedAt: new Date()
    };
    this.userBadges.set(userBadge.id, userBadge);
    return userBadge;
  }

  // Personal Record methods
  async getUserPersonalRecords(userId: number): Promise<PersonalRecord[]> {
    return Array.from(this.personalRecords.values()).filter(record => record.userId === userId);
  }

  async createPersonalRecord(insertRecord: InsertPersonalRecord): Promise<PersonalRecord> {
    const record: PersonalRecord = {
      ...insertRecord,
      id: this.currentRecordId++,
      achievedAt: new Date()
    };
    this.personalRecords.set(record.id, record);
    return record;
  }

  async getExercisePersonalRecord(userId: number, exerciseId: number): Promise<PersonalRecord | undefined> {
    return Array.from(this.personalRecords.values()).find(
      record => record.userId === userId && record.exerciseId === exerciseId
    );
  }

  async getUserExerciseHistory(userId: number, exerciseId: number, limit: number = 10): Promise<WorkoutSet[]> {
    // Get user's workout sessions
    const userSessions = Array.from(this.workoutSessions.values())
      .filter(session => session.userId === userId)
      .sort((a, b) => new Date(b.startTime!).getTime() - new Date(a.startTime!).getTime());

    // Get sets for the specific exercise from these sessions
    const exerciseSets = Array.from(this.workoutSets.values())
      .filter(set => {
        const sessionExists = userSessions.some(session => session.id === set.sessionId);
        return sessionExists && set.exerciseId === exerciseId;
      })
      .sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime())
      .slice(0, limit);

    return exerciseSets;
  }
}

export const storage = new MemStorage();
