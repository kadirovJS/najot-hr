import { ITestQuestion, TestFormData, TestType } from "@/types/test";

export const testService = {
  async getQuestions(type?: TestType): Promise<ITestQuestion[]> {
    const url = type ? `/api/tests?type=${type}` : '/api/tests';
    const res = await fetch(url);
    if (!res.ok) throw new Error('Yuklashda xatolik');
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Savol yaratilmadi');
    return result;
  },

  async createQuestion(data: TestFormData): Promise<ITestQuestion> {
    const res = await fetch('/api/tests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Savol tahrirlanmadi');
    return result;
  },

  async updateQuestion(id: string, data: Partial<TestFormData>): Promise<ITestQuestion> {
    const res = await fetch(`/api/tests/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async deleteQuestion(id: string): Promise<void> {
    const res = await fetch(`/api/tests/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      const result = await res.json();
      throw new Error(result.error || 'Savol o‘chirilmadi');
    }
  }
};
