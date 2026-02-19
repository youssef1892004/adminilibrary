import { graphqlRequest } from "./db";
import {
  Author,
  Book,
  Category,
  User,
  Chapter,
  InsertAuthor,
  InsertBook,
  InsertCategory,
  InsertUser,
  InsertChapter,
  UpdateAuthor,
  UpdateBook,
  UpdateCategory,
  UpdateUser,
  UpdateChapter,
  UpsertUser,
  InsertFeedback
} from "../shared/schema";

export interface IStorage {
  // Users
  getUsers(): Promise<User[]>;
  getUser(id: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, user: UpdateUser): Promise<User | undefined>;
  deleteUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

  // Authors
  getAuthors(): Promise<Author[]>;
  getAuthor(id: string): Promise<Author | undefined>;
  getAuthorByUserId(userId: string): Promise<Author | undefined>;
  createAuthor(author: InsertAuthor): Promise<Author>;
  updateAuthor(id: string, author: UpdateAuthor): Promise<Author | undefined>;
  deleteAuthor(id: string): Promise<Author | undefined>;

  // Books
  getBooks(): Promise<Book[]>;
  getBook(id: string): Promise<Book | undefined>;
  createBook(book: InsertBook): Promise<Book>;
  updateBook(id: string, book: UpdateBook): Promise<Book | undefined>;
  deleteBook(id: string): Promise<Book | undefined>;

  // Categories
  getCategories(): Promise<Category[]>;
  getCategory(id: string): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: string, category: UpdateCategory): Promise<Category | undefined>;
  deleteCategory(id: string): Promise<Category | undefined>;

  // Chapters
  getChapters(bookIds?: string[], options?: { page?: number; limit?: number; search?: string }): Promise<{ chapters: Chapter[], total: number }>;
  getChaptersByBook(bookId: string): Promise<Chapter[]>;
  getChapter(id: string): Promise<Chapter | undefined>;
  createChapter(chapter: InsertChapter): Promise<Chapter>;
  updateChapter(id: string, chapter: UpdateChapter): Promise<Chapter | undefined>;
  deleteChapter(id: string): Promise<Chapter | undefined>;

  // Dashboard
  getDashboardStats(): Promise<{
    totalUsers: number;
    totalBooks: number;
    totalAuthors: number;
    totalCategories: number;
    totalChapters: number;
  }>;

  // Auth methods
  getUserRoles(userId: string): Promise<string[]>;
  getAuthRoles(): Promise<string[]>;
}

class GraphQLStorage implements IStorage {
  // Users management - from GraphQL (using correct table: users)
  async getUsers(): Promise<User[]> {
    const query = `
      query users {
        users {
          activeMfaType
          avatarUrl
          createdAt
          currentChallenge
          defaultRole
          disabled
          displayName
          email
          emailVerified
          id
          isAnonymous
          lastSeen
          locale
          metadata
          newEmail
          otpHash
          otpHashExpiresAt
          otpMethodLastUsed
          passwordHash
          phoneNumber
          phoneNumberVerified
          ticket
          ticketExpiresAt
          totpSecret
          updatedAt
        }
      }
    `;

    try {
      console.log("Making GraphQL request for users...");
      const data = await graphqlRequest(query);
      console.log("GraphQL response for users:", JSON.stringify(data, null, 2));

      if (!data || !data.users) {
        console.log("No users data returned from GraphQL");
        return [];
      }

      const users = data.users.map((user: any) => ({
        id: user.id,
        displayName: user.displayName,
        email: user.email,
        emailVerified: user.emailVerified,
        phoneNumber: user.phoneNumber,
        disabled: user.disabled,
        defaultRole: user.defaultRole,
        isAnonymous: user.isAnonymous,
        lastSeen: user.lastSeen,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        locale: user.locale,
        metadata: user.metadata,
        avatarUrl: user.avatarUrl,
        passwordHash: user.passwordHash // Include passwordHash for authentication
      }));

      console.log("Processed users:", users.map((u: any) => ({ id: u.id, email: u.email, displayName: u.displayName })));
      return users;
    } catch (error) {
      console.error("GraphQL error getting users:", error);
      return [];
    }
  }

  async getUser(id: string): Promise<User | undefined> {
    const query = `
      query GetUser($id: uuid!) {
        users(where: {id: {_eq: $id}}, limit: 1) {
          id
          displayName
          email
          emailVerified
          phoneNumber
          disabled
          defaultRole
          isAnonymous
          lastSeen
          locale
          metadata
          avatarUrl
          passwordHash
          createdAt
          updatedAt
        }
      }
    `;

    try {
      const data = await graphqlRequest(query, { id });
      if (!data.users || data.users.length === 0) return undefined;
      return data.users[0];
    } catch (error) {
      console.error("GraphQL error getting user:", error);
      return undefined;
    }
  }

