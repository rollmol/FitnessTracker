// server/storage.ts - Version Supabase
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { eq, desc, and, sql, inArray } from 'drizzle-orm';
import { 
  users, exercises, workoutPrograms, workoutSessions, workoutSets, badges, userBadges, personalRecords,
  type User, type InsertUser, type Exercise, type WorkoutProgram, type WorkoutSession, 
  type WorkoutSet, type InsertWorkoutSession, type InsertWorkoutSet, type Badge, 
  type UserBadge, type PersonalRecord, type InsertPersonalRecord
} from "@shared/schema";

// Configuration de la base de données
const connectionString = process.env.DATABASE_URL!;

if (!connectionString) {
  throw new Error('DATABASE_URL is not defined in environment variables');
}

// Configuration optimisée pour Supabase pooler
const client = postgres(connectionString, {
  ssl: 'require',
  max: 1,
  idle_timeout: 20,
  connect_timeout: 10,
  prepare: false,
  // Forcer IPv4 si nécessaire
  host_type: 'tcp',
  transform: {
    undefined: null
  }
});

const db = drizzle(client);

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

export class SupabaseStorage implements IStorage {
  
  // ==========================================
  // USERS
  // ==========================================
  
  async getUser(id: number): Promise<User | undefined> {
    try {
      const [user] = await db.select().from(users).where(eq(users.id, id));
      return user;
    } catch (error) {
      console.error('Error getting user:', error);
      return undefined;
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      const [user] = await db.select().from(users).where(eq(users.username, username));
      return user;
    } catch (error) {
      console.error('Error getting user by username:', error);
      return undefined;
    }
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    try {
      const [user] = await db.insert(users).values({
        username: insertUser.username,
        name: insertUser.name,
        level: 1,
        xp: 0,
        streak: 0
      }).returning();
      return user;
    } catch (error) {
      console.error('Error creating user:', error);
      throw new Error('Failed to create user');
    }
  }

  async updateUserXpAndLevel(id: number, xp: number, level: number): Promise<User> {
    try {
      const [user] = await db.update(users)
        .set({ xp, level })
        .where(eq(users.id, id))
        .returning();
      
      if (!user) throw new Error("User not found");
      return user;
    } catch (error) {
      console.error('Error updating user XP and level:', error);
      throw new Error('Failed to update user');
    }
  }

  async updateUserStreak(id: number, streak: number): Promise<User> {
    try {
      const [user] = await db.update(users)
        .set({ streak })
        .where(eq(users.id, id))
        .returning();
      
      if (!user) throw new Error("User not found");
      return user;
    } catch (error) {
      console.error('Error updating user streak:', error);
      throw new Error('Failed to update user streak');
    }
  }

  // ==========================================
  // EXERCISES
  // ==========================================

  async getAllExercises(): Promise<Exercise[]> {
    try {
      return await db.select().from(exercises).orderBy(exercises.name);
    } catch (error) {
      console.error('Error getting all exercises:', error);
      return [];
    }
  }

  async getExercise(id: number): Promise<Exercise | undefined> {
    try {
      const [exercise] = await db.select().from(exercises).where(eq(exercises.id, id));
      return exercise;
    } catch (error) {
      console.error('Error getting exercise:', error);
      return undefined;
    }
  }

  // ==========================================
  // WORKOUT PROGRAMS
  // ==========================================

  async getAllWorkoutPrograms(): Promise<WorkoutProgram[]> {
    try {
      return await db.select().from(workoutPrograms).orderBy(workoutPrograms.name);
    } catch (error) {
      console.error('Error getting all workout programs:', error);
      return [];
    }
  }

  async getWorkoutProgram(id: number): Promise<WorkoutProgram | undefined> {
    try {
      const [program] = await db.select().from(workoutPrograms).where(eq(workoutPrograms.id, id));
      return program;
    } catch (error) {
      console.error('Error getting workout program:', error);
      return undefined;
    }
  }

  // ==========================================
  // WORKOUT SESSIONS
  // ==========================================

