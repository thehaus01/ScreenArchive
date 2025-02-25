import { type Screenshot, type InsertScreenshot, type User, type InsertUser } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  getAllScreenshots(): Promise<Screenshot[]>;
  getScreenshot(id: number): Promise<Screenshot | undefined>;
  createScreenshot(screenshot: InsertScreenshot & { aiTags: string[] }): Promise<Screenshot>;
  updateScreenshot(id: number, data: Partial<InsertScreenshot>): Promise<Screenshot>;
  deleteScreenshot(id: number): Promise<void>;
  searchScreenshots(query: string): Promise<Screenshot[]>;
  filterScreenshots(filters: {
    app?: string;
    genre?: string;
    screenTask?: string;
    uiElements?: string[];
  }): Promise<Screenshot[]>;

  // User management
  createUser(user: InsertUser): Promise<User>;
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;

  // Session store
  sessionStore: session.Store;
}

export class MemStorage implements IStorage {
  private screenshots: Map<number, Screenshot>;
  private users: Map<number, User>;
  private currentId: number;
  private currentUserId: number;
  sessionStore: session.Store;

  constructor() {
    this.screenshots = new Map();
    this.users = new Map();
    this.currentId = 1;
    this.currentUserId = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // prune expired entries every 24h
    });

    // Create initial admin user
    this.createUser({
      username: "admin",
      password: "admin", // This will be hashed by the auth service
      isAdmin: "true",
    });

    // Add sample screenshots
    const sampleScreenshots: (InsertScreenshot & { aiTags: string[] })[] = [
      {
        title: "Minimalist Dashboard",
        imagePath: "/placeholder-dashboard.svg",
        description: "Clean dashboard interface with charts and stats",
        app: "Analytics Pro",
        genre: "Business",
        screenTask: "Dashboard",
        uiElements: ["Chart", "Card", "Navigation"],
        tags: ["minimal", "dashboard", "analytics"],
        aiTags: ["data-visualization", "metrics", "business-intelligence"],
      },
      {
        title: "Social Feed",
        imagePath: "/placeholder-feed.svg",
        description: "Modern social media feed layout",
        app: "SocialConnect",
        genre: "Social",
        screenTask: "Navigation",
        uiElements: ["Card", "List"],
        tags: ["social", "feed", "modern"],
        aiTags: ["social-media", "content-feed", "user-engagement"],
      },
    ];

    sampleScreenshots.forEach((screenshot) => {
      this.createScreenshot(screenshot);
    });
  }

  async getAllScreenshots(): Promise<Screenshot[]> {
    return Array.from(this.screenshots.values());
  }

  async getScreenshot(id: number): Promise<Screenshot | undefined> {
    return this.screenshots.get(id);
  }

  async createScreenshot(screenshot: InsertScreenshot & { aiTags: string[] }): Promise<Screenshot> {
    const id = this.currentId++;
    const newScreenshot: Screenshot = {
      ...screenshot,
      id,
      uploadedAt: new Date(),
      description: screenshot.description || null,
    };
    this.screenshots.set(id, newScreenshot);
    return newScreenshot;
  }

  async updateScreenshot(id: number, data: Partial<InsertScreenshot>): Promise<Screenshot> {
    const screenshot = await this.getScreenshot(id);
    if (!screenshot) {
      throw new Error("Screenshot not found");
    }

    const updatedScreenshot = {
      ...screenshot,
      ...data,
    };

    this.screenshots.set(id, updatedScreenshot);
    return updatedScreenshot;
  }

  async deleteScreenshot(id: number): Promise<void> {
    if (!this.screenshots.has(id)) {
      throw new Error("Screenshot not found");
    }
    this.screenshots.delete(id);
  }

  async searchScreenshots(query: string): Promise<Screenshot[]> {
    const lowercaseQuery = query.toLowerCase();
    return Array.from(this.screenshots.values()).filter(
      (screenshot) =>
        screenshot.title.toLowerCase().includes(lowercaseQuery) ||
        screenshot.description?.toLowerCase().includes(lowercaseQuery) ||
        screenshot.app.toLowerCase().includes(lowercaseQuery) ||
        screenshot.tags.some((tag) => tag.toLowerCase().includes(lowercaseQuery)) ||
        screenshot.aiTags.some((tag) => tag.toLowerCase().includes(lowercaseQuery))
    );
  }

  async filterScreenshots(filters: {
    app?: string;
    genre?: string;
    screenTask?: string;
    uiElements?: string[];
  }): Promise<Screenshot[]> {
    return Array.from(this.screenshots.values()).filter((screenshot) => {
      if (filters.app && !screenshot.app.includes(filters.app)) return false;
      if (filters.genre && screenshot.genre !== filters.genre) return false;
      if (filters.screenTask && screenshot.screenTask !== filters.screenTask)
        return false;
      if (
        filters.uiElements?.length &&
        !filters.uiElements.every((el) => screenshot.uiElements.includes(el))
      )
        return false;
      return true;
    });
  }

  async createUser(userData: InsertUser & { isAdmin?: string }): Promise<User> {
    const id = this.currentUserId++;
    const user: User = {
      ...userData,
      id,
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }
}

export const storage = new MemStorage();