  async createUser(user: InsertUser): Promise<User> {
    // تنظيف البيانات قبل الإرسال
    const cleanUser = {
      ...user,
      phoneNumber: user.phoneNumber?.trim() || null
    };

    // Ensure virtual password field is removed
    delete (cleanUser as any).password;

    const mutation = `
      mutation insertUser($object: users_insert_input!) {
        insertUser(object: $object) {
          activeMfaType
          avatarUrl
          createdAt
          currentChallenge
          defaultRole
          disabled
          displayName
          email
          emailVerified
          id
          isAnonymous
          lastSeen
          locale
          metadata
          newEmail
          otpHash
          otpHashExpiresAt
          otpMethodLastUsed
          passwordHash
          phoneNumber
          phoneNumberVerified
          ticket
          ticketExpiresAt
          totpSecret
          updatedAt
        }
      }
    `;

    try {
      console.log("Creating user with data:", { object: cleanUser });
      const data = await graphqlRequest(mutation, { object: cleanUser });
      console.log("Create user response:", data);
      return data.insertUser;
    } catch (error) {
      console.error("GraphQL error creating user:", error);
      throw error;
    }
  }

  async updateUser(id: string, user: UpdateUser): Promise<User | undefined> {
    // تنظيف البيانات قبل الإرسال
    const cleanUser = {
      ...user,
      phoneNumber: user.phoneNumber?.trim() || null
    };

    // Ensure virtual password field is removed
    delete (cleanUser as any).password;

    const mutation = `
      mutation updateUser($id: uuid!, $object: users_set_input!) {
        updateUser(pk_columns: {id: $id}, _set: $object) {
          activeMfaType
          avatarUrl
          createdAt
          currentChallenge
          defaultRole
          disabled
          displayName
          email
          emailVerified
          id
          isAnonymous
          lastSeen
          locale
          metadata
          newEmail
          otpHash
          otpHashExpiresAt
          otpMethodLastUsed
          passwordHash
          phoneNumber
          phoneNumberVerified
          ticket
          ticketExpiresAt
          totpSecret
          updatedAt
        }
      }
    `;

    try {
      console.log("Updating user with data:", { id, object: cleanUser });
      const data = await graphqlRequest(mutation, { id, object: cleanUser });
      console.log("Update user response:", data);
      return data.updateUser;
    } catch (error) {
      console.error("GraphQL error updating user:", error);
      throw error;
    }
  }

  async deleteUser(id: string): Promise<User | undefined> {
    const mutation = `
      mutation deleteUser($id: uuid!) {
        deleteUser(id: $id) {
          activeMfaType
          avatarUrl
          createdAt
          currentChallenge
          defaultRole
          disabled
          displayName
          email
          emailVerified
          id
          isAnonymous
          lastSeen
          locale
          metadata
          newEmail
          otpHash
          otpHashExpiresAt
          otpMethodLastUsed
          passwordHash
          phoneNumber
          phoneNumberVerified
          ticket
          ticketExpiresAt
          totpSecret
          updatedAt
        }
      }
    `;

    try {
      console.log("Deleting user with id:", id);
      const data = await graphqlRequest(mutation, { id });
      console.log("Delete user response:", data);
      return data.deleteUser;
    } catch (error) {
      console.error("GraphQL error deleting user:", error);
      throw error;
    }
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    // استخدام الاستعلام الذي زودته
    const query = `
      query users {
        users {
          activeMfaType
          avatarUrl
          createdAt
          currentChallenge
          defaultRole
          disabled
          displayName
          email
          emailVerified
          id
          isAnonymous
          lastSeen
          locale
          metadata
          newEmail
          otpHash
          otpHashExpiresAt
          otpMethodLastUsed
          passwordHash
          phoneNumber
          phoneNumberVerified
          ticket
          ticketExpiresAt
          totpSecret
          updatedAt
        }
      }
    `;

    try {
      const data = await graphqlRequest(query);
      // البحث عن المستخدم الحالي أو إنشاء واحد جديد
      const existingUser = data.users.find((user: any) => user.id === userData.id);
      if (existingUser) {
        return existingUser;
      }

      // إرجاع مستخدم افتراضي للآن
      return {
        id: userData.id || "default-user",
        displayName: userData.displayName || "مستخدم",
        email: userData.email || "user@example.com",
        emailVerified: true,
        phoneNumber: null,
        phoneNumberVerified: false,
        defaultRole: "user",
        disabled: false,
        locale: "ar",
        avatarUrl: userData.avatarUrl || "",
        isAnonymous: false,
        activeMfaType: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastSeen: new Date(),
        metadata: null,
        newEmail: null,
        currentChallenge: null,
        passwordHash: null,
        otpHash: null,
        otpHashExpiresAt: null,
        otpMethodLastUsed: null,
        ticket: null,
        ticketExpiresAt: null,
        totpSecret: null,
      };
    } catch (error) {
      console.error("GraphQL error getting users:", error);
      throw error;
    }
  }

