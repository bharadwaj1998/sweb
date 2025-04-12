import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertSwebAppSchema, insertSwebDataSchema } from "@shared/schema";
import { ZodError } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes for SWeb applications
  
  // Get all apps
  app.get("/api/apps", async (_req: Request, res: Response) => {
    try {
      const apps = await storage.getApps();
      res.json(apps);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve apps" });
    }
  });

  // Get app by ID
  app.get("/api/apps/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }
      
      const app = await storage.getApp(id);
      if (!app) {
        return res.status(404).json({ message: "App not found" });
      }
      
      res.json(app);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve app" });
    }
  });

  // Create a new app
  app.post("/api/apps", async (req: Request, res: Response) => {
    try {
      const validatedData = insertSwebAppSchema.parse(req.body);
      const newApp = await storage.createApp(validatedData);
      res.status(201).json(newApp);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Invalid app data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create app" });
    }
  });

  // Update an app
  app.put("/api/apps/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }
      
      const validatedData = insertSwebAppSchema.partial().parse(req.body);
      const updatedApp = await storage.updateApp(id, validatedData);
      
      if (!updatedApp) {
        return res.status(404).json({ message: "App not found" });
      }
      
      res.json(updatedApp);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Invalid app data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update app" });
    }
  });

  // Delete an app
  app.delete("/api/apps/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }
      
      const success = await storage.deleteApp(id);
      if (!success) {
        return res.status(404).json({ message: "App not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete app" });
    }
  });

  // API routes for SWeb data
  
  // Get data for an app's model
  app.get("/api/apps/:appId/data/:modelName", async (req: Request, res: Response) => {
    try {
      const appId = parseInt(req.params.appId);
      const { modelName } = req.params;
      
      if (isNaN(appId)) {
        return res.status(400).json({ message: "Invalid app ID format" });
      }
      
      const data = await storage.getData(appId, modelName);
      res.json(data);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve data" });
    }
  });

  // Create data for an app's model
  app.post("/api/data", async (req: Request, res: Response) => {
    try {
      const validatedData = insertSwebDataSchema.parse(req.body);
      const newData = await storage.createData(validatedData);
      res.status(201).json(newData);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create data" });
    }
  });

  // Update data
  app.put("/api/data/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }
      
      const validatedData = insertSwebDataSchema.partial().parse(req.body);
      const updatedData = await storage.updateData(id, validatedData);
      
      if (!updatedData) {
        return res.status(404).json({ message: "Data not found" });
      }
      
      res.json(updatedData);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update data" });
    }
  });

  // Delete data
  app.delete("/api/data/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }
      
      const success = await storage.deleteData(id);
      if (!success) {
        return res.status(404).json({ message: "Data not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete data" });
    }
  });

  // Compile and run an app (execute the SWeb code)
  app.post("/api/run", async (req: Request, res: Response) => {
    try {
      const { code } = req.body;
      if (!code || typeof code !== 'string') {
        return res.status(400).json({ message: "Code is required" });
      }
      
      // Here we would normally process the code but since we're
      // doing that on the client side for this implementation, we'll
      // just return a success response
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to run application" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
