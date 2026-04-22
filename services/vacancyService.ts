import { IVacancy, VacancyFormData } from "@/types/vacancy";

export const vacancyService = {
  async getVacancies(admin: boolean = false): Promise<IVacancy[]> {
    const res = await fetch(`/api/vacancies?admin=${admin}`);
    if (!res.ok) throw new Error('Yuklashda xatolik');
    return res.json();
  },

  async getVacancyById(id: string): Promise<IVacancy> {
    const res = await fetch(`/api/vacancies/${id}`);
    if (!res.ok) throw new Error('Vakansiya topilmadi');
    return res.json();
  },

  async createVacancy(data: VacancyFormData): Promise<IVacancy> {
    const res = await fetch('/api/vacancies', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async updateVacancy(id: string, data: Partial<VacancyFormData>): Promise<IVacancy> {
    const res = await fetch(`/api/vacancies/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async deleteVacancy(id: string): Promise<void> {
    await fetch(`/api/vacancies/${id}`, { method: 'DELETE' });
  }
};
