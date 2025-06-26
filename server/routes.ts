import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertWorkoutSessionSchema, insertWorkoutSetSchema, insertPersonalRecordSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // User routes
  app.post("/api/users", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      res.json(user);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const user = await storage.getUser(id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/users/:id/xp", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { xp, level } = req.body;
      const user = await storage.updateUserXpAndLevel(id, xp, level);
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/users/:id/streak", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { streak } = req.body;
      const user = await storage.updateUserStreak(id, streak);
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Exercise routes
  app.get("/api/exercises", async (req, res) => {
    try {
      const exercises = await storage.getAllExercises();
      res.json(exercises);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/exercises/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const exercise = await storage.getExercise(id);
      if (!exercise) {
        return res.status(404).json({ error: "Exercise not found" });
      }
      res.json(exercise);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Workout Program routes
  app.get("/api/workout-programs", async (req, res) => {
    try {
      const programs = await storage.getAllWorkoutPrograms();
      res.json(programs);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/workout-programs/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const program = await storage.getWorkoutProgram(id);
      if (!program) {
        return res.status(404).json({ error: "Workout program not found" });
      }
      res.json(program);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Workout Session routes
  app.post("/api/workout-sessions", async (req, res) => {
    try {
      const sessionData = insertWorkoutSessionSchema.parse(req.body);
      const session = await storage.createWorkoutSession(sessionData);
      res.json(session);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/workout-sessions/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const session = await storage.getWorkoutSession(id);
      if (!session) {
        return res.status(404).json({ error: "Workout session not found" });
      }
      res.json(session);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/users/:userId/workout-sessions", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const sessions = await storage.getUserWorkoutSessions(userId);
      res.json(sessions);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/workout-sessions/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const session = await storage.updateWorkoutSession(id, updates);
      res.json(session);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Workout Set routes
  app.post("/api/workout-sets", async (req, res) => {
    try {
      const setData = insertWorkoutSetSchema.parse(req.body);
      const set = await storage.createWorkoutSet(setData);
      res.json(set);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/workout-sessions/:sessionId/sets", async (req, res) => {
    try {
      const sessionId = parseInt(req.params.sessionId);
      const sets = await storage.getSessionSets(sessionId);
      res.json(sets);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Badge routes
  app.get("/api/badges", async (req, res) => {
    try {
      const badges = await storage.getAllBadges();
      res.json(badges);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/users/:userId/badges", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const userBadges = await storage.getUserBadges(userId);
      res.json(userBadges);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/users/:userId/badges/:badgeId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const badgeId = parseInt(req.params.badgeId);
      const userBadge = await storage.awardBadge(userId, badgeId);
      res.json(userBadge);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Personal Record routes
  app.get("/api/users/:userId/personal-records", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const records = await storage.getUserPersonalRecords(userId);
      res.json(records);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/personal-records", async (req, res) => {
    try {
      const recordData = insertPersonalRecordSchema.parse(req.body);
      const record = await storage.createPersonalRecord(recordData);
      res.json(record);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  // Dashboard stats
  app.get("/api/users/:userId/stats", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const sessions = await storage.getUserWorkoutSessions(userId);
      const user = await storage.getUser(userId);
      const userBadges = await storage.getUserBadges(userId);
      
      const now = new Date();
      const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      
      const thisWeekSessions = sessions.filter(s => 
        s.startTime && new Date(s.startTime) >= weekStart
      );
      
      const totalVolume = sessions.reduce((sum, s) => sum + (s.totalVolume || 0), 0);
      
      const stats = {
        weeklyWorkouts: thisWeekSessions.length,
        currentStreak: user?.streak || 0,
        totalWorkouts: sessions.filter(s => s.status === 'completed').length,
        totalVolume: Math.round(totalVolume / 1000 * 10) / 10, // Convert to K format
        badgeCount: userBadges.length,
        level: user?.level || 1,
        xp: user?.xp || 0
      };
      
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  // Get exercise history for RPE-based suggestions
  app.get("/api/users/:userId/exercises/:exerciseId/history", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const exerciseId = parseInt(req.params.exerciseId);
      const limit = parseInt(req.query.limit as string) || 10;
      
      const history = await storage.getUserExerciseHistory(userId, exerciseId, limit);
      res.json(history);
    } catch (error) {
      console.error("Error fetching exercise history:", error);
      res.status(500).json({ error: "Failed to fetch exercise history" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