  async createWorkoutSession(insertSession: InsertWorkoutSession): Promise<WorkoutSession> {
    try {
      const [session] = await db.insert(workoutSessions).values({
        userId: insertSession.userId || null,
        programId: insertSession.programId || null,
        startTime: new Date(),
        endTime: null,
        status: "active",
        totalVolume: 0,
        averageRpe: null
      }).returning();
      return session;
    } catch (error) {
      console.error('Error creating workout session:', error);
      throw new Error('Failed to create workout session');
    }
  }

  async getWorkoutSession(id: number): Promise<WorkoutSession | undefined> {
    try {
      const [session] = await db.select().from(workoutSessions).where(eq(workoutSessions.id, id));
      return session;
    } catch (error) {
      console.error('Error getting workout session:', error);
      return undefined;
    }
  }

  async getUserWorkoutSessions(userId: number): Promise<WorkoutSession[]> {
    try {
      return await db.select().from(workoutSessions)
        .where(eq(workoutSessions.userId, userId))
        .orderBy(desc(workoutSessions.startTime));
    } catch (error) {
      console.error('Error getting user workout sessions:', error);
      return [];
    }
  }

  async updateWorkoutSession(id: number, updates: Partial<WorkoutSession>): Promise<WorkoutSession> {
    try {
      const [session] = await db.update(workoutSessions)
        .set(updates)
        .where(eq(workoutSessions.id, id))
        .returning();
      
      if (!session) throw new Error("Session not found");
      return session;
    } catch (error) {
      console.error('Error updating workout session:', error);
      throw new Error('Failed to update workout session');
    }
  }

  // ==========================================
  // WORKOUT SETS
  // ==========================================

  async createWorkoutSet(insertSet: InsertWorkoutSet): Promise<WorkoutSet> {
    try {
      const [set] = await db.insert(workoutSets).values({
        sessionId: insertSet.sessionId || null,
        exerciseId: insertSet.exerciseId || null,
        setNumber: insertSet.setNumber || null,
        weight: insertSet.weight || null,
        reps: insertSet.reps || null,
        rpe: insertSet.rpe || null,
        restTime: insertSet.restTime || null,
        completedAt: new Date()
      }).returning();
      return set;
    } catch (error) {
      console.error('Error creating workout set:', error);
      throw new Error('Failed to create workout set');
    }
  }

  async getSessionSets(sessionId: number): Promise<WorkoutSet[]> {
    try {
      return await db.select().from(workoutSets)
        .where(eq(workoutSets.sessionId, sessionId))
        .orderBy(workoutSets.setNumber);
    } catch (error) {
      console.error('Error getting session sets:', error);
      return [];
    }
  }

  // ==========================================
  // BADGES
  // ==========================================

  async getAllBadges(): Promise<Badge[]> {
    try {
      return await db.select().from(badges).orderBy(badges.name);
    } catch (error) {
      console.error('Error getting all badges:', error);
      return [];
    }
  }

  async getUserBadges(userId: number): Promise<UserBadge[]> {
    try {
      return await db.select().from(userBadges)
        .where(eq(userBadges.userId, userId))
        .orderBy(desc(userBadges.earnedAt));
    } catch (error) {
      console.error('Error getting user badges:', error);
      return [];
    }
  }

  async awardBadge(userId: number, badgeId: number): Promise<UserBadge> {
    try {
      const [userBadge] = await db.insert(userBadges).values({
        userId,
        badgeId,
        earnedAt: new Date()
      }).returning();
      return userBadge;
    } catch (error) {
      console.error('Error awarding badge:', error);
      throw new Error('Failed to award badge');
    }
  }

  // ==========================================
  // PERSONAL RECORDS
  // ==========================================

  async getUserPersonalRecords(userId: number): Promise<PersonalRecord[]> {
    try {
      return await db.select().from(personalRecords)
        .where(eq(personalRecords.userId, userId))
        .orderBy(desc(personalRecords.achievedAt));
    } catch (error) {
      console.error('Error getting user personal records:', error);
      return [];
    }
  }

