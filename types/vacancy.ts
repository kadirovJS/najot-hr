export type VacancyCategory = 'IT' | 'HR' | "O'quv bo'limi" | 'SMM' | 'Marketing' | 'Sales' | 'Other';
export type VacancyType = 'Full-time' | 'Part-time' | 'Remote' | 'Internship';

export interface IVacancy {
  _id: string;
  title: string;
  category: VacancyCategory;
  location: string;
  type: VacancyType;
  salary: string;
  description: string;
  requirements: string[];
  benefits: string[];
  isVisible: boolean;
  createdAt: string;
}

export interface VacancyFormData {
  title: string;
  category: VacancyCategory;
  location: string;
  type: VacancyType;
  salary: string;
  description: string;
  requirements: string[];
  benefits: string[];
  isVisible?: boolean;
}
