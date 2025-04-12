import { swebApps, swebData, type SwebApp, type InsertSwebApp, type SwebData, type InsertSwebData } from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";

export interface IStorage {
  // SWeb App operations
  getApps(): Promise<SwebApp[]>;
  getApp(id: number): Promise<SwebApp | undefined>;
  getAppByName(name: string): Promise<SwebApp | undefined>;
  createApp(app: InsertSwebApp): Promise<SwebApp>;
  updateApp(id: number, app: Partial<InsertSwebApp>): Promise<SwebApp | undefined>;
  deleteApp(id: number): Promise<boolean>;
  
  // SWeb Data operations
  getData(appId: number, modelName: string): Promise<SwebData[]>;
  getDataById(id: number): Promise<SwebData | undefined>;
  createData(data: InsertSwebData): Promise<SwebData>;
  updateData(id: number, data: Partial<InsertSwebData>): Promise<SwebData | undefined>;
  deleteData(id: number): Promise<boolean>;
}

// Memory storage implementation for development
export class MemStorage implements IStorage {
  private apps: Map<number, SwebApp>;
  private data: Map<number, SwebData>;
  private appIdCounter: number;
  private dataIdCounter: number;

  constructor() {
    this.apps = new Map();
    this.data = new Map();
    this.appIdCounter = 1;
    this.dataIdCounter = 1;
  }

  // SWeb App operations
  async getApps(): Promise<SwebApp[]> {
    return Array.from(this.apps.values());
  }

  async getApp(id: number): Promise<SwebApp | undefined> {
    return this.apps.get(id);
  }

  async getAppByName(name: string): Promise<SwebApp | undefined> {
    return Array.from(this.apps.values()).find(app => app.name === name);
  }

  async createApp(app: InsertSwebApp): Promise<SwebApp> {
    const id = this.appIdCounter++;
    const createdAt = new Date();
    // Ensure description is null if undefined
    const description = app.description === undefined ? null : app.description;
    const newApp = { ...app, description, id, createdAt };
    this.apps.set(id, newApp);
    return newApp;
  }

  async updateApp(id: number, app: Partial<InsertSwebApp>): Promise<SwebApp | undefined> {
    const existingApp = this.apps.get(id);
    if (!existingApp) return undefined;
    
    const updatedApp = { ...existingApp, ...app };
    this.apps.set(id, updatedApp);
    return updatedApp;
  }

  async deleteApp(id: number): Promise<boolean> {
    return this.apps.delete(id);
  }

  // SWeb Data operations
  async getData(appId: number, modelName: string): Promise<SwebData[]> {
    return Array.from(this.data.values()).filter(
      data => data.appId === appId && data.modelName === modelName
    );
  }

  async getDataById(id: number): Promise<SwebData | undefined> {
    return this.data.get(id);
  }

  async createData(data: InsertSwebData): Promise<SwebData> {
    const id = this.dataIdCounter++;
    const createdAt = new Date();
    const newData = { ...data, id, createdAt };
    this.data.set(id, newData);
    return newData;
  }

  async updateData(id: number, data: Partial<InsertSwebData>): Promise<SwebData | undefined> {
    const existingData = this.data.get(id);
    if (!existingData) return undefined;
    
    const updatedData = { ...existingData, ...data };
    this.data.set(id, updatedData);
    return updatedData;
  }

  async deleteData(id: number): Promise<boolean> {
    return this.data.delete(id);
  }
}

// Database storage implementation for production
export class DatabaseStorage implements IStorage {
  // SWeb App operations
  async getApps(): Promise<SwebApp[]> {
    return await db.select().from(swebApps);
  }

  async getApp(id: number): Promise<SwebApp | undefined> {
    const results = await db.select().from(swebApps).where(eq(swebApps.id, id));
    return results.length > 0 ? results[0] : undefined;
  }

  async getAppByName(name: string): Promise<SwebApp | undefined> {
    const results = await db.select().from(swebApps).where(eq(swebApps.name, name));
    return results.length > 0 ? results[0] : undefined;
  }

  async createApp(app: InsertSwebApp): Promise<SwebApp> {
    const inserted = await db.insert(swebApps).values(app).returning();
    return inserted[0];
  }

  async updateApp(id: number, app: Partial<InsertSwebApp>): Promise<SwebApp | undefined> {
    const updated = await db
      .update(swebApps)
      .set(app)
      .where(eq(swebApps.id, id))
      .returning();
    return updated.length > 0 ? updated[0] : undefined;
  }

  async deleteApp(id: number): Promise<boolean> {
    const deleted = await db
      .delete(swebApps)
      .where(eq(swebApps.id, id))
      .returning();
    return deleted.length > 0;
  }

  // SWeb Data operations
  async getData(appId: number, modelName: string): Promise<SwebData[]> {
    return await db
      .select()
      .from(swebData)
      .where(
        and(
          eq(swebData.appId, appId),
          eq(swebData.modelName, modelName)
        )
      );
  }

  async getDataById(id: number): Promise<SwebData | undefined> {
    const results = await db.select().from(swebData).where(eq(swebData.id, id));
    return results.length > 0 ? results[0] : undefined;
  }

  async createData(data: InsertSwebData): Promise<SwebData> {
    const inserted = await db.insert(swebData).values(data).returning();
    return inserted[0];
  }

  async updateData(id: number, data: Partial<InsertSwebData>): Promise<SwebData | undefined> {
    const updated = await db
      .update(swebData)
      .set(data)
      .where(eq(swebData.id, id))
      .returning();
    return updated.length > 0 ? updated[0] : undefined;
  }

  async deleteData(id: number): Promise<boolean> {
    const deleted = await db
      .delete(swebData)
      .where(eq(swebData.id, id))
      .returning();
    return deleted.length > 0;
  }
}

// Use DatabaseStorage for production environment
export const storage = new DatabaseStorage();