  // دالة للحصول على أدوار المستخدم
  async getUserRoles(userId: string): Promise<string[]> {
    const query = `
      query authUserRoles {
        authUserRoles(where: {userId: {_eq: "${userId}"}}) {
          createdAt
          id
          role
          userId
        }
      }
    `;

    try {
      console.log("Getting roles for user:", userId);
      const data = await graphqlRequest(query);
      console.log("User roles response:", data);
      const roles = data.authUserRoles.map((userRole: any) => userRole.role);
      console.log("Extracted roles:", roles);
      return roles;
    } catch (error) {
      console.error("GraphQL error getting user roles:", error);
      return ['user']; // fallback role
    }
  }

  // دالة للحصول على الأدوار المتاحة
  async getAuthRoles(): Promise<string[]> {
    const query = `
      query authRoles {
        authRoles {
          role
        }
      }
    `;

    try {
      const data = await graphqlRequest(query);
      console.log("Auth roles response:", data);
      const roles = data.authRoles.map((role: any) => role.role);
      console.log("Available roles:", roles);
      return roles;
    } catch (error) {
      console.error("GraphQL error getting auth roles:", error);
      // إرجاع الأدوار التي ذكرتها
      return ["user", "anonymous", "me", "author"];
    }
  }

  // Authors management - from GraphQL (Updated with user_id)
  async getAuthors(): Promise<Author[]> {
    const query = `
      query GetAutor {
        libaray_Autor {
          book_num
          bio
          image_url
          name
          Category_Id
          id
          user_id
        }
      }
    `;

    try {
      const data = await graphqlRequest(query);
      return data.libaray_Autor.map((author: any) => ({
        ...author,
        birth_date: null,
        nationality: null
      }));
    } catch (error) {
      console.error("GraphQL error getting authors:", error);
      return [];
    }
  }

  async getAuthor(id: string): Promise<Author | undefined> {
    const query = `
      query GetAuthor($id: uuid!) {
        libaray_Autor_by_pk(id: $id) {
          book_num
          bio
          image_url
          name
          Category_Id
          id
          user_id
        }
      }
    `;

    try {
      const data = await graphqlRequest(query, { id });
      if (data.libaray_Autor_by_pk) {
        return {
          ...data.libaray_Autor_by_pk,
          birth_date: null,
          nationality: null
        };
      }
      return undefined;
    } catch (error) {
      console.error("GraphQL error getting author:", error);
      return undefined;
    }
  }

  async getAuthorByUserId(userId: string): Promise<Author | undefined> {
    const query = `
      query GetAutorByUserId($user_id: uuid!) {
        libaray_Autor(where: {user_id: {_eq: $user_id}}) {
          book_num
          bio
          image_url
          name
          Category_Id
          id
          user_id
        }
      }
    `;

    try {
      const data = await graphqlRequest(query, { user_id: userId });
      if (data.libaray_Autor && data.libaray_Autor.length > 0) {
        const author = data.libaray_Autor[0];

        // Fetch actual book count using a separate query to avoid relationship issues
        const countQuery = `
          query GetAuthorBookCount($author_id: uuid!) {
            libaray_Book_aggregate(where: {author_id: {_eq: $author_id}}) {
              aggregate {
                count
              }
            }
          }
        `;

        try {
          const countData = await graphqlRequest(countQuery, { author_id: author.id });
          const actualBookCount = countData.libaray_Book_aggregate?.aggregate?.count || 0;
          return {
            ...author,
            book_num: actualBookCount,
            birth_date: null,
            nationality: null
          };
        } catch (countError) {
          console.error("Error fetching book count, falling back to stored value:", countError);
          return {
            ...author,
            birth_date: null,
            nationality: null
          };
        }
      }
      return undefined;
    } catch (error) {
      console.error("GraphQL error getting author by user_id:", error);
      return undefined;
    }
  }

  async createAuthor(author: InsertAuthor): Promise<Author> {
    const mutation = `
      mutation InsertAutor($book_num: Int, $bio: String, $image_url: String, $name: String, $Category_Id: uuid, $user_id: uuid) {
        insert_libaray_Autor(objects: {book_num: $book_num, bio: $bio, image_url: $image_url, name: $name, Category_Id: $Category_Id, user_id: $user_id}) {
          affected_rows
          returning {
            book_num
            bio
            image_url
            name
            Category_Id
            id
            user_id
          }
        }
      }
    `;

    try {
      const data = await graphqlRequest(mutation, author);
      return {
        ...data.insert_libaray_Autor.returning[0],
        birth_date: null,
        nationality: null
      };
    } catch (error) {
      console.error("GraphQL error creating author:", error);
      throw error;
    }
  }

