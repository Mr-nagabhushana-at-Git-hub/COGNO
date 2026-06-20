import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").defaultNow()
});

export const tasks = pgTable("tasks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  title: text("title").notNull(),
  description: text("description"),
  category: text("category").notNull(), // 'important-urgent', 'important-not-urgent', 'not-important-urgent', 'not-important-not-urgent'
  completed: boolean("completed").default(false),
  priority: integer("priority").default(1), // 1-5 priority scale
  dueDate: timestamp("due_date"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

export const focusSessions = pgTable("focus_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  taskId: varchar("task_id").references(() => tasks.id),
  type: text("type").notNull(), // 'pomodoro', 'deep-work', 'custom'
  duration: integer("duration").notNull(), // in minutes
  completedDuration: integer("completed_duration").default(0),
  isActive: boolean("is_active").default(false),
  completed: boolean("completed").default(false),
  startTime: timestamp("start_time"),
  endTime: timestamp("end_time"),
  createdAt: timestamp("created_at").defaultNow()
});

export const brainGameScores = pgTable("brain_game_scores", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  gameType: text("game_type").notNull(), // 'memory', 'logic', 'pattern'
  score: integer("score").notNull(),
  level: integer("level").default(1),
  duration: integer("duration"), // in seconds
  createdAt: timestamp("created_at").defaultNow()
});

export const fitnessData = pgTable("fitness_data", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  date: timestamp("date").defaultNow(),
  steps: integer("steps").default(0),
  exerciseMinutes: integer("exercise_minutes").default(0),
  workoutType: text("workout_type"), // 'cardio', 'strength', 'yoga', etc.
  caloriesBurned: integer("calories_burned").default(0)
});

export const notifications = pgTable("notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: text("type").notNull(), // 'task', 'focus', 'break', 'achievement'
  read: boolean("read").default(false),
  createdAt: timestamp("created_at").defaultNow()
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true
});

export const insertTaskSchema = createInsertSchema(tasks).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertFocusSessionSchema = createInsertSchema(focusSessions).omit({
  id: true,
  createdAt: true
});

export const insertBrainGameScoreSchema = createInsertSchema(brainGameScores).omit({
  id: true,
  createdAt: true
});

export const insertFitnessDataSchema = createInsertSchema(fitnessData).omit({
  id: true
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Task = typeof tasks.$inferSelect;
export type InsertTask = z.infer<typeof insertTaskSchema>;
export type FocusSession = typeof focusSessions.$inferSelect;
export type InsertFocusSession = z.infer<typeof insertFocusSessionSchema>;
export type BrainGameScore = typeof brainGameScores.$inferSelect;
export type InsertBrainGameScore = z.infer<typeof insertBrainGameScoreSchema>;
export type FitnessData = typeof fitnessData.$inferSelect;
export type InsertFitnessData = z.infer<typeof insertFitnessDataSchema>;
export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
