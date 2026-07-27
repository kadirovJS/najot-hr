import { IBlog, BlogFormData } from "@/types/blog";

type CloudinaryImageUpload = {
  secure_url: string;
};

type BlogViewResult = {
  viewCount: number;
  counted: boolean;
};

export const blogService = {
  async uploadBlogImage(file: File): Promise<CloudinaryImageUpload> {
    const signRes = await fetch('/api/blog/sign');
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

  async getPosts(admin: boolean = false): Promise<IBlog[]> {
    const res = await fetch(`/api/blog?admin=${admin}`);
    if (!res.ok) throw new Error('Yuklashda xatolik');
    return res.json();
  },

  async getPostById(id: string): Promise<IBlog> {
    const res = await fetch(`/api/blog/${id}`);
    if (!res.ok) throw new Error('Post topilmadi');
    return res.json();
  },

  async recordBlogView(id: string): Promise<BlogViewResult> {
    const res = await fetch(`/api/blog/${id}/view`, { method: 'POST', cache: 'no-store' });
    if (!res.ok) throw new Error('Ko‘rishni qayd etib bo‘lmadi');
    return res.json();
  },

  async createPost(data: BlogFormData): Promise<IBlog> {
    const res = await fetch('/api/blog', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Post yaratishda xatolik');
    return res.json();
  },

  async updatePost(id: string, data: Partial<BlogFormData>): Promise<IBlog> {
    const res = await fetch(`/api/blog/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Tahrirlashda xatolik');
    return res.json();
  },

  async deletePost(id: string): Promise<void> {
    const res = await fetch(`/api/blog/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error("O'chirishda xatolik");
  }
};
