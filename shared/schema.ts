import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull(),
  password: text("password").notNull(),
  isAdmin: text("is_admin").notNull().default("false"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  isAdmin: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const screenshots = pgTable("screenshots", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  imagePath: text("image_path").notNull(),
  description: text("description"),
  app: text("app").notNull(),
  genre: text("genre").notNull(),
  screenTask: text("screen_task").notNull(),
  uiElements: text("ui_elements").array().notNull(),
  tags: text("tags").array().notNull(),
  aiTags: text("ai_tags").array().notNull(),
  uploadedAt: timestamp("uploaded_at").defaultNow().notNull(),
});

export const insertScreenshotSchema = createInsertSchema(screenshots).omit({
  id: true,
  uploadedAt: true,
  aiTags: true,
});

export type InsertScreenshot = z.infer<typeof insertScreenshotSchema>;
export type Screenshot = typeof screenshots.$inferSelect;

// Predefined options for dropdowns
export const GENRES = ["IDE", "Agent"] as const;

export const SCREEN_TASKS = [
  "Onboarding",
  "Authentication",
  "Dashboard",
  "Settings",
  "Profile",
  "Search",
  "Navigation",
] as const;

export const UI_ELEMENTS = [
  "Button",
  "Card",
  "Form",
  "Modal",
  "Navigation",
  "Chart",
  "Table",
  "List",
] as const;
