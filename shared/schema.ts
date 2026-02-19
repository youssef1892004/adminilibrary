import { pgTable, text, serial, boolean, timestamp, uuid, jsonb, integer, date, varchar, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Users schema - Hasura Auth users
export const users = pgTable("users", {
  id: uuid("id").primaryKey(),
  displayName: text("displayName").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("emailVerified").notNull().default(false),
  phoneNumber: text("phoneNumber"),
  phoneNumberVerified: boolean("phoneNumberVerified").notNull().default(false),
  defaultRole: text("defaultRole").notNull().default("user"),
  disabled: boolean("disabled").notNull().default(false),
  locale: text("locale").notNull().default("en"),
  avatarUrl: text("avatarUrl").notNull().default(""),
  isAnonymous: boolean("isAnonymous").notNull().default(false),
  activeMfaType: text("activeMfaType"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
  lastSeen: timestamp("lastSeen"),
  metadata: jsonb("metadata"),
  newEmail: text("newEmail"),
  currentChallenge: text("currentChallenge"),
  passwordHash: text("passwordHash"),
  otpHash: text("otpHash"),
  otpHashExpiresAt: timestamp("otpHashExpiresAt"),
  otpMethodLastUsed: text("otpMethodLastUsed"),
  ticket: text("ticket"),
  ticketExpiresAt: timestamp("ticketExpiresAt"),
  totpSecret: text("totpSecret"),
});

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// Auth roles table
export const authRoles = pgTable("authRoles", {
  role: text("role").primaryKey(),
});

// User roles junction table
export const authUserRoles = pgTable("authUserRoles", {
  id: uuid("id").primaryKey(),
  userId: uuid("userId").notNull(),
  role: text("role").notNull(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
});

// Library schema - Authors table
export const authors = pgTable("libaray_Autor", {
  id: uuid("id").primaryKey(),
  name: text("name").notNull(),
  bio: text("bio"),
  book_num: integer("book_num").notNull().default(0),
  image_url: text("image_url"),
  Category_Id: text("Category_Id"),
  user_id: uuid("user_id"),
});

// Library schema - Categories table
export const categories = pgTable("libaray_Category", {
  id: uuid("id").primaryKey(),
  name: text("name").notNull(),
});

// Library schema - Books table
export const books = pgTable("libaray_Book", {
  id: uuid("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  ISBN: text("ISBN").notNull(),
  cover_URL: text("cover_URL").notNull(),
  publication_date: date("publication_date").notNull(),
  author_id: uuid("author_id"),
  category_id: uuid("category_id"),
  parts_num: integer("parts_num").notNull(),
  total_pages: integer("total_pages").notNull(),
  most_view: integer("most_view"),
});

// Library schema - Chapters table
export const chapters = pgTable("libaray_Chapter", {
  id: uuid("id").primaryKey(),
  title: text("title").notNull(),
  content: jsonb("content"),
  chapter_num: integer("chapter_num").notNull(),
  book_id: uuid("book_id").notNull(),
  Create_at: text("Create_at"),
});

// Library schema - Favorites table
export const favorites = pgTable("libaray_Favorite", {
  id: uuid("id").primaryKey(),
  user_id: uuid("user_id").notNull(),
  book_id: uuid("book_id").notNull(),
  added_at: timestamp("added_at").defaultNow(),
});

// Library schema - Reading History table
export const readingHistory = pgTable("libaray_Reading_history", {
  id: uuid("id").primaryKey(),
  user_id: uuid("user_id").notNull(),
  book_id: uuid("book_id").notNull(),
  last_chapter_read: integer("last_chapter_read"),
  progress_percentage: integer("progress_percentage"),
  last_read_at: timestamp("last_read_at").defaultNow(),
});

// Library schema - Reviews table
export const reviews = pgTable("libaray_Review", {
  id: uuid("id").primaryKey(),
  user_id: uuid("user_id").notNull(),
  book_id: uuid("book_id").notNull(),
  rating: integer("rating").notNull(),
  q1_answer: text("q1_answer"),
  q2_answer: text("q2_answer"),
  q3_answer: text("q3_answer"),
});

// Relations
export const booksRelations = relations(books, ({ one, many }) => ({
  author: one(authors, {
    fields: [books.author_id],
    references: [authors.id],
  }),
  category: one(categories, {
    fields: [books.category_id],
    references: [categories.id],
  }),
  chapters: many(chapters),
  favorites: many(favorites),
  readingHistory: many(readingHistory),
  reviews: many(reviews),
}));

export const authorsRelations = relations(authors, ({ many }) => ({
  books: many(books),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  books: many(books),
}));

export const chaptersRelations = relations(chapters, ({ one }) => ({
  book: one(books, {
    fields: [chapters.book_id],
    references: [books.id],
  }),
}));

export const favoritesRelations = relations(favorites, ({ one }) => ({
  user: one(users, {
    fields: [favorites.user_id],
    references: [users.id],
  }),
  book: one(books, {
    fields: [favorites.book_id],
    references: [books.id],
  }),
}));

export const readingHistoryRelations = relations(readingHistory, ({ one }) => ({
  user: one(users, {
    fields: [readingHistory.user_id],
    references: [users.id],
  }),
  book: one(books, {
    fields: [readingHistory.book_id],
    references: [books.id],
  }),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  user: one(users, {
    fields: [reviews.user_id],
    references: [users.id],
  }),
  book: one(books, {
    fields: [reviews.book_id],
    references: [books.id],
  }),
}));

export const authUserRolesRelations = relations(authUserRoles, ({ one }) => ({
  user: one(users, {
    fields: [authUserRoles.userId],
    references: [users.id],
  }),
  authRole: one(authRoles, {
    fields: [authUserRoles.role],
    references: [authRoles.role],
  }),
}));

export const usersRelations = relations(users, ({ many }) => ({
  authUserRoles: many(authUserRoles),
  favorites: many(favorites),
  readingHistory: many(readingHistory),
  reviews: many(reviews),
}));

// Zod schemas for validation
export const insertUserSchema = createInsertSchema(users).pick({
  displayName: true,
  email: true,
  phoneNumber: true,
  defaultRole: true,
  emailVerified: true,
  disabled: true,
  locale: true,
}).extend({
  displayName: z.string().min(1, "Display name is required"),
  email: z.string().email("Invalid email address"),
  phoneNumber: z.string().optional().nullable(),
  defaultRole: z.enum(["user", "me", "author", "admin"]).default("user"),
  emailVerified: z.boolean().default(false),
  disabled: z.boolean().default(false),
  locale: z.enum(["en", "ar", "fr"]).default("en"),
  password: z.string().optional(),
});

export const updateUserSchema = insertUserSchema.partial();

export const insertAuthorSchema = createInsertSchema(authors).omit({ id: true });
export const updateAuthorSchema = insertAuthorSchema.partial();

export const insertCategorySchema = createInsertSchema(categories).omit({ id: true });
export const updateCategorySchema = insertCategorySchema.partial();

export const insertBookSchema = createInsertSchema(books).omit({ id: true });

export const updateBookSchema = insertBookSchema.partial();

export const insertChapterSchema = createInsertSchema(chapters).omit({ id: true }).extend({
  title: z.string().min(1, "Chapter title is required"),
  chapter_num: z.number().min(1, "Chapter number must be at least 1"),
  book_id: z.string().uuid("Invalid book ID"),
});

export const updateChapterSchema = insertChapterSchema.partial();

export const insertReviewSchema = createInsertSchema(reviews).omit({ id: true }).extend({
  rating: z.number().min(1, "Rating must be at least 1").max(5, "Rating must be at most 5"),
  user_id: z.string().uuid("Invalid user ID"),
  book_id: z.string().uuid("Invalid book ID"),
});

export const updateReviewSchema = insertReviewSchema.partial();

// Type exports
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type UpdateUser = z.infer<typeof updateUserSchema>;

export type Author = typeof authors.$inferSelect;
export type InsertAuthor = z.infer<typeof insertAuthorSchema>;
export type UpdateAuthor = z.infer<typeof updateAuthorSchema>;

export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type UpdateCategory = z.infer<typeof updateCategorySchema>;

export type Book = typeof books.$inferSelect;
export type InsertBook = z.infer<typeof insertBookSchema>;
export type UpdateBook = z.infer<typeof updateBookSchema>;

export type Chapter = typeof chapters.$inferSelect;
export type InsertChapter = z.infer<typeof insertChapterSchema>;
export type UpdateChapter = z.infer<typeof updateChapterSchema>;

export type Review = typeof reviews.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;
export type UpdateReview = z.infer<typeof updateReviewSchema>;

// Favorites schema
export const insertFavoriteSchema = createInsertSchema(favorites).pick({
  user_id: true,
  book_id: true,
}).extend({
  user_id: z.string().uuid("Invalid user ID"),
  book_id: z.string().uuid("Invalid book ID"),
});

export const updateFavoriteSchema = insertFavoriteSchema.partial();

export type Favorite = typeof favorites.$inferSelect;
export type InsertFavorite = z.infer<typeof insertFavoriteSchema>;
export type UpdateFavorite = z.infer<typeof updateFavoriteSchema>;

export type ReadingHistory = typeof readingHistory.$inferSelect;

export type Session = typeof sessions.$inferSelect;
export type AuthRole = typeof authRoles.$inferSelect;
export type AuthUserRole = typeof authUserRoles.$inferSelect;
export type UpsertUser = typeof users.$inferInsert;

// Dashboard stats interface
export interface DashboardStats {
  totalUsers: number;
  totalBooks: number;
  totalAuthors: number;
  totalCategories: number;
  totalChapters: number;
  totalReviews: number;
  totalFavorites: number;
  averageRating: number;
}
