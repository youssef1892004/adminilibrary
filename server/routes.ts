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

  // Get all books (with author filtering for non-admin users)
  app.get("/api/books", async (req, res) => {
    try {
      const sessionUser = (req.session as any)?.user;
      let books = await storage.getBooks();
      
      // Apply author filtering for non-admin users based on user_id
      if (sessionUser?.dashboard === 'author' && sessionUser?.id) {
        console.log("Filtering books for user_id:", sessionUser.id);
        // First get the author by user_id
        const author = await storage.getAuthorByUserId(sessionUser.id);
        if (author) {
          books = books.filter((book: any) => book.author_id === author.id);
          console.log("Filtered books count for author:", author.id, ":", books.length);
        } else {
          books = []; // No author found, no books
        }
      }
      
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

  // Create book (automatically assign to author for non-admin users)
  app.post("/api/books", async (req, res) => {
    try {
      const sessionUser = (req.session as any)?.user;
      console.log("Create book request body:", JSON.stringify(req.body, null, 2));
      console.log("Session user:", JSON.stringify(sessionUser, null, 2));
      
      try {
        // Validate book data using the schema
        let bookData = insertBookSchema.parse(req.body);
        
        // For author users, automatically assign the book to their author_id based on user_id
        if (sessionUser?.dashboard === 'author' && sessionUser?.id) {
          console.log("Auto-assigning book to user_id:", sessionUser.id);
          const author = await storage.getAuthorByUserId(sessionUser.id);
          if (author) {
            bookData = { ...bookData, author_id: author.id };
            console.log("Book assigned to author:", author.id);
          } else {
            return res.status(403).json({ message: "لم يتم العثور على بيانات المؤلف" });
          }
        }
        
        console.log("Final book data to create:", JSON.stringify(bookData, null, 2));
        const book = await storage.createBook(bookData);
        res.status(201).json(book);
      } catch (validationError: any) {
        console.error("Validation error:", validationError);
        if (validationError instanceof z.ZodError) {
          return res.status(400).json({ 
            message: "خطأ في التحقق من البيانات", 
            errors: validationError.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
          });
        }
        throw validationError;
      }
    } catch (error: any) {
      console.error("Failed to create book - Full error:", error);
      res.status(500).json({ message: "خطأ في إضافة الكتاب", error: error.message });
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

  // Session endpoint - للتحقق من حالة تسجيل الدخول الحالية
  app.get('/api/session', (req, res) => {
    const sessionUser = (req.session as any)?.user;
    if (!sessionUser) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    res.json({ user: sessionUser });
  });

  // Author profile endpoint - جلب بيانات المؤلف الحالي
  app.get('/api/auth/author-profile', async (req, res) => {
    try {
      const sessionUser = (req.session as any)?.user;
      if (!sessionUser || sessionUser.dashboard !== 'author') {
        return res.status(401).json({ message: "Author authentication required" });
      }

      // Use user_id to get author data instead of authorId
      const author = await storage.getAuthorByUserId(sessionUser.id);
      if (!author) {
        return res.status(404).json({ message: "Author profile not found" });
      }

      console.log("Author profile requested for user_id:", sessionUser.id, "Found author:", author.id);
      res.json(author);
    } catch (error) {
      console.error("Failed to fetch author profile:", error);
      res.status(500).json({ message: "Failed to fetch author profile" });
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

  // Get all chapters (with author filtering for non-admin users)
  app.get("/api/chapters", async (req, res) => {
    try {
      const sessionUser = (req.session as any)?.user;
      let chapters: any[];
      
      // Apply author filtering for non-admin users based on user_id
      if (sessionUser?.dashboard === 'author' && sessionUser?.id) {
        console.log("Filtering chapters for user_id:", sessionUser.id);
        // First get the author by user_id
        const author = await storage.getAuthorByUserId(sessionUser.id);
        if (author) {
          // Get all books by this author
          const books = await storage.getBooks();
          const authorBooks = books.filter((book: any) => book.author_id === author.id);
          const authorBookIds = authorBooks.map((book: any) => book.id);
          
          // Use GraphQL filtering to get chapters only from author's books
          chapters = await storage.getChapters(authorBookIds);
          console.log("Filtered chapters count for author:", author.id, ":", chapters.length);
        } else {
          chapters = []; // No author found, no chapters
        }
      } else {
        // Admin users get all chapters
        chapters = await storage.getChapters();
      }
      
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

  // Create chapter (with author validation)
  app.post("/api/chapters", async (req, res) => {
    try {
      const sessionUser = (req.session as any)?.user;
      const chapterData = insertChapterSchema.parse(req.body);
      
      // For author users, validate that the book belongs to them based on user_id
      if (sessionUser?.dashboard === 'author' && sessionUser?.id) {
        console.log("Validating book ownership for user_id:", sessionUser.id);
        const author = await storage.getAuthorByUserId(sessionUser.id);
        if (author) {
          const books = await storage.getBooks();
          const book = books.find((b: any) => b.id === chapterData.book_id);
          
          if (!book || book.author_id !== author.id) {
            return res.status(403).json({ message: "ليس لديك صلاحية لإضافة فصل لهذا الكتاب" });
          }
        } else {
          return res.status(403).json({ message: "لم يتم العثور على بيانات المؤلف" });
        }
      }
      
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

  // Author-specific API endpoints
  // Get books for current author only
  app.get("/api/author/books", async (req, res) => {
    try {
      const sessionUser = (req.session as any)?.user;
      
      if (!sessionUser?.id) {
        return res.status(401).json({ message: "غير مصرح لك بالوصول" });
      }
      
      // Get author by user_id
      const author = await storage.getAuthorByUserId(sessionUser.id);
      if (!author) {
        return res.status(404).json({ message: "لم يتم العثور على بيانات المؤلف" });
      }
      
      const books = await storage.getBooks();
      const authorBooks = books.filter((book: any) => book.author_id === author.id);
      
      res.json(authorBooks);
    } catch (error) {
      console.error("Failed to fetch author books:", error);
      res.status(500).json({ message: "فشل في جلب كتب المؤلف" });
    }
  });

  // Create book for current author
  app.post("/api/author/books", async (req, res) => {
    try {
      const sessionUser = (req.session as any)?.user;
      
      if (!sessionUser?.id) {
        return res.status(401).json({ message: "غير مصرح لك بالوصول" });
      }
      
      // Get author by user_id
      const author = await storage.getAuthorByUserId(sessionUser.id);
      if (!author) {
        return res.status(404).json({ message: "لم يتم العثور على بيانات المؤلف" });
      }
      
      try {
        // Validate and prepare book data
        let bookData = insertBookSchema.parse(req.body);
        
        // Automatically assign the book to this author
        bookData = { ...bookData, author_id: author.id };
        
        console.log("Creating book for author:", author.id, "data:", JSON.stringify(bookData, null, 2));
        const book = await storage.createBook(bookData);
        res.status(201).json(book);
      } catch (validationError: any) {
        console.error("Validation error:", validationError);
        if (validationError instanceof z.ZodError) {
          return res.status(400).json({ 
            message: "خطأ في التحقق من البيانات", 
            errors: validationError.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
          });
        }
        throw validationError;
      }
    } catch (error: any) {
      console.error("Failed to create author book:", error);
      res.status(500).json({ message: "فشل في إضافة الكتاب", error: error.message });
    }
  });

  // Update book for current author
  app.put("/api/author/books/:id", async (req, res) => {
    try {
      const sessionUser = (req.session as any)?.user;
      const { id } = req.params;
      
      if (!sessionUser?.id) {
        return res.status(401).json({ message: "غير مصرح لك بالوصول" });
      }
      
      // Get author by user_id
      const author = await storage.getAuthorByUserId(sessionUser.id);
      if (!author) {
        return res.status(404).json({ message: "لم يتم العثور على بيانات المؤلف" });
      }
      
      // Check if book belongs to this author
      const existingBook = await storage.getBook(id);
      if (!existingBook || existingBook.author_id !== author.id) {
        return res.status(403).json({ message: "غير مصرح لك بتعديل هذا الكتاب" });
      }
      
      try {
        const bookData = updateBookSchema.parse(req.body);
        const book = await storage.updateBook(id, bookData);
        res.json(book);
      } catch (validationError: any) {
        if (validationError instanceof z.ZodError) {
          return res.status(400).json({ 
            message: "خطأ في التحقق من البيانات", 
            errors: validationError.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
          });
        }
        throw validationError;
      }
    } catch (error: any) {
      console.error("Failed to update author book:", error);
      res.status(500).json({ message: "فشل في تحديث الكتاب", error: error.message });
    }
  });

  // Delete book for current author
  app.delete("/api/author/books/:id", async (req, res) => {
    try {
      const sessionUser = (req.session as any)?.user;
      const { id } = req.params;
      
      if (!sessionUser?.id) {
        return res.status(401).json({ message: "غير مصرح لك بالوصول" });
      }
      
      // Get author by user_id
      const author = await storage.getAuthorByUserId(sessionUser.id);
      if (!author) {
        return res.status(404).json({ message: "لم يتم العثور على بيانات المؤلف" });
      }
      
      // Check if book belongs to this author
      const existingBook = await storage.getBook(id);
      if (!existingBook || existingBook.author_id !== author.id) {
        return res.status(403).json({ message: "غير مصرح لك بحذف هذا الكتاب" });
      }
      
      const book = await storage.deleteBook(id);
      res.json({ message: "تم حذف الكتاب بنجاح" });
    } catch (error: any) {
      console.error("Failed to delete author book:", error);
      res.status(500).json({ message: "فشل في حذف الكتاب", error: error.message });
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

      // التحقق من كلمة المرور - مؤقتاً نسمح لأي مستخدم بكلمة مرور testpass123
      let isPasswordValid = false;
      
      if (password === "testpass123") {
        isPasswordValid = true;
        console.log("Using default test password for:", email);
      } else if (user.passwordHash) {
        isPasswordValid = await bcrypt.compare(password, user.passwordHash);
        console.log("Checking encrypted password for:", email, "Result:", isPasswordValid);
      }

      if (!isPasswordValid) {
        console.log("Invalid password for user:", email);
        return res.status(401).json({ message: "البريد الإلكتروني أو كلمة المرور غير صحيحة" });
      }

      console.log("Password verified successfully for:", email);

      // الحصول على دور المستخدم من defaultRole
      let roles = [];
      if (user.defaultRole) {
        roles = [user.defaultRole];
        console.log("User role from defaultRole:", user.defaultRole);
      } else {
        console.log("No defaultRole found for user, using admin as default");
        roles = ['admin']; // دور افتراضي
      }
      console.log("User roles:", roles);
      
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
      
      // Helper function to ensure unique author assignment
      const ensureAuthorForUser = async (userId: string, userEmail: string, displayName: string): Promise<string | null> => {
        try {
          let author = await storage.getAuthorByUserId(userId);
          
          if (!author) {
            console.log("Creating new author for user_id:", userId);
            const newAuthor = await storage.createAuthor({
              name: displayName || userEmail.split('@')[0],
              bio: `مؤلف في مكتبة الكتب`,
              book_num: 0,
              image_url: null,
              Category_Id: null,
              user_id: userId
            });
            author = newAuthor;
            console.log("Created author:", author.id, "for user:", userEmail);
          } else {
            console.log("Found existing author:", author.id, "for user_id:", userId);
          }
          
          // Verify the author belongs to this user
          if (author && author.user_id === userId) {
            console.log("Verified author ownership:", author.id, "for user_id:", userId);
            return author.id;
          } else {
            console.log("Author ownership mismatch! Author user_id:", author?.user_id, "Expected:", userId);
            return null;
          }
        } catch (error) {
          console.log("Error ensuring author for user_id:", userId, error);
          return null;
        }
      };

      // تحديد نوع الداشبورد بناءً على الأدوار
      let dashboardType = 'admin'; // افتراضياً للـ me والـ admin
      let authorId = null;
      
      if (hasAuthor && !hasMe && !hasAdmin) {
        dashboardType = 'author';
        authorId = await ensureAuthorForUser(user.id, user.email, user.displayName);
      }
      // إذا كان الإيميل يحتوي على "author" فاعتبره مؤلف
      else if (email.toLowerCase().includes('author')) {
        dashboardType = 'author';
        // إضافة دور author للمستخدم إذا لم يكن موجود
        if (!hasAuthor) {
          roles.push('author');
        }
        authorId = await ensureAuthorForUser(user.id, user.email, user.displayName);
      }

      console.log("Login successful for:", user.email, "Dashboard:", dashboardType, "AuthorId:", authorId);

      // Store session data with verified author_id
      (req.session as any).user = {
        id: user.id,
        email: user.email,
        roles: roles,
        dashboard: dashboardType,
        authorId: authorId
      };
      
      console.log("Session user stored:", JSON.stringify((req.session as any).user, null, 2));

      res.json({ 
        user: { ...user, roles, authorId }, 
        dashboardType,
        redirectTo: dashboardType === 'author' ? '/author-dashboard' : '/',
        clearCache: true // إشارة لـ frontend لمسح الـ cache
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  // Get current session data
  app.get('/api/session', async (req, res) => {
    const sessionUser = (req.session as any)?.user;
    if (!sessionUser) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    res.json({ user: sessionUser });
  });

  // Check current user (for session management)
  app.get('/api/auth/me', async (req, res) => {
    const sessionUser = (req.session as any)?.user;
    if (!sessionUser) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    res.json({ user: sessionUser });
  });

  // Get current author profile
  app.get('/api/auth/author-profile', async (req, res) => {
    try {
      const sessionUser = (req.session as any)?.user;
      console.log("Author profile request - session user:", JSON.stringify(sessionUser, null, 2));
      
      if (!sessionUser) {
        console.log("No session user found");
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      if (sessionUser.dashboard !== 'author') {
        console.log("User dashboard is not 'author':", sessionUser.dashboard);
        return res.status(403).json({ message: "Access denied - Authors only" });
      }

      console.log("Fetching author by user_id:", sessionUser.id);
      const author = await storage.getAuthorByUserId(sessionUser.id);
      if (!author) {
        console.log("No author found for user_id:", sessionUser.id);
        return res.status(404).json({ message: "Author profile not found" });
      }

      console.log("Returning author data:", JSON.stringify(author, null, 2));
      res.json(author);
    } catch (error) {
      console.error("Failed to fetch author profile:", error);
      res.status(500).json({ message: "Failed to fetch author profile" });
    }
  });

  // Update current author profile
  app.put('/api/auth/author-profile', async (req, res) => {
    try {
      const sessionUser = (req.session as any)?.user;
      if (!sessionUser || sessionUser.dashboard !== 'author') {
        return res.status(403).json({ message: "Access denied - Authors only" });
      }

      const author = await storage.getAuthorByUserId(sessionUser.id);
      if (!author) {
        return res.status(404).json({ message: "Author profile not found" });
      }

      const updateData = req.body;
      const updatedAuthor = await storage.updateAuthor(author.id, updateData);
      
      if (!updatedAuthor) {
        return res.status(404).json({ message: "Failed to update author profile" });
      }

      res.json(updatedAuthor);
    } catch (error) {
      console.error("Failed to update author profile:", error);
      res.status(500).json({ message: "Failed to update author profile" });
    }
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
