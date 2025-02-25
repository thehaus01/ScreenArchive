import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

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
  uploadedAt: timestamp("uploaded_at").defaultNow().notNull(),
});

export const insertScreenshotSchema = createInsertSchema(screenshots).omit({
  id: true,
  uploadedAt: true,
});

export type InsertScreenshot = z.infer<typeof insertScreenshotSchema>;
export type Screenshot = typeof screenshots.$inferSelect;

// Predefined options for dropdowns
export const GENRES = [
  "Business",
  "Social",
  "E-commerce",
  "Finance",
  "Entertainment",
  "Productivity",
] as const;

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