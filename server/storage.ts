import {
  type User,
  type InsertUser,
  type Task,
  type InsertTask,
  type FocusSession,
  type InsertFocusSession,
  type BrainGameScore,
  type InsertBrainGameScore,
  type FitnessData,
  type InsertFitnessData,
  type Notification,
  type InsertNotification,
  type Journal,
  type InsertJournal,
  type StressTrigger,
  type InsertStressTrigger
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Task methods
  getTasks(userId: string): Promise<Task[]>;
  getTasksByCategory(userId: string, category: string): Promise<Task[]>;
  getTask(id: string, userId: string): Promise<Task | undefined>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: string, userId: string, task: Partial<InsertTask>): Promise<Task | undefined>;
  deleteTask(id: string, userId: string): Promise<boolean>;

  // Focus session methods
  getFocusSessions(userId: string): Promise<FocusSession[]>;
  getActiveFocusSession(userId: string): Promise<FocusSession | undefined>;
  createFocusSession(session: InsertFocusSession): Promise<FocusSession>;
  updateFocusSession(id: string, userId: string, session: Partial<InsertFocusSession>): Promise<FocusSession | undefined>;

  // Brain game methods
  getBrainGameScores(userId: string, gameType?: string): Promise<BrainGameScore[]>;
  createBrainGameScore(score: InsertBrainGameScore): Promise<BrainGameScore>;
  getTopScores(userId: string, gameType: string, limit?: number): Promise<BrainGameScore[]>;

  // Fitness methods
  getFitnessData(userId: string, date?: Date): Promise<FitnessData[]>;
  createFitnessData(data: InsertFitnessData): Promise<FitnessData>;
  updateFitnessData(userId: string, date: Date, data: Partial<InsertFitnessData>): Promise<FitnessData | undefined>;

  // Notification methods
  getNotifications(userId: string): Promise<Notification[]>;
  getUnreadNotifications(userId: string): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationRead(id: string, userId: string): Promise<boolean>;

  getJournals(userId: string): Promise<Journal[]>;
  createJournal(journal: InsertJournal): Promise<Journal>;
  getStressTriggers(userId: string, since?: Date): Promise<StressTrigger[]>;
  createStressTrigger(trigger: InsertStressTrigger): Promise<StressTrigger>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private tasks: Map<string, Task> = new Map();
  private focusSessions: Map<string, FocusSession> = new Map();
  private brainGameScores: Map<string, BrainGameScore> = new Map();
  private fitnessData: Map<string, FitnessData> = new Map();
  private notifications: Map<string, Notification> = new Map();
  private journals: Map<string, Journal> = new Map();
  private stressTriggers: Map<string, StressTrigger> = new Map();

  constructor() {
    // Create a demo user
    const demoUser: User = {
      id: "demo-user",
      username: "alex.johnson",
      email: "alex@example.com",
      password: "password123",
      createdAt: new Date()
    };
    this.users.set(demoUser.id, demoUser);
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id, createdAt: new Date() };
    this.users.set(id, user);
    return user;
  }

  // Task methods
  async getTasks(userId: string): Promise<Task[]> {
    return Array.from(this.tasks.values())
      .filter(task => task.userId === userId)
      .sort((a, b) => b.createdAt!.getTime() - a.createdAt!.getTime());
  }

  async getTasksByCategory(userId: string, category: string): Promise<Task[]> {
    return Array.from(this.tasks.values())
      .filter(task => task.userId === userId && task.category === category);
  }

  async getTask(id: string, userId: string): Promise<Task | undefined> {
    const task = this.tasks.get(id);
    return task?.userId === userId ? task : undefined;
  }

  async createTask(insertTask: InsertTask): Promise<Task> {
    const id = randomUUID();
    const task: Task = {
      ...insertTask,
      id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.tasks.set(id, task);
    return task;
  }

  async updateTask(id: string, userId: string, updateData: Partial<InsertTask>): Promise<Task | undefined> {
    const task = this.tasks.get(id);
    if (!task || task.userId !== userId) return undefined;

    const updatedTask = { ...task, ...updateData, updatedAt: new Date() };
    this.tasks.set(id, updatedTask);
    return updatedTask;
  }

  async deleteTask(id: string, userId: string): Promise<boolean> {
    const task = this.tasks.get(id);
    if (!task || task.userId !== userId) return false;
    return this.tasks.delete(id);
  }

  // Focus session methods
  async getFocusSessions(userId: string): Promise<FocusSession[]> {
    return Array.from(this.focusSessions.values())
      .filter(session => session.userId === userId)
      .sort((a, b) => b.createdAt!.getTime() - a.createdAt!.getTime());
  }

  async getActiveFocusSession(userId: string): Promise<FocusSession | undefined> {
    return Array.from(this.focusSessions.values())
      .find(session => session.userId === userId && session.isActive);
  }

  async createFocusSession(insertSession: InsertFocusSession): Promise<FocusSession> {
    const id = randomUUID();
    const session: FocusSession = {
      ...insertSession,
      id,
      createdAt: new Date()
    };
    this.focusSessions.set(id, session);
    return session;
  }

  async updateFocusSession(id: string, userId: string, updateData: Partial<InsertFocusSession>): Promise<FocusSession | undefined> {
    const session = this.focusSessions.get(id);
    if (!session || session.userId !== userId) return undefined;

    const updatedSession = { ...session, ...updateData };
    this.focusSessions.set(id, updatedSession);
    return updatedSession;
  }

  // Brain game methods
  async getBrainGameScores(userId: string, gameType?: string): Promise<BrainGameScore[]> {
    return Array.from(this.brainGameScores.values())
      .filter(score => score.userId === userId && (!gameType || score.gameType === gameType))
      .sort((a, b) => b.createdAt!.getTime() - a.createdAt!.getTime());
  }

  async createBrainGameScore(insertScore: InsertBrainGameScore): Promise<BrainGameScore> {
    const id = randomUUID();
    const score: BrainGameScore = {
      ...insertScore,
      id,
      createdAt: new Date()
    };
    this.brainGameScores.set(id, score);
    return score;
  }

  async getTopScores(userId: string, gameType: string, limit = 10): Promise<BrainGameScore[]> {
    return Array.from(this.brainGameScores.values())
      .filter(score => score.userId === userId && score.gameType === gameType)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  // Fitness methods
  async getFitnessData(userId: string, date?: Date): Promise<FitnessData[]> {
    const data = Array.from(this.fitnessData.values())
      .filter(fitness => fitness.userId === userId);
    
    if (date) {
      const targetDate = date.toDateString();
      return data.filter(fitness => fitness.date!.toDateString() === targetDate);
    }
    
    return data.sort((a, b) => b.date!.getTime() - a.date!.getTime());
  }

  async createFitnessData(insertData: InsertFitnessData): Promise<FitnessData> {
    const id = randomUUID();
    const data: FitnessData = {
      ...insertData,
      id,
      date: insertData.date || new Date()
    };
    this.fitnessData.set(id, data);
    return data;
  }

  async updateFitnessData(userId: string, date: Date, updateData: Partial<InsertFitnessData>): Promise<FitnessData | undefined> {
    const targetDate = date.toDateString();
    const existing = Array.from(this.fitnessData.values())
      .find(fitness => fitness.userId === userId && fitness.date!.toDateString() === targetDate);

    if (!existing) return undefined;

    const updated = { ...existing, ...updateData };
    this.fitnessData.set(existing.id, updated);
    return updated;
  }

  // Notification methods
  async getNotifications(userId: string): Promise<Notification[]> {
    return Array.from(this.notifications.values())
      .filter(notification => notification.userId === userId)
      .sort((a, b) => b.createdAt!.getTime() - a.createdAt!.getTime());
  }

  async getUnreadNotifications(userId: string): Promise<Notification[]> {
    return Array.from(this.notifications.values())
      .filter(notification => notification.userId === userId && !notification.read);
  }

  async createNotification(insertNotification: InsertNotification): Promise<Notification> {
    const id = randomUUID();
    const notification: Notification = {
      ...insertNotification,
      id,
      createdAt: new Date()
    };
    this.notifications.set(id, notification);
    return notification;
  }

  async markNotificationRead(id: string, userId: string): Promise<boolean> {
    const notification = this.notifications.get(id);
    if (!notification || notification.userId !== userId) return false;
    
    notification.read = true;
    this.notifications.set(id, notification);
    return true;
  }

  async getJournals(userId: string): Promise<Journal[]> {
    return Array.from(this.journals.values())
      .filter((journal) => journal.userId === userId)
      .sort((a, b) => b.createdAt!.getTime() - a.createdAt!.getTime());
  }

  async createJournal(insertJournal: InsertJournal): Promise<Journal> {
    const journal: Journal = {
      ...insertJournal,
      id: randomUUID(),
      burnoutRisk: insertJournal.burnoutRisk ?? false,
      crisisFlag: insertJournal.crisisFlag ?? false,
      analysisSource: insertJournal.analysisSource ?? "local-safety-engine",
      createdAt: new Date(),
    };
    this.journals.set(journal.id, journal);
    return journal;
  }

  async getStressTriggers(userId: string, since?: Date): Promise<StressTrigger[]> {
    return Array.from(this.stressTriggers.values())
      .filter((trigger) => trigger.userId === userId && (!since || trigger.createdAt! >= since))
      .sort((a, b) => b.createdAt!.getTime() - a.createdAt!.getTime());
  }

  async createStressTrigger(insertTrigger: InsertStressTrigger): Promise<StressTrigger> {
    const trigger: StressTrigger = { ...insertTrigger, id: randomUUID(), createdAt: new Date() };
    this.stressTriggers.set(trigger.id, trigger);
    return trigger;
  }
}

export const storage = new MemStorage();
