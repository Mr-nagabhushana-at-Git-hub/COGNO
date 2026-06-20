import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertTaskSchema, 
  insertFocusSessionSchema, 
  insertBrainGameScoreSchema, 
  insertFitnessDataSchema,
  insertNotificationSchema
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  const DEMO_USER_ID = "demo-user";

  // Task routes
  app.get("/api/tasks", async (req, res) => {
    try {
      const tasks = await storage.getTasks(DEMO_USER_ID);
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch tasks" });
    }
  });

  app.get("/api/tasks/category/:category", async (req, res) => {
    try {
      const { category } = req.params;
      const tasks = await storage.getTasksByCategory(DEMO_USER_ID, category);
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch tasks by category" });
    }
  });

  app.post("/api/tasks", async (req, res) => {
    try {
      const taskData = insertTaskSchema.parse({ ...req.body, userId: DEMO_USER_ID });
      const task = await storage.createTask(taskData);
      res.status(201).json(task);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid task data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create task" });
      }
    }
  });

  app.patch("/api/tasks/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const task = await storage.updateTask(id, DEMO_USER_ID, updateData);
      if (!task) {
        res.status(404).json({ error: "Task not found" });
        return;
      }
      res.json(task);
    } catch (error) {
      res.status(500).json({ error: "Failed to update task" });
    }
  });

  app.delete("/api/tasks/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteTask(id, DEMO_USER_ID);
      if (!success) {
        res.status(404).json({ error: "Task not found" });
        return;
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete task" });
    }
  });

  // Focus session routes
  app.get("/api/focus-sessions", async (req, res) => {
    try {
      const sessions = await storage.getFocusSessions(DEMO_USER_ID);
      res.json(sessions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch focus sessions" });
    }
  });

  app.get("/api/focus-sessions/active", async (req, res) => {
    try {
      const session = await storage.getActiveFocusSession(DEMO_USER_ID);
      res.json(session);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch active focus session" });
    }
  });

  app.post("/api/focus-sessions", async (req, res) => {
    try {
      const sessionData = insertFocusSessionSchema.parse({ ...req.body, userId: DEMO_USER_ID });
      const session = await storage.createFocusSession(sessionData);
      res.status(201).json(session);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid session data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create focus session" });
      }
    }
  });

  app.patch("/api/focus-sessions/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const session = await storage.updateFocusSession(id, DEMO_USER_ID, updateData);
      if (!session) {
        res.status(404).json({ error: "Focus session not found" });
        return;
      }
      res.json(session);
    } catch (error) {
      res.status(500).json({ error: "Failed to update focus session" });
    }
  });

  // Brain game routes
  app.get("/api/brain-games/scores", async (req, res) => {
    try {
      const { gameType } = req.query;
      const scores = await storage.getBrainGameScores(DEMO_USER_ID, gameType as string);
      res.json(scores);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch brain game scores" });
    }
  });

  app.get("/api/brain-games/top-scores/:gameType", async (req, res) => {
    try {
      const { gameType } = req.params;
      const limit = parseInt(req.query.limit as string) || 10;
      const scores = await storage.getTopScores(DEMO_USER_ID, gameType, limit);
      res.json(scores);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch top scores" });
    }
  });

  app.post("/api/brain-games/scores", async (req, res) => {
    try {
      const scoreData = insertBrainGameScoreSchema.parse({ ...req.body, userId: DEMO_USER_ID });
      const score = await storage.createBrainGameScore(scoreData);
      res.status(201).json(score);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid score data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create brain game score" });
      }
    }
  });

  // Fitness routes
  app.get("/api/fitness", async (req, res) => {
    try {
      const { date } = req.query;
      const targetDate = date ? new Date(date as string) : undefined;
      const fitnessData = await storage.getFitnessData(DEMO_USER_ID, targetDate);
      res.json(fitnessData);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch fitness data" });
    }
  });

  app.post("/api/fitness", async (req, res) => {
    try {
      const fitnessData = insertFitnessDataSchema.parse({ ...req.body, userId: DEMO_USER_ID });
      const data = await storage.createFitnessData(fitnessData);
      res.status(201).json(data);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid fitness data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create fitness data" });
      }
    }
  });

  app.patch("/api/fitness", async (req, res) => {
    try {
      const { date, ...updateData } = req.body;
      const targetDate = new Date(date);
      const data = await storage.updateFitnessData(DEMO_USER_ID, targetDate, updateData);
      if (!data) {
        res.status(404).json({ error: "Fitness data not found for date" });
        return;
      }
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: "Failed to update fitness data" });
    }
  });

  // Notification routes
  app.get("/api/notifications", async (req, res) => {
    try {
      const notifications = await storage.getNotifications(DEMO_USER_ID);
      res.json(notifications);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch notifications" });
    }
  });

  app.get("/api/notifications/unread", async (req, res) => {
    try {
      const notifications = await storage.getUnreadNotifications(DEMO_USER_ID);
      res.json(notifications);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch unread notifications" });
    }
  });

  app.post("/api/notifications", async (req, res) => {
    try {
      const notificationData = insertNotificationSchema.parse({ ...req.body, userId: DEMO_USER_ID });
      const notification = await storage.createNotification(notificationData);
      res.status(201).json(notification);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid notification data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create notification" });
      }
    }
  });

  app.patch("/api/notifications/:id/read", async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.markNotificationRead(id, DEMO_USER_ID);
      if (!success) {
        res.status(404).json({ error: "Notification not found" });
        return;
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to mark notification as read" });
    }
  });

  // Analytics endpoint
  app.get("/api/analytics", async (req, res) => {
    try {
      const tasks = await storage.getTasks(DEMO_USER_ID);
      const focusSessions = await storage.getFocusSessions(DEMO_USER_ID);
      const brainScores = await storage.getBrainGameScores(DEMO_USER_ID);
      const fitnessData = await storage.getFitnessData(DEMO_USER_ID);
      
      const today = new Date();
      const todayStr = today.toDateString();
      
      const todayTasks = tasks.filter(task => task.createdAt?.toDateString() === todayStr);
      const completedTasks = todayTasks.filter(task => task.completed);
      const todayFocus = focusSessions.filter(session => session.createdAt?.toDateString() === todayStr);
      const todayFitness = fitnessData.find(data => data.date?.toDateString() === todayStr);
      
      const totalFocusTime = todayFocus.reduce((total, session) => total + (session.completedDuration || 0), 0);
      
      const analytics = {
        tasksToday: todayTasks.length,
        tasksCompleted: completedTasks.length,
        focusTimeMinutes: totalFocusTime,
        brainGamesPlayed: brainScores.filter(score => score.createdAt?.toDateString() === todayStr).length,
        steps: todayFitness?.steps || 0,
        exerciseMinutes: todayFitness?.exerciseMinutes || 0,
        completionRate: todayTasks.length > 0 ? Math.round((completedTasks.length / todayTasks.length) * 100) : 0,
        weeklyTrend: {
          focusTime: Array.from({length: 7}, (_, i) => Math.floor(Math.random() * 120 + 60)), // Mock weekly data
          tasksCompleted: Array.from({length: 7}, (_, i) => Math.floor(Math.random() * 10 + 3))
        }
      };
      
      res.json(analytics);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch analytics" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
