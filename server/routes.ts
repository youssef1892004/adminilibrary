import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, updateUserSchema, insertAuthorSchema, updateAuthorSchema, insertCategorySchema, updateCategorySchema, insertBookSchema, updateBookSchema, insertChapterSchema, updateChapterSchema } from "@shared/schema";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { GRAPHQL_ENDPOINT, ADMIN_SECRET } from "./db";

export async function registerRoutes(app: Express): Promise<Server> {
  // Dashboard stats endpoint
  app.get("/api/dashboard-stats", async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      console.error("Failed to fetch dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  // Get all users
  app.get("/api/users", async (req, res) => {
    try {
      const users = await storage.getUsers();
      res.json(users);
    } catch (error) {
      console.error("Failed to fetch users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  // Get user by ID
  app.get("/api/users/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const user = await storage.getUser(id);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json(user);
    } catch (error) {
      console.error("Failed to fetch user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Create user
  app.post("/api/users", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      res.status(201).json(user);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Failed to create user:", error);
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  // Update user
  app.put("/api/users/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const userData = updateUserSchema.parse(req.body);
      const user = await storage.updateUser(id, userData);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json(user);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Failed to update user:", error);
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  // Delete user
  app.delete("/api/users/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const user = await storage.deleteUser(id);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({ message: "User deleted successfully" });
    } catch (error) {
      console.error("Failed to delete user:", error);
      res.status(500).json({ message: "Failed to delete user" });
    }
  });

  // Get all books
  app.get("/api/books", async (req, res) => {
    try {
      const books = await storage.getBooks();
      res.json(books);
    } catch (error) {
      console.error("Failed to fetch books:", error);
      res.status(500).json({ message: "Failed to fetch books" });
    }
  });

  // Get book by ID
  app.get("/api/books/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const book = await storage.getBook(id);
      
      if (!book) {
        return res.status(404).json({ message: "Book not found" });
      }

      res.json(book);
    } catch (error) {
      console.error("Failed to fetch book:", error);
      res.status(500).json({ message: "Failed to fetch book" });
    }
  });

  // Create book
  app.post("/api/books", async (req, res) => {
    try {
      const bookData = insertBookSchema.parse(req.body);
      const book = await storage.createBook(bookData);
      res.status(201).json(book);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Failed to create book:", error);
      res.status(500).json({ message: "Failed to create book" });
    }
  });

  // Update book
  app.put("/api/books/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const bookData = updateBookSchema.parse(req.body);
      const book = await storage.updateBook(id, bookData);
      
      if (!book) {
        return res.status(404).json({ message: "Book not found" });
      }

      res.json(book);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Failed to update book:", error);
      res.status(500).json({ message: "Failed to update book" });
    }
  });

  // Delete book
  app.delete("/api/books/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const book = await storage.deleteBook(id);
      
      if (!book) {
        return res.status(404).json({ message: "Book not found" });
      }

      res.json({ message: "Book deleted successfully" });
    } catch (error) {
      console.error("Failed to delete book:", error);
      res.status(500).json({ message: "Failed to delete book" });
    }
  });

  // Get all authors
  app.get("/api/authors", async (req, res) => {
    try {
      const authors = await storage.getAuthors();
      res.json(authors);
    } catch (error) {
      console.error("Failed to fetch authors:", error);
      res.status(500).json({ message: "Failed to fetch authors" });
    }
  });

  // Get author by ID
  app.get("/api/authors/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const author = await storage.getAuthor(id);
      
      if (!author) {
        return res.status(404).json({ message: "Author not found" });
      }

      res.json(author);
    } catch (error) {
      console.error("Failed to fetch author:", error);
      res.status(500).json({ message: "Failed to fetch author" });
    }
  });

  // Create author
  app.post("/api/authors", async (req, res) => {
    try {
      const authorData = insertAuthorSchema.parse(req.body);
      const author = await storage.createAuthor(authorData);
      res.status(201).json(author);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Failed to create author:", error);
      res.status(500).json({ message: "Failed to create author" });
    }
  });

  // Update author
  app.put("/api/authors/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const authorData = updateAuthorSchema.parse(req.body);
      const author = await storage.updateAuthor(id, authorData);
      
      if (!author) {
        return res.status(404).json({ message: "Author not found" });
      }

      res.json(author);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Failed to update author:", error);
      res.status(500).json({ message: "Failed to update author" });
    }
  });

  // Delete author
  app.delete("/api/authors/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const author = await storage.deleteAuthor(id);
      
      if (!author) {
        return res.status(404).json({ message: "Author not found" });
      }

      res.json({ message: "Author deleted successfully" });
    } catch (error) {
      console.error("Failed to delete author:", error);
      res.status(500).json({ message: "Failed to delete author" });
    }
  });

  // Get all categories
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  // Get category by ID
  app.get("/api/categories/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const category = await storage.getCategory(id);
      
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }

      res.json(category);
    } catch (error) {
      console.error("Failed to fetch category:", error);
      res.status(500).json({ message: "Failed to fetch category" });
    }
  });

  // Create category
  app.post("/api/categories", async (req, res) => {
    try {
      const categoryData = insertCategorySchema.parse(req.body);
      const category = await storage.createCategory(categoryData);
      res.status(201).json(category);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Failed to create category:", error);
      res.status(500).json({ message: "Failed to create category" });
    }
  });

  // Update category
  app.put("/api/categories/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const categoryData = updateCategorySchema.parse(req.body);
      const category = await storage.updateCategory(id, categoryData);
      
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }

      res.json(category);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Failed to update category:", error);
      res.status(500).json({ message: "Failed to update category" });
    }
  });

  // Delete category
  app.delete("/api/categories/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const category = await storage.deleteCategory(id);
      
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }

      res.json({ message: "Category deleted successfully" });
    } catch (error) {
      console.error("Failed to delete category:", error);
      res.status(500).json({ message: "Failed to delete category" });
    }
  });

  // Get all chapters
  app.get("/api/chapters", async (req, res) => {
    try {
      const chapters = await storage.getChapters();
      res.json(chapters);
    } catch (error) {
      console.error("Failed to fetch chapters:", error);
      res.status(500).json({ message: "Failed to fetch chapters" });
    }
  });

  // Get chapters by book ID
  app.get("/api/books/:bookId/chapters", async (req, res) => {
    try {
      const { bookId } = req.params;
      const chapters = await storage.getChaptersByBook(bookId);
      res.json(chapters);
    } catch (error) {
      console.error("Failed to fetch chapters for book:", error);
      res.status(500).json({ message: "Failed to fetch chapters for book" });
    }
  });

  // Get chapter by ID
  app.get("/api/chapters/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const chapter = await storage.getChapter(id);
      
      if (!chapter) {
        return res.status(404).json({ message: "Chapter not found" });
      }

      res.json(chapter);
    } catch (error) {
      console.error("Failed to fetch chapter:", error);
      res.status(500).json({ message: "Failed to fetch chapter" });
    }
  });

  // Create chapter
  app.post("/api/chapters", async (req, res) => {
    try {
      const chapterData = insertChapterSchema.parse(req.body);
      const chapter = await storage.createChapter(chapterData);
      res.status(201).json(chapter);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Failed to create chapter:", error);
      res.status(500).json({ message: "Failed to create chapter" });
    }
  });

  // Update chapter
  app.put("/api/chapters/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const chapterData = updateChapterSchema.parse(req.body);
      const chapter = await storage.updateChapter(id, chapterData);
      
      if (!chapter) {
        return res.status(404).json({ message: "Chapter not found" });
      }

      res.json(chapter);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Failed to update chapter:", error);
      res.status(500).json({ message: "Failed to update chapter" });
    }
  });

  // Delete chapter
  app.delete("/api/chapters/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const chapter = await storage.deleteChapter(id);
      
      if (!chapter) {
        return res.status(404).json({ message: "Chapter not found" });
      }

      res.json({ message: "Chapter deleted successfully" });
    } catch (error) {
      console.error("Failed to delete chapter:", error);
      res.status(500).json({ message: "Failed to delete chapter" });
    }
  });

  // Setup test users with encrypted passwords - إعداد المستخدمين الاختباريين
  app.post('/api/setup-test-users', async (req, res) => {
    try {
      const testPasswordHash = "$2b$10$CFgLxI6GM6cSeG425nbpHevskoLaVPCVIyXQXbxv7jusL2GG6Ql0m"; // hash for "123456"
      
      // Update test users with password hash
      const updateQuery = `
        mutation updateTestUsers($passwordHash: String!) {
          update_auth_users(
            where: {
              _or: [
                {email: {_eq: "testme@gmail.com"}},
                {email: {_eq: "testauthor@gmail.com"}}
              ]
            },
            _set: {passwordHash: $passwordHash}
          ) {
            affected_rows
            returning {
              id
              email
              displayName
            }
          }
        }
      `;

      const response = await fetch(GRAPHQL_ENDPOINT, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-hasura-admin-secret': ADMIN_SECRET
        },
        body: JSON.stringify({
          query: updateQuery,
          variables: { passwordHash: testPasswordHash }
        }),
      });

      const data = await response.json();
      console.log("Test users setup result:", data);

      res.json({ 
        success: true, 
        message: "Test users updated with encrypted passwords",
        updated: data.data?.update_auth_users?.affected_rows || 0
      });
    } catch (error) {
      console.error("Error setting up test users:", error);
      res.status(500).json({ message: "Failed to setup test users" });
    }
  });

  // Simple login endpoint - تسجيل دخول بسيط يتحقق من وجود المستخدم
  app.post('/api/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      console.log("Login attempt for email:", email);
      
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }

      // البحث عن المستخدم في قاعدة البيانات
      const users = await storage.getUsers();
      console.log("Found users count:", users.length);
      const user = users.find(u => u.email === email);
      
      if (!user) {
        console.log("User not found with email:", email);
        return res.status(401).json({ message: "البريد الإلكتروني أو كلمة المرور غير صحيحة" });
      }

      console.log("User found:", user.email, "ID:", user.id);

      // التحقق من كلمة المرور
      if (!user.passwordHash) {
        console.log("No password hash found for user:", email);
        return res.status(401).json({ message: "البريد الإلكتروني أو كلمة المرور غير صحيحة" });
      }

      const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
      console.log("Checking encrypted password for:", email, "Result:", isPasswordValid);

      if (!isPasswordValid) {
        console.log("Invalid password for user:", email);
        return res.status(401).json({ message: "البريد الإلكتروني أو كلمة المرور غير صحيحة" });
      }

      console.log("Password verified successfully for:", email);

      // الحصول على أدوار المستخدم
      let roles = [];
      try {
        roles = await storage.getUserRoles(user.id);
        console.log("User roles:", roles);
      } catch (roleError) {
        console.log("Could not get roles, using default");
        roles = ['admin']; // دور افتراضي
      }
      
      // التحقق من صلاحيات المستخدم والتحديد
      const hasMe = roles.includes('me');
      const hasAdmin = roles.includes('admin');
      const hasAuthor = roles.includes('author');
      const hasUser = roles.includes('user');
      const hasAnonymous = roles.includes('anonymous');
      
      // منع دخول المستخدمين العاديين والمجهولين
      if ((hasUser && !hasMe && !hasAdmin && !hasAuthor) || hasAnonymous) {
        console.log("Access denied for user with roles:", roles);
        return res.status(403).json({ 
          message: "غير مصرح لك بالدخول - ليس لديك صلاحيات كافية",
          accessDenied: true 
        });
      }
      
      // تحديد نوع الداشبورد بناءً على الأدوار
      let dashboardType = 'admin'; // افتراضياً للـ me والـ admin
      
      if (hasAuthor && !hasMe && !hasAdmin) {
        dashboardType = 'author';
      }
      // إذا كان الإيميل يحتوي على "author" فاعتبره مؤلف
      else if (email.toLowerCase().includes('author')) {
        dashboardType = 'author';
        // إضافة دور author للمستخدم إذا لم يكن موجود
        if (!hasAuthor) {
          roles.push('author');
        }
      }

      console.log("Login successful for:", user.email, "Dashboard:", dashboardType);

      res.json({ 
        user: { ...user, roles }, 
        dashboardType,
        redirectTo: dashboardType === 'author' ? '/author-dashboard' : '/'
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  // Check current user (for session management)
  app.get('/api/auth/me', async (req, res) => {
    // للتطبيق البسيط، سنعيد دائماً unauthorized
    // يمكن إضافة session management لاحقاً إذا أردت
    res.status(401).json({ message: "Not authenticated" });
  });

  // Favorites endpoints
  app.get("/api/favorites", async (req, res) => {
    try {
      const favorites = await storage.getFavorites();
      res.json(favorites);
    } catch (error) {
      console.error("Error getting favorites:", error);
      res.status(500).json({ error: "Failed to get favorites" });
    }
  });

  app.delete("/api/favorites/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteFavorite(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting favorite:", error);
      res.status(500).json({ error: "Failed to delete favorite" });
    }
  });

  // User update endpoint
  app.put("/api/users/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const userData = req.body;
      
      const updatedUser = await storage.updateUser(id, {
        ...userData,
        id: id,
      });
      
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ error: "Failed to update user" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
