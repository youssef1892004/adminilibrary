import { apiRequest } from "./queryClient";

const GRAPHQL_ENDPOINT = "https://graphql-333f98f9a304.hosted.ghaymah.systems/v1/graphql";

// Get the admin secret from environment variable or from the backend
const getAdminSecret = async () => {
  try {
    const response = await fetch("/api/admin-secret");
    const data = await response.json();
    return data.secret || "yjHfpXbYZlSkBbvKjudDOpwDnLAHUuXP";
  } catch {
    return "yjHfpXbYZlSkBbvKjudDOpwDnLAHUuXP";
  }
};

// GraphQL client with admin secret
export async function graphqlRequest(query: string, variables?: Record<string, any>) {
  try {
    const adminSecret = await getAdminSecret();
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-hasura-admin-secret": adminSecret,
      },
      body: JSON.stringify({ query, variables }),
    });

    if (!response.ok) {
      throw new Error(`GraphQL request failed: ${response.statusText}`);
    }

    const data = await response.json();
    if (data.errors) {
      throw new Error(`GraphQL errors: ${JSON.stringify(data.errors)}`);
    }

    return data.data;
  } catch (error) {
    console.error("GraphQL request error:", error);
    throw error;
  }
}

// Library Management APIs using REST endpoints
export const libraryApi = {
  // Users
  getUsers: async () => {
    const response = await fetch("/api/users");
    if (!response.ok) {
      throw new Error("Failed to fetch users");
    }
    return response.json();
  },

  // Books
  getBooks: async () => {
    const response = await fetch("/api/books");
    if (!response.ok) {
      throw new Error("Failed to fetch books");
    }
    return response.json();
  },

  createBook: async (bookData: any) => {
    // Remove null/undefined values and convert Category_id to uuid if needed
    const cleanData = Object.fromEntries(
      Object.entries(bookData).filter(([_, value]) => value !== null && value !== undefined && value !== "")
    );
    
    // Convert publicationDate to proper format if provided
    if (cleanData.publicationDate) {
      cleanData.publicationDate = cleanData.publicationDate;
    }
    
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
    const data = await graphqlRequest(mutation, cleanData);
    return data.insert_libaray_Book.returning[0];
  },

  updateBook: async (id: string, bookData: any) => {
    // Remove null/undefined values from bookData
    const cleanData = Object.fromEntries(
      Object.entries(bookData).filter(([_, value]) => value !== null && value !== undefined && value !== "")
    );
    
    // Convert publicationDate to proper format if provided
    if (cleanData.publicationDate) {
      cleanData.publicationDate = cleanData.publicationDate;
    }
    
    const mutation = `
      mutation UpdateBook($id: uuid!, $publicationDate: date, $chapter_num: Int, $ISBN: Int, $total_pages: Int, $coverImage: String, $description: String, $title: String, $Category_id: uuid) {
        update_libaray_Book_by_pk(pk_columns: {id: $id}, _set: {publicationDate: $publicationDate, chapter_num: $chapter_num, ISBN: $ISBN, total_pages: $total_pages, coverImage: $coverImage, description: $description, title: $title, Category_id: $Category_id}) {
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
    const data = await graphqlRequest(mutation, { id, ...cleanData });
    return data.update_libaray_Book_by_pk;
  },

  deleteBook: async (id: string) => {
    const mutation = `
      mutation DeleteBook($id: uuid!) {
        delete_libaray_Book_by_pk(id: $id) {
          id
        }
      }
    `;
    const data = await graphqlRequest(mutation, { id });
    return data.delete_libaray_Book_by_pk;
  },

  // Authors
  getAuthors: async () => {
    const response = await fetch("/api/authors");
    if (!response.ok) {
      throw new Error("Failed to fetch authors");
    }
    return response.json();
  },

  createAuthor: async (authorData: any) => {
    const mutation = `
      mutation InsertAutor($book_num: Int, $bio: String, $image_url: String, $name: String, $Category_Id: uuid) {
        insert_libaray_Autor(objects: {book_num: $book_num, bio: $bio, image_url: $image_url, name: $name, Category_Id: $Category_Id}) {
          affected_rows
          returning {
            book_num
            bio
            image_url
            name
            Category_Id
            id
          }
        }
      }
    `;
    const data = await graphqlRequest(mutation, {
      book_num: authorData.book_num || 0,
      bio: authorData.bio || null,
      image_url: authorData.image_url || null,
      name: authorData.name,
      Category_Id: authorData.Category_Id || null
    });
    return data.insert_libaray_Autor.returning[0];
  },

  updateAuthor: async (id: string, authorData: any) => {
    const mutation = `
      mutation UpdateAutor($id: uuid!, $book_num: Int, $bio: String, $image_url: String, $name: String, $Category_Id: uuid) {
        update_libaray_Autor_by_pk(pk_columns: {id: $id}, _set: {book_num: $book_num, bio: $bio, image_url: $image_url, name: $name, Category_Id: $Category_Id}) {
          book_num
          bio
          image_url
          name
          Category_Id
          id
        }
      }
    `;
    const data = await graphqlRequest(mutation, {
      id,
      book_num: authorData.book_num || 0,
      bio: authorData.bio || null,
      image_url: authorData.image_url || null,
      name: authorData.name,
      Category_Id: authorData.Category_Id || null
    });
    return data.update_libaray_Autor_by_pk;
  },

  deleteAuthor: async (id: string) => {
    const mutation = `
      mutation DeleteAutor($id: uuid!) {
        delete_libaray_Autor_by_pk(id: $id) {
          id
        }
      }
    `;
    const data = await graphqlRequest(mutation, { id });
    return data.delete_libaray_Autor_by_pk;
  },

  // Categories
  getCategories: async () => {
    const response = await fetch("/api/categories");
    if (!response.ok) {
      throw new Error("Failed to fetch categories");
    }
    return response.json();
  },

  createCategory: async (categoryData: any) => {
    const mutation = `
      mutation CreateCategory($name: String!) {
        insert_libaray_Category(objects: {name: $name}) {
          affected_rows
          returning {
            id
            name
          }
        }
      }
    `;
    const data = await graphqlRequest(mutation, { name: categoryData.name });
    return data.insert_libaray_Category.returning[0];
  },

  updateCategory: async (id: string, categoryData: any) => {
    const mutation = `
      mutation UpdateCategory($id: uuid!, $name: String!) {
        update_libaray_Category_by_pk(pk_columns: {id: $id}, _set: {name: $name}) {
          id
          name
        }
      }
    `;
    const data = await graphqlRequest(mutation, { id, name: categoryData.name });
    return data.update_libaray_Category_by_pk;
  },

  deleteCategory: async (id: string) => {
    const mutation = `
      mutation DeleteCategory($id: uuid!) {
        delete_libaray_Category_by_pk(id: $id) {
          id
          name
        }
      }
    `;
    const data = await graphqlRequest(mutation, { id });
    return data.delete_libaray_Category_by_pk;
  },

  // Chapters
  getChapters: async () => {
    const response = await fetch("/api/chapters");
    if (!response.ok) {
      throw new Error("Failed to fetch chapters");
    }
    return response.json();
  },

  createChapter: async (chapterData: any) => {
    const cleanData = Object.fromEntries(
      Object.entries(chapterData).filter(([_, value]) => value !== null && value !== undefined && value !== "")
    );
    
    // Ensure content is in jsonb format (array)
    if (cleanData.content && typeof cleanData.content === 'string') {
      cleanData.content = [cleanData.content];
    }
    
    // Set current timestamp for Create_at
    const now = new Date().toISOString();
    
    const mutation = `
      mutation InsertChapter($chapter_num: Int!, $content: jsonb, $title: String!, $Create_at: timestamptz!, $book__id: uuid!) {
        insert_libaray_Chapter(objects: {chapter_num: $chapter_num, content: $content, title: $title, Create_at: $Create_at, book__id: $book__id}) {
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
      }`;
    
    const variables = {
      ...cleanData,
      Create_at: now,
    };
    
    const result = await graphqlRequest(mutation, variables);
    return result.insert_libaray_Chapter.returning[0];
  },

  updateChapter: async (id: string, chapterData: any) => {
    const cleanData = Object.fromEntries(
      Object.entries(chapterData).filter(([_, value]) => value !== null && value !== undefined && value !== "")
    );
    
    // Ensure content is in jsonb format (array) if provided
    if (cleanData.content && typeof cleanData.content === 'string') {
      cleanData.content = [cleanData.content];
    }
    
    const mutation = `
      mutation UpdateChapter($id: uuid!, $chapter_num: Int, $content: jsonb, $title: String, $book__id: uuid) {
        update_libaray_Chapter_by_pk(pk_columns: {id: $id}, _set: {chapter_num: $chapter_num, content: $content, title: $title, book__id: $book__id}) {
          chapter_num
          content
          title
          Create_at
          book__id
          id
        }
      }`;
    
    const result = await graphqlRequest(mutation, { id, ...cleanData });
    return result.update_libaray_Chapter_by_pk;
  },

  deleteChapter: async (id: string) => {
    const mutation = `
      mutation DeleteChapter($id: uuid!) {
        delete_libaray_Chapter_by_pk(id: $id) {
          id
        }
      }`;
    
    const result = await graphqlRequest(mutation, { id });
    return result.delete_libaray_Chapter_by_pk;
  },

  // Dashboard stats
  getDashboardStats: async () => {
    const response = await fetch("/api/dashboard-stats");
    if (!response.ok) {
      throw new Error("Failed to fetch dashboard stats");
    }
    return response.json();
  },
};
