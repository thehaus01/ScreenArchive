import type { Express } from "express";
import { createServer } from "http";
import { storage } from "./storage";
import { insertScreenshotSchema } from "@shared/schema";

export async function registerRoutes(app: Express) {
  // Search screenshots
  app.get("/api/screenshots/search", async (req, res) => {
    const { q } = req.query;
    if (typeof q !== "string") {
      return res.status(400).json({ message: "Search query required" });
    }
    const results = await storage.searchScreenshots(q);
    res.json(results);
  });

  // Filter screenshots
  app.get("/api/screenshots/filter", async (req, res) => {
    const { app, genre, screenTask, uiElements } = req.query;
    const filters: any = {};

    if (typeof app === "string") filters.app = app;
    if (typeof genre === "string") filters.genre = genre;
    if (typeof screenTask === "string") filters.screenTask = screenTask;
    if (typeof uiElements === "string") {
      filters.uiElements = uiElements.split(",");
    }

    const results = await storage.filterScreenshots(filters);
    res.json(results);
  });

  // Get all screenshots
  app.get("/api/screenshots", async (_req, res) => {
    const screenshots = await storage.getAllScreenshots();
    res.json(screenshots);
  });

  // Get single screenshot
  app.get("/api/screenshots/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const screenshot = await storage.getScreenshot(id);
    if (!screenshot) {
      return res.status(404).json({ message: "Screenshot not found" });
    }
    res.json(screenshot);
  });

  // Create screenshot
  app.post("/api/screenshots", async (req, res) => {
    const parseResult = insertScreenshotSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ message: "Invalid screenshot data" });
    }
    const screenshot = await storage.createScreenshot(parseResult.data);
    res.status(201).json(screenshot);
  });

  const httpServer = createServer(app);
  return httpServer;
}