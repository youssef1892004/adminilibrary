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
    const mutation = `
      mutation CreateBook($object: ilibarary_Book_insert_input!) {
        insert_ilibarary_Book_one(object: $object) {
          id
          title
          description
          ISBN
          cover_URL
          publication_date
          author_id
          category_id
          parts_num
          total_pages
        }
      }
    `;
    const data = await graphqlRequest(mutation, { object: bookData });
    return data.insert_ilibarary_Book_one;
  },

  updateBook: async (id: string, bookData: any) => {
    const mutation = `
      mutation UpdateBook($id: uuid!, $changes: ilibarary_Book_set_input!) {
        update_ilibarary_Book_by_pk(pk_columns: { id: $id }, _set: $changes) {
          id
          title
          description
          ISBN
          cover_URL
          publication_date
          author_id
          category_id
          parts_num
          total_pages
        }
      }
    `;
    const data = await graphqlRequest(mutation, { id, changes: bookData });
    return data.update_ilibarary_Book_by_pk;
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

  // Dashboard stats
  getDashboardStats: async () => {
    const response = await fetch("/api/dashboard-stats");
    if (!response.ok) {
      throw new Error("Failed to fetch dashboard stats");
    }
    return response.json();
  },
};