  async createPersonalRecord(insertRecord: InsertPersonalRecord): Promise<PersonalRecord> {
    try {
      const [record] = await db.insert(personalRecords).values({
        userId: insertRecord.userId || null,
        exerciseId: insertRecord.exerciseId || null,
        weight: insertRecord.weight || null,
        reps: insertRecord.reps || null,
        recordType: insertRecord.recordType || "max",
        achievedAt: new Date()
      }).returning();
      return record;
    } catch (error) {
      console.error('Error creating personal record:', error);
      throw new Error('Failed to create personal record');
    }
  }

  async getExercisePersonalRecord(userId: number, exerciseId: number): Promise<PersonalRecord | undefined> {
    try {
      const [record] = await db.select().from(personalRecords)
        .where(and(
          eq(personalRecords.userId, userId),
          eq(personalRecords.exerciseId, exerciseId)
        ))
        .orderBy(desc(personalRecords.achievedAt));
      return record;
    } catch (error) {
      console.error('Error getting exercise personal record:', error);
      return undefined;
    }
  }

  // ==========================================
  // EXERCISE HISTORY
  // ==========================================

async getUserExerciseHistory(userId: number, exerciseId: number, limit: number = 10): Promise<WorkoutSet[]> {
  try {
    // Récupérer les sessions de l'utilisateur
    const userSessions = await db.select({ id: workoutSessions.id })
      .from(workoutSessions)
      .where(eq(workoutSessions.userId, userId));

    if (userSessions.length === 0) return [];

    const sessionIds = userSessions.map(s => s.id);

    // ✅ CORRECTIF : Utiliser inArray de Drizzle (plus propre)
    const exerciseSets = await db.select().from(workoutSets)
      .where(and(
        eq(workoutSets.exerciseId, exerciseId),
        inArray(workoutSets.sessionId, sessionIds) // ✅ Solution Drizzle native
      ))
      .orderBy(desc(workoutSets.completedAt))
      .limit(limit);

    return exerciseSets;
  } catch (error) {
    console.error('Error getting user exercise history:', error);
    return [];
  }
}

  // ==========================================
  // INITIALISATION DES DONNÉES (SEEDING)
  // ==========================================

