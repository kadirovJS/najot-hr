export type UserRole = 'SUPER_ADMIN' | 'TEACHER' | 'HR' | 'ACCOUNTANT' | 'MARKETING_DESIGN' | 'SALES';
export type UserStatus = 'ACTIVE' | 'BLOCKED';
export type UserDepartment = 'Support teacher' | 'Main teacher' | 'Management' | 'Sales' | 'Boshqaruv' | 'Other';

export interface IUser {
  _id: string;
  name: string;
  phone: string;
  role: UserRole;
  status: UserStatus;
  department: UserDepartment;
  onboardingProgress: number;
  createdAt: string;
}

export interface UserFormData {
  name: string;
  phone: string;
  password?: string;
  role: UserRole;
  department: UserDepartment;
}

export interface PaginationData {
  total: number;
  pages: number;
  currentPage: number;
}

export interface UsersResponse {
  users: IUser[];
  pagination: PaginationData;
}
