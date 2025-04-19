import { IStorage } from './storage';
import { 
  users, forms, subscribers, activities,
  type User, type InsertUser,
  type Form, type InsertForm,
  type Subscriber, type InsertSubscriber,
  type Activity, type InsertActivity
} from '@shared/schema';
import { db } from './db';
import { eq, and, desc, gte, count, inArray } from 'drizzle-orm';
import session from "express-session";
import ConnectPg from "connect-pg-simple";
import { pool } from './db';

const PostgresSessionStore = ConnectPg(session);

export class DatabaseStorage implements IStorage {
  sessionStore: session.SessionStore;
  
  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(userData: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(userData).returning();
    return user;
  }

  // Form methods
  async createForm(formData: InsertForm): Promise<Form> {
    const [form] = await db.insert(forms).values(formData).returning();
    return form;
  }

  async getForm(id: number): Promise<Form | undefined> {
    const [form] = await db.select().from(forms).where(eq(forms.id, id));
    return form;
  }

  async getFormsByUserId(userId: number): Promise<Form[]> {
    return await db.select().from(forms).where(eq(forms.userId, userId));
  }

  async updateForm(id: number, formData: Partial<InsertForm>): Promise<Form | undefined> {
    const [updatedForm] = await db
      .update(forms)
      .set({ ...formData, updatedAt: new Date() })
      .where(eq(forms.id, id))
      .returning();
    return updatedForm;
  }

  async deleteForm(id: number): Promise<boolean> {
    const result = await db.delete(forms).where(eq(forms.id, id));
    return true; // In PostgreSQL, if the deletion fails it will throw an error
  }

  // Subscriber methods
  async createSubscriber(subscriberData: InsertSubscriber): Promise<Subscriber> {
    const [subscriber] = await db.insert(subscribers).values(subscriberData).returning();
    return subscriber;
  }

  async getSubscriber(id: number): Promise<Subscriber | undefined> {
    const [subscriber] = await db.select().from(subscribers).where(eq(subscribers.id, id));
    return subscriber;
  }

  async getSubscribersByFormId(formId: number): Promise<Subscriber[]> {
    return await db
      .select()
      .from(subscribers)
      .where(eq(subscribers.formId, formId))
      .orderBy(desc(subscribers.createdAt));
  }

  async getSubscribersByUserId(userId: number): Promise<Subscriber[]> {
    const userForms = await this.getFormsByUserId(userId);
    const formIds = userForms.map(form => form.id);
    
    if (formIds.length === 0) {
      return [];
    }
    
    return await db
      .select()
      .from(subscribers)
      .where(formIds.length === 1 
        ? eq(subscribers.formId, formIds[0]) 
        : inArray(subscribers.formId, formIds))
      .orderBy(desc(subscribers.createdAt));
  }

  async getSubscriberCount(formId?: number, userId?: number): Promise<number> {
    if (formId) {
      const result = await db
        .select({ count: count() })
        .from(subscribers)
        .where(eq(subscribers.formId, formId));
      return result[0]?.count || 0;
    }
    
    if (userId) {
      const userForms = await this.getFormsByUserId(userId);
      const formIds = userForms.map(form => form.id);
      
      if (formIds.length === 0) {
        return 0;
      }
      
      const result = await db
        .select({ count: count() })
        .from(subscribers)
        .where(formIds.length === 1 
          ? eq(subscribers.formId, formIds[0]) 
          : subscribers.formId.in(formIds));
      return result[0]?.count || 0;
    }
    
    const result = await db.select({ count: count() }).from(subscribers);
    return result[0]?.count || 0;
  }

  async getRecentSubscribers(formId?: number, userId?: number, limit: number = 5): Promise<Subscriber[]> {
    if (formId) {
      return await db
        .select()
        .from(subscribers)
        .where(eq(subscribers.formId, formId))
        .orderBy(desc(subscribers.createdAt))
        .limit(limit);
    }
    
    if (userId) {
      const userForms = await this.getFormsByUserId(userId);
      const formIds = userForms.map(form => form.id);
      
      if (formIds.length === 0) {
        return [];
      }
      
      return await db
        .select()
        .from(subscribers)
        .where(formIds.length === 1 
          ? eq(subscribers.formId, formIds[0]) 
          : subscribers.formId.in(formIds))
        .orderBy(desc(subscribers.createdAt))
        .limit(limit);
    }
    
    return await db
      .select()
      .from(subscribers)
      .orderBy(desc(subscribers.createdAt))
      .limit(limit);
  }

  // Activity methods
  async createActivity(activityData: InsertActivity): Promise<Activity> {
    const [activity] = await db.insert(activities).values(activityData).returning();
    return activity;
  }

  async getActivitiesByUserId(userId: number, limit: number = 10): Promise<Activity[]> {
    return await db
      .select()
      .from(activities)
      .where(eq(activities.userId, userId))
      .orderBy(desc(activities.createdAt))
      .limit(limit);
  }

  async getRecentActivities(userId: number, limit: number = 5): Promise<Activity[]> {
    return await db
      .select()
      .from(activities)
      .where(eq(activities.userId, userId))
      .orderBy(desc(activities.createdAt))
      .limit(limit);
  }

  // Analytics methods
  async getMonthlySubscriberCount(userId: number): Promise<number> {
    const userForms = await this.getFormsByUserId(userId);
    const formIds = userForms.map(form => form.id);
    
    if (formIds.length === 0) {
      return 0;
    }
    
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    
    const result = await db
      .select({ count: count() })
      .from(subscribers)
      .where(
        and(
          formIds.length === 1 
            ? eq(subscribers.formId, formIds[0]) 
            : subscribers.formId.in(formIds),
          gte(subscribers.createdAt, oneMonthAgo)
        )
      );
    
    return result[0]?.count || 0;
  }

  async getConversionRate(userId: number): Promise<number> {
    // In a real application, this would calculate actual conversion rates
    // For now, we'll return a random percentage between 20% and 50%
    return Math.round(Math.random() * 30 + 20);
  }

  async getActiveFormCount(userId: number): Promise<number> {
    const result = await db
      .select({ count: count() })
      .from(forms)
      .where(eq(forms.userId, userId));
    
    return result[0]?.count || 0;
  }
}