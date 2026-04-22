import { IUser, UsersResponse, UserFormData, UserStatus } from "@/types/user";

export const userService = {
  async getUsers(page: number = 1, search: string = ''): Promise<UsersResponse> {
    const res = await fetch(`/api/users?page=${page}&search=${search}`);
    if (!res.ok) throw  Error('Xodimlarni yuklashda xatolik');
    return res.json();
  },

  async createUser(data: UserFormData): Promise<IUser> {
    const res = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Xodim qo\'shishda xatolik');
    return res.json();
  },

  async updateUser(id: string, data: Partial<UserFormData & { status: UserStatus }>): Promise<IUser> {
    const res = await fetch(`/api/users/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Tahrirlashda xatolik');
    return res.json();
  },

  async deleteUser(id: string): Promise<void> {
    const res = await fetch(`/api/users/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('O\'chirishda xatolik');
  }
};