  async updateAuthor(id: string, author: UpdateAuthor): Promise<Author | undefined> {
    const mutation = `
      mutation UpdateAutor($id: uuid!, $book_num: Int, $bio: String, $image_url: String, $name: String, $Category_Id: uuid) {
        update_libaray_Autor_by_pk(pk_columns: {id: $id}, _set: {book_num: $book_num, bio: $bio, image_url: $image_url, name: $name, Category_Id: $Category_Id}) {
          book_num
          bio
          image_url
          name
          Category_Id
          id
          user_id
        }
      }
    `;

    try {
      const variables = {
        id,
        book_num: author.book_num,
        bio: author.bio,
        image_url: author.image_url,
        name: author.name,
        Category_Id: author.Category_Id || null
      };

      const data = await graphqlRequest(mutation, variables);
      if (data.update_libaray_Autor_by_pk) {
        return {
          ...data.update_libaray_Autor_by_pk,
          birth_date: null,
          nationality: null
        };
      }
      return undefined;
    } catch (error) {
      console.error("GraphQL error updating author:", error);
      return undefined;
    }
  }

  async deleteAuthor(id: string): Promise<Author | undefined> {
    const mutation = `
      mutation DeleteAuthor($id: uuid!) {
        delete_libaray_Autor_by_pk(id: $id) {
          id
          name
          bio
          birth_date
          nationality
        }
      }
    `;

    try {
      const data = await graphqlRequest(mutation, { id });
      return data.delete_libaray_Autor_by_pk;
    } catch (error) {
      console.error("GraphQL error deleting author:", error);
      return undefined;
    }
  }

  // Books management - from GraphQL
  async getBooks(): Promise<Book[]> {
    const query = `
      query GetBooks {
        libaray_Book {
          id
          title
          description
          ISBN
          coverImage
          publicationDate
          total_pages
          author_id
          Category_id
        }
      }
    `;

    const chaptersQuery = `
      query GetChapterCounts {
        libaray_Chapter {
          book__id
        }
      }
    `;

    try {
      const [booksData, chaptersData] = await Promise.all([
        graphqlRequest(query),
        graphqlRequest(chaptersQuery)
      ]);

      // Count chapters per book
      const chapterCounts = new Map<string, number>();
      if (chaptersData.libaray_Chapter) {
        chaptersData.libaray_Chapter.forEach((chapter: any) => {
          if (chapter.book__id) {
            chapterCounts.set(chapter.book__id, (chapterCounts.get(chapter.book__id) || 0) + 1);
          }
        });
      }

      return booksData.libaray_Book.map((book: any) => ({
        id: book.id,
        title: book.title,
        description: book.description,
        ISBN: book.ISBN?.toString(),
        cover_URL: book.coverImage,
        publication_date: book.publicationDate,
        parts_num: chapterCounts.get(book.id) || 0,
        chapter_num: chapterCounts.get(book.id) || 0, // Use the dynamically calculated count
        total_pages: book.total_pages,
        author_id: book.author_id,
        category_id: book.Category_id,
        most_view: 0
      }));
    } catch (error) {
      console.error("GraphQL error getting books:", error);
      return [];
    }
  }

  async getBook(id: string): Promise<Book | undefined> {
    const query = `
      query GetBook($id: uuid!) {
        libaray_Book_by_pk(id: $id) {
          id
          title
          description
          ISBN
          coverImage
          publicationDate
          chapter_num
          total_pages
          author_id
          Category_id
        }
      }
    `;

    try {
      const data = await graphqlRequest(query, { id });
      const book = data.libaray_Book_by_pk;
      if (book) {
        // Transform field names to match frontend expectations
        return {
          ...book,
          cover_URL: book.coverImage,
          publication_date: book.publicationDate,
          parts_num: book.chapter_num,
          category_id: book.Category_id
        };
      }
      return book;
    } catch (error) {
      console.error("GraphQL error getting book:", error);
      return undefined;
    }
  }

