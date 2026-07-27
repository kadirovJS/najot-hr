import { isValidObjectId } from 'mongoose';
import Vacancy from '@/models/Vacancy';
import { dbConnect } from '@/lib/db';
import type { IVacancy } from '@/types/vacancy';

type VacancyDoc = {
  _id: unknown;
  title: string;
  category: IVacancy['category'];
  location: string;
  type: IVacancy['type'];
  salary: string;
  description: string;
  requirements: string[];
  benefits: string[];
  isVisible: boolean;
  createdAt: Date | string;
};

function toPlainVacancy(doc: VacancyDoc): IVacancy {
  return {
    _id: String(doc._id),
    title: doc.title,
    category: doc.category,
    location: doc.location,
    type: doc.type,
    salary: doc.salary,
    description: doc.description,
    requirements: doc.requirements || [],
    benefits: doc.benefits || [],
    isVisible: doc.isVisible,
    createdAt: new Date(doc.createdAt).toISOString(),
  };
}

export async function getPublicVacancies(): Promise<IVacancy[]> {
  await dbConnect();
  const vacancies = await Vacancy.find({ isVisible: true }).sort({ createdAt: -1 }).lean();
  return vacancies.map((doc) => toPlainVacancy(doc as unknown as VacancyDoc));
}

export async function getPublicVacancyById(id: string): Promise<IVacancy | null> {
  if (!isValidObjectId(id)) return null;
  await dbConnect();
  const vacancy = await Vacancy.findOne({ _id: id, isVisible: true }).lean();
  if (!vacancy) return null;
  return toPlainVacancy(vacancy as unknown as VacancyDoc);
}
