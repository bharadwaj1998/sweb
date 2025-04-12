import { swebApps, swebData, type SwebApp, type InsertSwebApp, type SwebData, type InsertSwebData } from "@shared/schema";

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
    const newApp = { ...app, id, createdAt };
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

export const storage = new MemStorage();