  async createBook(book: any): Promise<Book> {
    const mutation = `
      mutation InsertBook($publicationDate: date, $chapter_num: Int, $ISBN: Int, $total_pages: Int, $coverImage: String, $description: String, $title: String, $author_id: uuid, $Category_id: uuid) {
        insert_libaray_Book(objects: {publicationDate: $publicationDate, chapter_num: $chapter_num, ISBN: $ISBN, total_pages: $total_pages, coverImage: $coverImage, description: $description, title: $title, author_id: $author_id, Category_id: $Category_id}) {
          affected_rows
          returning {
            publicationDate
            chapter_num
            ISBN
            total_pages
            coverImage
            description
            title
            author_id
            Category_id
            id
          }
        }
      }
    `;

    // Handle both frontend formats
    const variables = {
      publicationDate: book.publicationDate || book.publication_date || null,
      chapter_num: book.chapter_num || book.parts_num || null,
      ISBN: book.ISBN ? (typeof book.ISBN === 'string' ? parseInt(book.ISBN) : book.ISBN) : null,
      total_pages: book.total_pages || null,
      coverImage: book.coverImage || book.cover_URL || "",
      description: book.description || null,
      title: book.title || null,
      author_id: book.author_id || null,
      Category_id: book.Category_id || book.category_id || null
    };

    try {
      const data = await graphqlRequest(mutation, variables);
      const newBook = data.insert_libaray_Book.returning[0];

      return {
        id: newBook.id,
        title: newBook.title,
        description: newBook.description,
        ISBN: newBook.ISBN.toString(),
        cover_URL: newBook.coverImage,
        publication_date: newBook.publicationDate,
        parts_num: newBook.chapter_num,
        total_pages: newBook.total_pages,
        author_id: newBook.author_id,
        category_id: newBook.Category_id,
        most_view: 0
      };
    } catch (error) {
      console.error("GraphQL error creating book:", error);
      throw error;
    }
  }

  async updateBook(id: string, book: UpdateBook): Promise<Book | undefined> {
    const mutation = `
      mutation UpdateBook($id: uuid!, $publicationDate: date, $chapter_num: Int, $ISBN: Int, $total_pages: Int, $coverImage: String, $description: String, $title: String, $author_id: uuid, $Category_id: uuid) {
        update_libaray_Book_by_pk(pk_columns: {id: $id}, _set: {publicationDate: $publicationDate, chapter_num: $chapter_num, ISBN: $ISBN, total_pages: $total_pages, coverImage: $coverImage, description: $description, title: $title, author_id: $author_id, Category_id: $Category_id}) {
          publicationDate
          chapter_num
          ISBN
          total_pages
          coverImage
          description
          title
          author_id
          Category_id
          id
        }
      }
    `;

    const variables: any = { id };
    if (book.publication_date !== undefined) variables.publicationDate = book.publication_date;
    if (book.parts_num !== undefined) variables.chapter_num = book.parts_num;
    if (book.ISBN !== undefined) variables.ISBN = parseInt(book.ISBN) || 0;
    if (book.total_pages !== undefined) variables.total_pages = book.total_pages;
    if (book.cover_URL !== undefined) variables.coverImage = book.cover_URL;
    if (book.description !== undefined) variables.description = book.description;
    if (book.title !== undefined) variables.title = book.title;
    if (book.author_id !== undefined) variables.author_id = book.author_id;
    if (book.category_id !== undefined) variables.Category_id = book.category_id;

    try {
      const data = await graphqlRequest(mutation, variables);
      const updatedBook = data.update_libaray_Book_by_pk;

      return {
        id: updatedBook.id,
        title: updatedBook.title,
        description: updatedBook.description,
        ISBN: updatedBook.ISBN.toString(),
        cover_URL: updatedBook.coverImage,
        publication_date: updatedBook.publicationDate,
        parts_num: updatedBook.chapter_num,
        total_pages: updatedBook.total_pages,
        author_id: updatedBook.author_id,
        category_id: updatedBook.Category_id,
        most_view: 0
      };
    } catch (error) {
      console.error("GraphQL error updating book:", error);
      return undefined;
    }
  }

  async deleteBook(id: string): Promise<Book | undefined> {
    const mutation = `
      mutation DeleteBook($id: uuid!) {
        delete_libaray_Book_by_pk(id: $id) {
          id
          title
          description
          ISBN
          coverImage
          publicationDate
          total_pages
          chapter_num
          author_id
          Category_id
        }
      }
    `;

    try {
      const data = await graphqlRequest(mutation, { id });
      return data.delete_libaray_Book_by_pk;
    } catch (error) {
      console.error("GraphQL error deleting book:", error);
      return undefined;
    }
  }

  // Categories management - from GraphQL
  async getCategories(): Promise<Category[]> {
    const query = `
      query GetCategory {
        libaray_Category {
          name
          id
        }
      }
    `;

    try {
      const data = await graphqlRequest(query);
      return data.libaray_Category;
    } catch (error) {
      console.error("GraphQL error getting categories:", error);
      return [];
    }
  }

