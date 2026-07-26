import { IUser, UsersResponse, UserFormData, UserStatus } from "@/types/user";

type CloudinaryImageUpload = {
  secure_url: string;
};

export const userService = {
  async uploadProfileImage(file: File): Promise<CloudinaryImageUpload> {
    const signRes = await fetch('/api/settings/profile/image/sign');
    if (!signRes.ok) throw new Error('Rasm yuklashga ruxsat berilmadi');

    const signData = await signRes.json();
    const formData = new FormData();
    formData.append('file', file);
    formData.append('api_key', signData.apiKey);
    formData.append('timestamp', signData.timestamp);
    formData.append('signature', signData.signature);
    formData.append('folder', signData.folder);

    const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${signData.cloudName}/image/upload`, {
      method: 'POST',
      body: formData,
    });
    const uploadData = await uploadRes.json();

    if (!uploadRes.ok || !uploadData.secure_url) {
      throw new Error(uploadData.error?.message || 'Cloudinary rasmni qabul qilmadi');
    }

    return uploadData as CloudinaryImageUpload;
  },

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
