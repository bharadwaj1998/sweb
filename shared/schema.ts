import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// A SWeb application definition
export const swebApps = pgTable("sweb_apps", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  code: text("code").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertSwebAppSchema = createInsertSchema(swebApps).omit({
  id: true,
  createdAt: true,
});

// For storing application data
export const swebData = pgTable("sweb_data", {
  id: serial("id").primaryKey(),
  appId: integer("app_id").notNull().references(() => swebApps.id),
  modelName: text("model_name").notNull(),
  data: jsonb("data").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertSwebDataSchema = createInsertSchema(swebData).omit({
  id: true,
  createdAt: true,
});

// Type definitions
export type SwebApp = typeof swebApps.$inferSelect;
export type InsertSwebApp = z.infer<typeof insertSwebAppSchema>;
export type SwebData = typeof swebData.$inferSelect;
export type InsertSwebData = z.infer<typeof insertSwebDataSchema>;