  async getCategory(id: string): Promise<Category | undefined> {
    const query = `
      query GetCategory($id: uuid!) {
        libaray_Category_by_pk(id: $id) {
          id
          name
        }
      }
    `;

    try {
      const data = await graphqlRequest(query, { id });
      return data.libaray_Category_by_pk;
    } catch (error) {
      console.error("GraphQL error getting category:", error);
      return undefined;
    }
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const mutation = `
      mutation InsertCategory($name: String) {
        insert_libaray_Category(objects: {name: $name}) {
          affected_rows
          returning {
            name
            id
          }
        }
      }
    `;

    try {
      const data = await graphqlRequest(mutation, { name: category.name });
      return data.insert_libaray_Category.returning[0];
    } catch (error) {
      console.error("GraphQL error creating category:", error);
      throw error;
    }
  }

  async updateCategory(id: string, category: UpdateCategory): Promise<Category | undefined> {
    const mutation = `
      mutation UpdateCategory($id: uuid!, $name: String!) {
        update_libaray_Category_by_pk(pk_columns: {id: $id}, _set: {name: $name}) {
          id
          name
        }
      }
    `;

    try {
      const data = await graphqlRequest(mutation, { id, name: category.name });
      return data.update_libaray_Category_by_pk;
    } catch (error) {
      console.error("GraphQL error updating category:", error);
      return undefined;
    }
  }

  async deleteCategory(id: string): Promise<Category | undefined> {
    const mutation = `
      mutation DeleteCategory($id: uuid!) {
        delete_libaray_Category_by_pk(id: $id) {
          id
          name
        }
      }
    `;

    try {
      const data = await graphqlRequest(mutation, { id });
      return data.delete_libaray_Category_by_pk;
    } catch (error) {
      console.error("GraphQL error deleting category:", error);
      return undefined;
    }
  }

  // Chapter management - from GraphQL
  async getChapters(bookIds?: string[], options?: { page?: number; limit?: number; search?: string }): Promise<{ chapters: Chapter[], total: number }> {
    const page = options?.page || 1;
    const limit = options?.limit || 10;
    const offset = (page - 1) * limit;
    const search = options?.search || "";

    const whereClause: any = {};

    // Explicitly handle empty array case - if bookIds is passed but empty, return empty result
    console.log("storage.getChapters called with bookIds:", bookIds?.length, JSON.stringify(bookIds));
    if (bookIds !== undefined && bookIds.length === 0) {
      console.log("storage.getChapters returning empty result because bookIds is empty array");
      return { chapters: [], total: 0 };
    }

    if (bookIds && bookIds.length > 0) {
      whereClause.book__id = { _in: bookIds };
    } else {
      // If bookIds is undefined, we want all chapters (Admin case)
    }

    if (search) {
      whereClause.title = { _ilike: `%${search}%` };
    }

    const query = `
      query GetChapters($limit: Int, $offset: Int, $where: libaray_Chapter_bool_exp) {
        libaray_Chapter(limit: $limit, offset: $offset, where: $where, order_by: {chapter_num: asc}) {
          id
          title
          content
          chapter_num
          book__id
          Create_at
        }
        libaray_Chapter_aggregate(where: $where) {
          aggregate {
            count
          }
        }
      }
    `;

    try {
      const variables = {
        limit,
        offset,
        where: whereClause
      };

      const data = await graphqlRequest(query, variables);

      // Handle case where aggregate might be missing or different structure
      const total = data.libaray_Chapter_aggregate?.aggregate?.count || 0;
      const chapters = data.libaray_Chapter || [];

      return {
        chapters: chapters.map((chapter: any) => ({
          id: chapter.id,
          title: chapter.title,
          content: chapter.content,
          chapter_num: chapter.chapter_num,
          book_id: chapter.book__id,
          Create_at: chapter.Create_at
        })),
        total
      };
    } catch (error) {
      console.error("GraphQL error getting chapters:", error);
      console.error("Full error details:", JSON.stringify(error, null, 2));
      return { chapters: [], total: 0 };
    }
  }

  async getChaptersByBook(bookId: string): Promise<Chapter[]> {
    const query = `
      query GetChaptersByBook($bookId: uuid!) {
        libaray_Chapter(where: {}, order_by: {chapter_num: asc}) {
          id
          title
          content
          chapter_num
        }
      }
    `;

    try {
      const data = await graphqlRequest(query, { bookId });
      return data.libaray_Chapter;
    } catch (error) {
      console.error("GraphQL error getting chapters by book:", error);
      return [];
    }
  }

  async getChapter(id: string): Promise<Chapter | undefined> {
    const query = `
      query GetChapter($id: uuid!) {
        libaray_Chapter_by_pk(id: $id) {
          id
          title
          content
          chapter_num
        }
      }
    `;

    try {
      const data = await graphqlRequest(query, { id });
      return data.libaray_Chapter_by_pk;
    } catch (error) {
      console.error("GraphQL error getting chapter:", error);
      return undefined;
    }
  }

