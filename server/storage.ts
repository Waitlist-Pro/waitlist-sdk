import { 
  users, forms, subscribers, activities,
  type User, type InsertUser,
  type Form, type InsertForm,
  type Subscriber, type InsertSubscriber,
  type Activity, type InsertActivity
} from "@shared/schema";
import session from "express-session";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Form methods
  createForm(form: InsertForm): Promise<Form>;
  getForm(id: number): Promise<Form | undefined>;
  getFormsByUserId(userId: number): Promise<Form[]>;
  updateForm(id: number, form: Partial<InsertForm>): Promise<Form | undefined>;
  deleteForm(id: number): Promise<boolean>;

  // Subscriber methods
  createSubscriber(subscriber: InsertSubscriber): Promise<Subscriber>;
  getSubscriber(id: number): Promise<Subscriber | undefined>;
  getSubscribersByFormId(formId: number): Promise<Subscriber[]>;
  getSubscribersByUserId(userId: number): Promise<Subscriber[]>;
  getSubscriberCount(formId?: number, userId?: number): Promise<number>;
  getRecentSubscribers(formId?: number, userId?: number, limit?: number): Promise<Subscriber[]>;

  // Activity methods
  createActivity(activity: InsertActivity): Promise<Activity>;
  getActivitiesByUserId(userId: number, limit?: number): Promise<Activity[]>;
  getRecentActivities(userId: number, limit?: number): Promise<Activity[]>;

  // Analytics methods
  getMonthlySubscriberCount(userId: number): Promise<number>;
  getConversionRate(userId: number): Promise<number>;
  getActiveFormCount(userId: number): Promise<number>;
  
  // Session store
  sessionStore: session.SessionStore;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private forms: Map<number, Form>;
  private subscribers: Map<number, Subscriber>;
  private activities: Map<number, Activity>;
  private userId: number;
  private formId: number;
  private subscriberId: number;
  private activityId: number;
  sessionStore: session.SessionStore;

  constructor() {
    this.users = new Map();
    this.forms = new Map();
    this.subscribers = new Map();
    this.activities = new Map();
    this.userId = 1;
    this.formId = 1;
    this.subscriberId = 1;
    this.activityId = 1;
    
    const MemoryStore = require('memorystore')(session);
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email
    );
  }

  async createUser(userData: InsertUser): Promise<User> {
    const id = this.userId++;
    const createdAt = new Date();
    const user: User = { ...userData, id, createdAt };
    this.users.set(id, user);
    return user;
  }

  // Form methods
  async createForm(formData: InsertForm): Promise<Form> {
    const id = this.formId++;
    const createdAt = new Date();
    const updatedAt = new Date();
    const form: Form = { ...formData, id, createdAt, updatedAt };
    this.forms.set(id, form);
    return form;
  }

  async getForm(id: number): Promise<Form | undefined> {
    return this.forms.get(id);
  }

  async getFormsByUserId(userId: number): Promise<Form[]> {
    return Array.from(this.forms.values()).filter(
      (form) => form.userId === userId
    );
  }

  async updateForm(id: number, formData: Partial<InsertForm>): Promise<Form | undefined> {
    const form = this.forms.get(id);
    if (!form) return undefined;

    const updatedForm: Form = {
      ...form,
      ...formData,
      updatedAt: new Date()
    };
    this.forms.set(id, updatedForm);
    return updatedForm;
  }

  async deleteForm(id: number): Promise<boolean> {
    return this.forms.delete(id);
  }

  // Subscriber methods
  async createSubscriber(subscriberData: InsertSubscriber): Promise<Subscriber> {
    const id = this.subscriberId++;
    const createdAt = new Date();
    const subscriber: Subscriber = { ...subscriberData, id, createdAt };
    this.subscribers.set(id, subscriber);
    return subscriber;
  }

  async getSubscriber(id: number): Promise<Subscriber | undefined> {
    return this.subscribers.get(id);
  }

  async getSubscribersByFormId(formId: number): Promise<Subscriber[]> {
    return Array.from(this.subscribers.values()).filter(
      (subscriber) => subscriber.formId === formId
    );
  }

  async getSubscribersByUserId(userId: number): Promise<Subscriber[]> {
    const userForms = await this.getFormsByUserId(userId);
    const formIds = userForms.map(form => form.id);
    return Array.from(this.subscribers.values()).filter(
      (subscriber) => formIds.includes(subscriber.formId)
    );
  }

  async getSubscriberCount(formId?: number, userId?: number): Promise<number> {
    if (formId) {
      return (await this.getSubscribersByFormId(formId)).length;
    }
    if (userId) {
      return (await this.getSubscribersByUserId(userId)).length;
    }
    return this.subscribers.size;
  }

  async getRecentSubscribers(formId?: number, userId?: number, limit: number = 5): Promise<Subscriber[]> {
    let subscribers: Subscriber[] = [];
    
    if (formId) {
      subscribers = await this.getSubscribersByFormId(formId);
    } else if (userId) {
      subscribers = await this.getSubscribersByUserId(userId);
    } else {
      subscribers = Array.from(this.subscribers.values());
    }
    
    return subscribers
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }

  // Activity methods
  async createActivity(activityData: InsertActivity): Promise<Activity> {
    const id = this.activityId++;
    const createdAt = new Date();
    const activity: Activity = { ...activityData, id, createdAt };
    this.activities.set(id, activity);
    return activity;
  }

  async getActivitiesByUserId(userId: number, limit: number = 10): Promise<Activity[]> {
    return Array.from(this.activities.values())
      .filter(activity => activity.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }

  async getRecentActivities(userId: number, limit: number = 5): Promise<Activity[]> {
    return this.getActivitiesByUserId(userId, limit);
  }

  // Analytics methods
  async getMonthlySubscriberCount(userId: number): Promise<number> {
    const subscribers = await this.getSubscribersByUserId(userId);
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    return subscribers.filter(
      subscriber => subscriber.createdAt >= firstDayOfMonth
    ).length;
  }

  async getConversionRate(userId: number): Promise<number> {
    // This is a simplified implementation. In a real-world scenario,
    // you would track impressions and calculate conversions/impressions.
    // For now, we'll return a random percentage between 5 and 40.
    return Math.floor(Math.random() * 35) + 5;
  }

  async getActiveFormCount(userId: number): Promise<number> {
    return (await this.getFormsByUserId(userId)).length;
  }
}

// Import the database storage
import { DatabaseStorage } from './database-storage';

// Use the DatabaseStorage implementation for database persistence
export const storage = new DatabaseStorage();
