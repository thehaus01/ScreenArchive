import { type Screenshot, type InsertScreenshot } from "@shared/schema";

export interface IStorage {
  getAllScreenshots(): Promise<Screenshot[]>;
  getScreenshot(id: number): Promise<Screenshot | undefined>;
  createScreenshot(screenshot: InsertScreenshot & { aiTags: string[] }): Promise<Screenshot>;
  searchScreenshots(query: string): Promise<Screenshot[]>;
  filterScreenshots(filters: {
    app?: string;
    genre?: string;
    screenTask?: string;
    uiElements?: string[];
  }): Promise<Screenshot[]>;
}

export class MemStorage implements IStorage {
  private screenshots: Map<number, Screenshot>;
  private currentId: number;

  constructor() {
    this.screenshots = new Map();
    this.currentId = 1;

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
}

export const storage = new MemStorage();