  async createChapter(chapter: InsertChapter): Promise<Chapter> {
    const mutation = `
      mutation InsertChapter($chapter_num: Int!, $content: jsonb, $title: String!, $book__id: uuid!, $Create_at: timestamptz!) {
        insert_libaray_Chapter(objects: {chapter_num: $chapter_num, content: $content, title: $title, book__id: $book__id, Create_at: $Create_at}) {
          affected_rows
          returning {
            chapter_num
            content
            title
            Create_at
            book__id
            id
          }
        }
      }
    `;

    const now = new Date();
    const variables = {
      chapter_num: chapter.chapter_num,
      content: typeof chapter.content === 'string' ? [chapter.content] : chapter.content,
      title: chapter.title,
      book__id: chapter.book_id,
      Create_at: now.toISOString(),
    };

    try {
      const data = await graphqlRequest(mutation, variables);
      const newChapter = data.insert_libaray_Chapter.returning[0];

      return {
        id: newChapter.id,
        title: newChapter.title,
        content: newChapter.content,
        chapter_num: newChapter.chapter_num,
        book_id: newChapter.book__id,
        Create_at: newChapter.Create_at
      };
    } catch (error) {
      console.error("GraphQL error creating chapter:", error);
      throw error;
    }
  }

  async updateChapter(id: string, chapter: UpdateChapter): Promise<Chapter | undefined> {
    const mutation = `
      mutation UpdateChapter($id: uuid!, $chapter_num: Int, $content: jsonb, $title: String, $book__id: uuid) {
        update_libaray_Chapter_by_pk(pk_columns: {id: $id}, _set: {chapter_num: $chapter_num, content: $content, title: $title, book__id: $book__id}) {
          id
          title
          content
          chapter_num
          book__id
          Create_at
        }
      }
    `;

    // Only include fields that are being updated (not null/undefined)
    const updateFields: any = {};
    if (chapter.chapter_num !== undefined) updateFields.chapter_num = chapter.chapter_num;
    if (chapter.content !== undefined) updateFields.content = typeof chapter.content === 'string' ? [chapter.content] : chapter.content;
    if (chapter.title !== undefined) updateFields.title = chapter.title;
    if (chapter.book_id !== undefined) updateFields.book__id = chapter.book_id;

    const variables = {
      id,
      ...updateFields,
    };

    try {
      const data = await graphqlRequest(mutation, variables);
      const updatedChapter = data.update_libaray_Chapter_by_pk;

      return {
        id: updatedChapter.id,
        title: updatedChapter.title,
        content: updatedChapter.content,
        chapter_num: updatedChapter.chapter_num,
        book_id: updatedChapter.book__id,
        Create_at: updatedChapter.Create_at
      };
    } catch (error) {
      console.error("GraphQL error updating chapter:", error);
      return undefined;
    }
  }

  async deleteChapter(id: string): Promise<Chapter | undefined> {
    const mutation = `
      mutation DeleteChapter($id: uuid!) {
        delete_libaray_Chapter_by_pk(id: $id) {
          id
          title
          content
          chapter_num
        }
      }
    `;

    try {
      const data = await graphqlRequest(mutation, { id });
      return data.delete_libaray_Chapter_by_pk;
    } catch (error) {
      console.error("GraphQL error deleting chapter:", error);
      return undefined;
    }
  }

  // Dashboard stats
  async getDashboardStats(): Promise<{
    totalUsers: number;
    totalBooks: number;
    totalAuthors: number;
    totalCategories: number;
    totalChapters: number;
    totalReviews: number;
    totalFavorites: number;
    averageRating: number;
  }> {
    const query = `
      query GetDashboardStats {
        users_count: usersAggregate {
          aggregate {
            count
          }
        }
        books_count: libaray_Book_aggregate {
          aggregate {
            count
          }
        }
        authors_count: libaray_Autor_aggregate {
          aggregate {
            count
          }
        }
        categories_count: libaray_Category_aggregate {
          aggregate {
            count
          }
        }
        chapters_count: libaray_Chapter_aggregate {
          aggregate {
            count
          }
        }
        reviews_count: libaray_Review_aggregate {
          aggregate {
            count
          }
        }
        favorites_count: libaray_Favorite_aggregate {
          aggregate {
            count
          }
        }
      }
    `;

    try {
      const data = await graphqlRequest(query);
      return {
        totalUsers: data.users_count.aggregate.count,
        totalBooks: data.books_count.aggregate.count,
        totalAuthors: data.authors_count.aggregate.count,
        totalCategories: data.categories_count.aggregate.count,
        totalChapters: data.chapters_count.aggregate.count,
        totalReviews: data.reviews_count.aggregate.count,
        totalFavorites: data.favorites_count.aggregate.count,
        averageRating: 0, // Will be implemented later if needed
      };
    } catch (error) {
      console.error("GraphQL error getting dashboard stats:", error);
      return {
        totalUsers: 0,
        totalBooks: 0,
        totalAuthors: 0,
        totalCategories: 0,
        totalChapters: 0,
        totalReviews: 0,
        totalFavorites: 0,
        averageRating: 0,
      };
    }
  }

