export interface User {
  id: string;
  displayName: string;
  email: string;
  emailVerified: boolean;
  phoneNumber?: string;
  phoneNumberVerified: boolean;
  defaultRole: string;
  disabled: boolean;
  locale: string;
  avatarUrl: string;
  isAnonymous: boolean;
  createdAt: string;
  updatedAt: string;
  lastSeen?: string;
}

export interface DashboardStats {
  totalUsers: number;
  totalBooks: number;
  activeBorrowings: number;
  overdueBooks: number;
}

export interface CreateUserData {
  displayName: string;
  email: string;
  phoneNumber?: string;
  defaultRole: "user" | "admin" | "moderator";
  emailVerified: boolean;
  disabled: boolean;
  locale: "en" | "ar" | "fr";
  password?: string;
}

export interface UpdateUserData extends Partial<CreateUserData> { }

export interface TableColumn<T> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  render?: (value: any, row: T) => React.ReactNode;
}

export interface PaginationInfo {
  page: number;
  pageSize: number;
  total: number;
}
