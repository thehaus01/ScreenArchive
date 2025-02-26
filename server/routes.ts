import type { Express } from "express";
import { createServer } from "http";
import { storage as dbStorage } from "./storage";
import { insertScreenshotSchema } from "@shared/schema";
import { generateImageTags } from "./services/openai";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import { setupAuth } from "./auth";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const diskStorage = multer.diskStorage({
  destination: function (_req, _file, cb) {
    cb(null, uploadsDir)
  },
  filename: function (_req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, uniqueSuffix + path.extname(file.originalname))
  }
});

const upload = multer({ 
  storage: diskStorage,
  fileFilter: (_req, file, cb) => {
    const allowedTypes = ['image/png', 'image/jpeg', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PNG, JPEG and GIF are allowed.'));
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

export async function registerRoutes(app: Express) {
  // Setup authentication and get the admin middleware
  const auth = await setupAuth(app);
  const { requireAdmin } = auth;

  // Search screenshots
  app.get("/api/screenshots/search", async (req, res) => {
    const { q } = req.query;
    if (typeof q !== "string") {
      return res.status(400).json({ message: "Search query required" });
    }
    const results = await dbStorage.searchScreenshots(q);
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

    const results = await dbStorage.filterScreenshots(filters);
    res.json(results);
  });

  // Get all screenshots
  app.get("/api/screenshots", async (_req, res) => {
    const screenshots = await dbStorage.getAllScreenshots();
    res.json(screenshots);
  });

  // Get single screenshot
  app.get("/api/screenshots/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const screenshot = await dbStorage.getScreenshot(id);
    if (!screenshot) {
      return res.status(404).json({ message: "Screenshot not found" });
    }
    res.json(screenshot);
  });

  // Create screenshot with file upload and AI tagging
  app.post("/api/screenshots", requireAdmin, upload.single('image'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No image file uploaded" });
      }

      const screenshotData = {
        ...req.body,
        imagePath: `/uploads/${req.file.filename}`,
        uiElements: req.body.uiElements ? req.body.uiElements.split(',') : [],
        tags: req.body.tags ? req.body.tags.split(',').map((t: string) => t.trim()) : [],
      };

      // Generate AI tags based on the screenshot data
      const description = `This is a ${screenshotData.screenTask} screen from a ${screenshotData.genre} app called ${screenshotData.app}. ${screenshotData.description || ''} It contains UI elements like ${screenshotData.uiElements.join(', ')}.`;
      const aiTags = await generateImageTags(description);

      const parseResult = insertScreenshotSchema.safeParse(screenshotData);
      if (!parseResult.success) {
        return res.status(400).json({ message: "Invalid screenshot data" });
      }

      const screenshot = await dbStorage.createScreenshot({
        ...parseResult.data,
        aiTags,
      });

      res.status(201).json(screenshot);
    } catch (error) {
      if (req.file) {
        // Clean up uploaded file if something went wrong
        fs.unlinkSync(req.file.path);
      }
      res.status(500).json({ message: "Failed to create screenshot" });
    }
  });

  // Update screenshot (admin only)
  app.patch("/api/screenshots/:id", requireAdmin, upload.single('image'), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const screenshot = await dbStorage.getScreenshot(id);
      
      if (!screenshot) {
        return res.status(404).json({ message: "Screenshot not found" });
      }

      // If new image uploaded, delete old one if it's not a placeholder
      if (req.file && screenshot.imagePath.startsWith("/uploads/")) {
        const oldImagePath = path.join(__dirname, "..", screenshot.imagePath);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }

      const updateData = {
        ...req.body,
        imagePath: req.file ? `/uploads/${req.file.filename}` : screenshot.imagePath,
        uiElements: req.body.uiElements ? req.body.uiElements.split(',') : screenshot.uiElements,
        tags: req.body.tags ? req.body.tags.split(',') : screenshot.tags,
      };

      const updatedScreenshot = await dbStorage.updateScreenshot(id, updateData);
      res.json(updatedScreenshot);
    } catch (error) {
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      res.status(500).json({ message: "Failed to update screenshot" });
    }
  });

  // Delete screenshot (admin only)
  app.delete("/api/screenshots/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const screenshot = await dbStorage.getScreenshot(id);
      if (!screenshot) {
        return res.status(404).json({ message: "Screenshot not found" });
      }

      // Delete the image file if it exists and is not a placeholder
      if (screenshot.imagePath.startsWith("/uploads/")) {
        const imagePath = path.join(__dirname, "..", screenshot.imagePath);
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      }

      await dbStorage.deleteScreenshot(id);
      res.sendStatus(204);
    } catch (error) {
      res.status(500).json({ message: "Failed to delete screenshot" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}