  // Favorites methods
  async getFavorites() {
    // Fetch raw favorites and all related entities for manual joining
    const favoritesQuery = `
      query GetFavorites {
        libaray_Favorite {
          id
          user_id
          book_id
          added_at
        }
      }
    `;

    try {
      const [favoritesData, books, users, authors, categories] = await Promise.all([
        graphqlRequest(favoritesQuery),
        this.getBooks(),
        this.getUsers(),
        this.getAuthors(),
        this.getCategories()
      ]);

      const favorites = favoritesData.libaray_Favorite || [];

      // Create lookup maps for performance
      const booksMap = new Map(books.map(b => [b.id, b]));
      const usersMap = new Map(users.map(u => [u.id, u]));
      const authorsMap = new Map(authors.map(a => [a.id, a]));
      const categoriesMap = new Map(categories.map(c => [c.id, c]));

      return favorites.map((favorite: any) => {
        const book = booksMap.get(favorite.book_id);
        const user = usersMap.get(favorite.user_id);

        let enrichedBook = null;
        if (book) {
          const author = book.author_id ? authorsMap.get(book.author_id) : null;
          const category = book.category_id ? categoriesMap.get(book.category_id) : null;
          enrichedBook = {
            id: book.id,
            title: book.title,
            cover_URL: book.cover_URL,
            total_pages: book.total_pages,
            category_name: category?.name,
            author_name: author?.name
          };
        }

        return {
          id: favorite.id,
          user: user ? {
            id: user.id,
            displayName: user.displayName,
            email: user.email,
            avatarUrl: user.avatarUrl
          } : null,
          book: enrichedBook,
          added_at: favorite.added_at,
        };
      });
    } catch (error) {
      console.error("GraphQL error getting favorites:", error);
      return [];
    }
  }

  // Reviews methods
  async getReviews() {
    // Fetch raw reviews and all related entities for manual joining
    const reviewsQuery = `
      query GetReviews {
        libaray_Review {
          id
          user_id
          book_id
          rating
          q1_answer
          q2_answer
          q3_answer
        }
      }
    `;

    try {
      const [reviewsData, books, users, authors] = await Promise.all([
        graphqlRequest(reviewsQuery),
        this.getBooks(),
        this.getUsers(),
        this.getAuthors()
      ]);

      const reviews = reviewsData.libaray_Review || [];

      // Create lookup maps
      const booksMap = new Map(books.map(b => [b.id, b]));
      const usersMap = new Map(users.map(u => [u.id, u]));
      const authorsMap = new Map(authors.map(a => [a.id, a]));

      return reviews.map((review: any) => {
        const book = booksMap.get(review.book_id);
        const user = usersMap.get(review.user_id);

        let enrichedBook = null;
        if (book) {
          const author = book.author_id ? authorsMap.get(book.author_id) : null;
          enrichedBook = {
            id: book.id,
            title: book.title,
            cover_URL: book.cover_URL,
            author_name: author?.name
          };
        }

        return {
          id: review.id,
          rating: review.rating,
          q1_answer: review.q1_answer,
          q2_answer: review.q2_answer,
          q3_answer: review.q3_answer,
          user: user ? {
            id: user.id,
            displayName: user.displayName,
            email: user.email,
            avatarUrl: user.avatarUrl
          } : null,
          book: enrichedBook
        };
      });
    } catch (error) {
      console.error("GraphQL error getting reviews:", error);
      return [];
    }
  }

  async deleteFavorite(favoriteId: string) {
    const mutation = `
      mutation DeleteFavorite($id: uuid!) {
        delete_libaray_Favorite_by_pk(id: $id) {
          id
        }
      }
    `;

    try {
      await graphqlRequest(mutation, { id: favoriteId });
    } catch (error) {
      console.error("GraphQL error deleting favorite:", error);
      throw new Error("Failed to delete favorite");
    }
  }

  // Feedback methods
  async createFeedback(feedback: InsertFeedback) {
    const mutation = `
      mutation InsertFeedback($message: String!, $rating: Int, $user_id: uuid) {
        insert_libaray_Feedback_one(object: {message: $message, rating: $rating, user_id: $user_id}) {
          id
          message
          rating
          created_at
        }
      }
    `;

    try {
      const data = await graphqlRequest(mutation, {
        message: feedback.message,
        rating: feedback.rating || null,
        user_id: feedback.user_id || null
      });
      return data.insert_libaray_Feedback_one;
    } catch (error) {
      console.error("GraphQL error creating feedback:", error);
      throw error;
    }
  }

}

// Use GraphQL storage for real data
export const storage = new GraphQLStorage();