  async initializeData(): Promise<void> {
    try {
      console.log('🌱 Initializing default data...');

      // Vérifier si des exercices existent déjà
      const existingExercises = await this.getAllExercises();
      if (existingExercises.length > 0) {
        console.log('✅ Data already initialized');
        return;
      }

      // Exercices par défaut (repris de ton MemStorage)
      const defaultExercises = [
        { name: "Développé couché", description: "Mouvement composé pour les pectoraux", muscleGroups: ["pectoraux", "triceps", "épaules"], instructions: "Gardez votre core serré et contrôlez la descente", restTime: 180 },
        { name: "Squat", description: "Mouvement composé pour le bas du corps", muscleGroups: ["quadriceps", "fessiers", "ischio-jambiers"], instructions: "Gardez vos genoux alignés avec vos orteils", restTime: 180 },
        { name: "Soulevé de terre", description: "Mouvement composé corps entier", muscleGroups: ["ischio-jambiers", "fessiers", "dos"], instructions: "Gardez la barre près de votre corps", restTime: 240 },
        { name: "Développé militaire", description: "Mouvement composé pour les épaules", muscleGroups: ["épaules", "triceps", "core"], instructions: "Gardez votre core contracté", restTime: 150 },
        { name: "Rowing barre", description: "Mouvement composé pour le dos", muscleGroups: ["dos", "biceps"], instructions: "Tirez vers la poitrine basse", restTime: 150 },
        { name: "Tractions", description: "Exercice au poids du corps", muscleGroups: ["dos", "biceps"], instructions: "Amplitude complète de mouvement", restTime: 120 },
        { name: "Dips", description: "Mouvement composé pour les triceps", muscleGroups: ["triceps", "pectoraux", "épaules"], instructions: "Descendez jusqu'à ce que les épaules soient sous les coudes", restTime: 120 },
        { name: "Soulevé de terre roumain", description: "Mouvement ciblant les ischio-jambiers", muscleGroups: ["ischio-jambiers", "fessiers"], instructions: "Concentrez-vous sur la flexion de hanche", restTime: 150 },
        { name: "Développé incliné", description: "Mouvement pour le haut des pectoraux", muscleGroups: ["pectoraux", "triceps", "épaules"], instructions: "Inclinaison à 45 degrés", restTime: 180 },
        { name: "Box jumps", description: "Exercice pliométrique", muscleGroups: ["quadriceps", "fessiers", "mollets"], instructions: "Atterrissez en douceur sur la boîte", restTime: 90 },
        { name: "Fentes bulgares", description: "Force sur une jambe", muscleGroups: ["quadriceps", "fessiers"], instructions: "Gardez le poids sur la jambe avant", restTime: 120 }
      ];

      // Insérer les exercices
      for (const exercise of defaultExercises) {
        await db.insert(exercises).values(exercise);
      }

      // Programmes d'entraînement par défaut
      const defaultPrograms = [
        {
          name: "Haut du corps A - Force",
          description: "Focus sur les mouvements composés avec charges lourdes. Développement de la force maximale.",
          type: "force",
          targetMuscles: "Haut du corps",
          estimatedDuration: 50,
          exercises: ["1", "4", "5", "6", "7", "9"] // IDs des exercices
        },
        {
          name: "Bas du corps A - Force", 
          description: "Squats et soulevés de terre lourds. Développement maximal de la force du bas du corps.",
          type: "force",
          targetMuscles: "Bas du corps",
          estimatedDuration: 55,
          exercises: ["2", "3", "8", "11"]
        },
        {
          name: "Haut du corps B - Volume",
          description: "Séries plus longues pour la croissance musculaire et l'endurance. Focus congestion.",
          type: "volume", 
          targetMuscles: "Haut du corps",
          estimatedDuration: 65,
          exercises: ["1", "4", "5", "6", "7", "9"]
        },
        {
          name: "Bas du corps B - Explosivité",
          description: "Focus sur la puissance et la vitesse. Pliométrie et mouvements explosifs.",
          type: "explosivity",
          targetMuscles: "Bas du corps", 
          estimatedDuration: 45,
          exercises: ["2", "10", "11", "8"]
        }
      ];

      // Insérer les programmes
      for (const program of defaultPrograms) {
        await db.insert(workoutPrograms).values(program);
      }

      // Badges par défaut
      const defaultBadges = [
        { name: "Premiers pas", description: "Complétez votre premier entraînement", icon: "dumbbell", criteria: "complete_first_workout", xpReward: 50 },
        { name: "Guerrier de la semaine", description: "Complétez 4 entraînements en une semaine", icon: "fire", criteria: "4_workouts_week", xpReward: 100 },
        { name: "Régulier", description: "Maintenez une série de 10 jours", icon: "medal", criteria: "10_day_streak", xpReward: 150 },
        { name: "Atteigneur d'objectifs", description: "Établissez un nouveau record personnel", icon: "target", criteria: "new_personal_record", xpReward: 75 },
        { name: "Progrès", description: "Suivez 20 entraînements", icon: "chart-line", criteria: "20_workouts_tracked", xpReward: 125 },
        { name: "Fort", description: "Soulevez plus de 450kg au total en une séance", icon: "trophy", criteria: "450kg_session", xpReward: 200 }
      ];

      // Insérer les badges
      for (const badge of defaultBadges) {
        await db.insert(badges).values(badge);
      }

      console.log('✅ Default data initialized successfully!');
    } catch (error) {
      console.error('❌ Error initializing data:', error);
      throw error;
    }
  }
}

// Instance singleton - remplace le MemStorage
export const storage = new SupabaseStorage();