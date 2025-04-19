import express, { Router, Request, Response } from "express";
import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { 
  insertUserSchema, 
  insertFormSchema, 
  insertSubscriberSchema, 
  insertActivitySchema 
} from "@shared/schema";
import session from "express-session";
import MemoryStore from "memorystore";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcryptjs";

const SessionStore = MemoryStore(session);

// Extended schemas with additional validation
const registerSchema = insertUserSchema.extend({
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Configure passport
const configurePassport = () => {
  passport.use(new LocalStrategy(
    async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user) {
          return done(null, false, { message: "Incorrect username" });
        }
        
        // Use bcrypt to compare passwords
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
          return done(null, false, { message: "Incorrect password" });
        }
        
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  ));

  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });
};

// Authentication middleware
const isAuthenticated = (req: Request, res: Response, next: any) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Configure session
  app.use(session({
    cookie: { 
      maxAge: 86400000, // 24 hours
      secure: false,    // Allow non-HTTPS (for development)
      sameSite: 'lax', // Helps with CSRF protection while allowing GET requests
      httpOnly: true    // Prevents JavaScript from reading cookie
    },
    store: new SessionStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    }),
    resave: false,
    saveUninitialized: false,
    secret: process.env.SESSION_SECRET || 'waitlist-sdk-secret'
  }));

  // Initialize passport
  configurePassport();
  app.use(passport.initialize());
  app.use(passport.session());

  // API routes
  const apiRouter = Router();
  
  // Auth routes
  apiRouter.post("/auth/register", async (req, res) => {
    try {
      const validatedData = registerSchema.parse(req.body);
      
      // Check if username already exists
      const existingUsername = await storage.getUserByUsername(validatedData.username);
      if (existingUsername) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      // Check if email already exists
      const existingEmail = await storage.getUserByEmail(validatedData.email);
      if (existingEmail) {
        return res.status(400).json({ message: "Email already exists" });
      }
      
      // Create user
      const { confirmPassword, ...userData } = validatedData;
      // Hash the password for security
      userData.password = await bcrypt.hash(userData.password, 10);
      
      const user = await storage.createUser(userData);
      
      // Log the user in immediately after registration
      req.login(user, (err) => {
        if (err) {
          return res.status(500).json({ message: "Error during automatic login" });
        }
        // Don't return the password
        const { password, ...userWithoutPassword } = user;
        return res.status(201).json(userWithoutPassword);
      });
    } catch (error) {
      console.error("Registration error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Server error during registration" });
    }
  });

  apiRouter.post("/auth/login", (req, res, next) => {
    passport.authenticate("local", (err: any, user: any, info: any) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res.status(401).json({ message: info.message || "Authentication failed" });
      }
      req.logIn(user, (err) => {
        if (err) {
          return next(err);
        }
        // Don't return the password
        const { password, ...userWithoutPassword } = user;
        return res.json(userWithoutPassword);
      });
    })(req, res, next);
  });

  apiRouter.post("/auth/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: "Error during logout" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  apiRouter.get("/auth/user", (req, res) => {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    // Don't return the password
    const { password, ...userWithoutPassword } = req.user as any;
    res.json(userWithoutPassword);
  });

  // Form routes
  apiRouter.post("/forms", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      const formData = insertFormSchema.parse({
        ...req.body,
        userId: user.id
      });
      
      const form = await storage.createForm(formData);
      
      // Create activity
      await storage.createActivity({
        userId: user.id,
        formId: form.id,
        type: "form_created",
        data: { formName: form.name }
      });
      
      res.status(201).json(form);
    } catch (error) {
      console.error("Create form error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Server error during form creation" });
    }
  });

  apiRouter.get("/forms", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      const forms = await storage.getFormsByUserId(user.id);
      res.json(forms);
    } catch (error) {
      console.error("Get forms error:", error);
      res.status(500).json({ message: "Server error fetching forms" });
    }
  });

  apiRouter.get("/forms/:id", isAuthenticated, async (req, res) => {
    try {
      const formId = parseInt(req.params.id);
      if (isNaN(formId)) {
        return res.status(400).json({ message: "Invalid form ID" });
      }
      
      const form = await storage.getForm(formId);
      if (!form) {
        return res.status(404).json({ message: "Form not found" });
      }
      
      const user = req.user as any;
      if (form.userId !== user.id) {
        return res.status(403).json({ message: "You don't have permission to access this form" });
      }
      
      res.json(form);
    } catch (error) {
      console.error("Get form error:", error);
      res.status(500).json({ message: "Server error fetching form" });
    }
  });

  apiRouter.put("/forms/:id", isAuthenticated, async (req, res) => {
    try {
      const formId = parseInt(req.params.id);
      if (isNaN(formId)) {
        return res.status(400).json({ message: "Invalid form ID" });
      }
      
      const form = await storage.getForm(formId);
      if (!form) {
        return res.status(404).json({ message: "Form not found" });
      }
      
      const user = req.user as any;
      if (form.userId !== user.id) {
        return res.status(403).json({ message: "You don't have permission to update this form" });
      }
      
      const formData = insertFormSchema.partial().parse(req.body);
      const updatedForm = await storage.updateForm(formId, formData);
      
      // Create activity
      await storage.createActivity({
        userId: user.id,
        formId: form.id,
        type: "form_updated",
        data: { formName: form.name }
      });
      
      res.json(updatedForm);
    } catch (error) {
      console.error("Update form error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Server error updating form" });
    }
  });

  apiRouter.delete("/forms/:id", isAuthenticated, async (req, res) => {
    try {
      const formId = parseInt(req.params.id);
      if (isNaN(formId)) {
        return res.status(400).json({ message: "Invalid form ID" });
      }
      
      const form = await storage.getForm(formId);
      if (!form) {
        return res.status(404).json({ message: "Form not found" });
      }
      
      const user = req.user as any;
      if (form.userId !== user.id) {
        return res.status(403).json({ message: "You don't have permission to delete this form" });
      }
      
      await storage.deleteForm(formId);
      
      // Create activity
      await storage.createActivity({
        userId: user.id,
        type: "form_deleted",
        data: { formName: form.name }
      });
      
      res.json({ message: "Form deleted successfully" });
    } catch (error) {
      console.error("Delete form error:", error);
      res.status(500).json({ message: "Server error deleting form" });
    }
  });

  // Subscriber routes
  apiRouter.post("/subscribers", async (req, res) => {
    try {
      const subscriberData = insertSubscriberSchema.parse(req.body);
      
      // Check if form exists
      const form = await storage.getForm(subscriberData.formId);
      if (!form) {
        return res.status(404).json({ message: "Form not found" });
      }
      
      const subscriber = await storage.createSubscriber(subscriberData);
      
      // Create activity
      await storage.createActivity({
        userId: form.userId,
        formId: form.id,
        subscriberId: subscriber.id,
        type: "new_subscriber",
        data: {
          email: subscriber.email,
          name: subscriber.name,
          formName: form.name
        }
      });
      
      res.status(201).json(subscriber);
    } catch (error) {
      console.error("Create subscriber error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Server error adding subscriber" });
    }
  });

  apiRouter.get("/subscribers", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      const formId = req.query.formId ? parseInt(req.query.formId as string) : undefined;
      
      if (formId) {
        // Check if form exists and belongs to user
        const form = await storage.getForm(formId);
        if (!form) {
          return res.status(404).json({ message: "Form not found" });
        }
        
        if (form.userId !== user.id) {
          return res.status(403).json({ message: "You don't have permission to access subscribers for this form" });
        }
        
        const subscribers = await storage.getSubscribersByFormId(formId);
        return res.json(subscribers);
      }
      
      // Get all subscribers for user's forms
      const subscribers = await storage.getSubscribersByUserId(user.id);
      res.json(subscribers);
    } catch (error) {
      console.error("Get subscribers error:", error);
      res.status(500).json({ message: "Server error fetching subscribers" });
    }
  });

  // Activity routes
  apiRouter.get("/activities", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      
      const activities = await storage.getRecentActivities(user.id, limit);
      res.json(activities);
    } catch (error) {
      console.error("Get activities error:", error);
      res.status(500).json({ message: "Server error fetching activities" });
    }
  });

  // Dashboard stats routes
  apiRouter.get("/dashboard/stats", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      
      const totalSubscribers = await storage.getSubscriberCount(undefined, user.id);
      const thisMonth = await storage.getMonthlySubscriberCount(user.id);
      const conversionRate = await storage.getConversionRate(user.id);
      const activeForms = await storage.getActiveFormCount(user.id);
      
      res.json({
        totalSubscribers,
        thisMonth,
        conversionRate,
        activeForms
      });
    } catch (error) {
      console.error("Get dashboard stats error:", error);
      res.status(500).json({ message: "Server error fetching dashboard stats" });
    }
  });

  // SDK Embed endpoint - publicly accessible
  apiRouter.get("/sdk/form/:id", async (req, res) => {
    try {
      const formId = parseInt(req.params.id);
      if (isNaN(formId)) {
        return res.status(400).json({ message: "Invalid form ID" });
      }
      
      const form = await storage.getForm(formId);
      if (!form) {
        return res.status(404).json({ message: "Form not found" });
      }
      
      // Return relevant form data for embedding
      const { 
        name, description, collectName, collectEmail, 
        socialSharing, confirmationEmail, customCss, redirectUrl 
      } = form;
      
      res.json({
        id: formId,
        name,
        description,
        collectName,
        collectEmail,
        socialSharing,
        confirmationEmail,
        customCss,
        redirectUrl
      });
    } catch (error) {
      console.error("Get SDK form error:", error);
      res.status(500).json({ message: "Server error fetching form data" });
    }
  });
  
  // Public version of get form by ID - for preview functionality
  // Needs to go before the authenticated version
  apiRouter.get("/preview/form/:id", async (req, res) => {
    try {
      const formId = parseInt(req.params.id);
      if (isNaN(formId)) {
        return res.status(400).json({ message: "Invalid form ID" });
      }
      
      const form = await storage.getForm(formId);
      if (!form) {
        return res.status(404).json({ message: "Form not found" });
      }
      
      res.json(form);
    } catch (error) {
      console.error("Get form preview error:", error);
      res.status(500).json({ message: "Server error fetching form" });
    }
  });

  // Register API router
  app.use("/api", apiRouter);

  // Serve SDK JavaScript file
  app.get("/sdk/waitlist-sdk.js", (req, res) => {
    res.sendFile("sdk/waitlist-sdk.js", { root: "./public" });
  });

  const httpServer = createServer(app);
  return httpServer;
}
