import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  name: text("name").notNull(),
  level: integer("level").default(1),
  xp: integer("xp").default(0),
  streak: integer("streak").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const workoutPrograms = pgTable("workout_programs", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  type: text("type").notNull(), // 'force', 'volume', 'explosivity'
  targetMuscles: text("target_muscles").notNull(),
  estimatedDuration: integer("estimated_duration"), // in minutes
  exercises: json("exercises").$type<string[]>(),
});

export const exercises = pgTable("exercises", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  muscleGroups: text("muscle_groups").array(),
  instructions: text("instructions"),
  restTime: integer("rest_time").default(180), // in seconds
});

export const workoutSessions = pgTable("workout_sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  programId: integer("program_id").references(() => workoutPrograms.id),
  startTime: timestamp("start_time").defaultNow(),
  endTime: timestamp("end_time"),
  status: text("status").default("active"), // 'active', 'completed', 'cancelled'
  totalVolume: integer("total_volume").default(0),
  averageRpe: integer("average_rpe"),
});

export const workoutSets = pgTable("workout_sets", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").references(() => workoutSessions.id),
  exerciseId: integer("exercise_id").references(() => exercises.id),
  setNumber: integer("set_number"),
  weight: integer("weight"),
  reps: integer("reps"),
  rpe: integer("rpe"),
  restTime: integer("rest_time"),
  completedAt: timestamp("completed_at").defaultNow(),
});

export const badges = pgTable("badges", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull(),
  criteria: text("criteria").notNull(),
  xpReward: integer("xp_reward").default(0),
});

export const userBadges = pgTable("user_badges", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  badgeId: integer("badge_id").references(() => badges.id),
  earnedAt: timestamp("earned_at").defaultNow(),
});

export const personalRecords = pgTable("personal_records", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  exerciseId: integer("exercise_id").references(() => exercises.id),
  weight: integer("weight"),
  reps: integer("reps"),
  recordType: text("record_type").notNull(), // '1RM', 'volume', 'endurance'
  achievedAt: timestamp("achieved_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  name: true,
});

export const insertWorkoutSessionSchema = createInsertSchema(workoutSessions).pick({
  userId: true,
  programId: true,
});

export const insertWorkoutSetSchema = createInsertSchema(workoutSets).pick({
  sessionId: true,
  exerciseId: true,
  setNumber: true,
  weight: true,
  reps: true,
  rpe: true,
  restTime: true,
});

export const insertPersonalRecordSchema = createInsertSchema(personalRecords).pick({
  userId: true,
  exerciseId: true,
  weight: true,
  reps: true,
  recordType: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type WorkoutProgram = typeof workoutPrograms.$inferSelect;
export type Exercise = typeof exercises.$inferSelect;
export type WorkoutSession = typeof workoutSessions.$inferSelect;
export type WorkoutSet = typeof workoutSets.$inferSelect;
export type InsertWorkoutSession = z.infer<typeof insertWorkoutSessionSchema>;
export type InsertWorkoutSet = z.infer<typeof insertWorkoutSetSchema>;
export type Badge = typeof badges.$inferSelect;
export type UserBadge = typeof userBadges.$inferSelect;
export type PersonalRecord = typeof personalRecords.$inferSelect;
export type InsertPersonalRecord = z.infer<typeof insertPersonalRecordSchema>;
