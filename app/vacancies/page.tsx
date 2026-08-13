import type { Metadata } from 'next';
import VacanciesExplorer from '@/components/vacancies/VacanciesExplorer';
import { getPublicVacancies } from '@/lib/queries/vacancy';
import { BASE_URL, JsonLd, breadcrumbJsonLd, vacancyListJsonLd } from '@/lib/seo';
import type { IVacancy } from '@/types/vacancy';

export const revalidate = 60;

const PAGE_DESCRIPTION = "Najot Ta'lim jamoasidagi ochiq vakansiyalar: IT, HR, marketing, sotuv va boshqa yo'nalishlar bo'yicha ish o'rinlari.";

export const metadata: Metadata = {
  title: 'Vakansiyalar',
  description: PAGE_DESCRIPTION,
  alternates: { canonical: '/vacancies' },
  openGraph: {
    title: "Vakansiyalar | Najot Ta'lim HR",
    description: PAGE_DESCRIPTION,
    url: `${BASE_URL}/vacancies`,
    type: 'website',
  },
};

export default async function VacanciesPage() {
  let vacancies: IVacancy[] = [];
  let failed = false;
  try {
    vacancies = await getPublicVacancies();
  } catch {
    failed = true;
  }

  return (
    <>
      <JsonLd data={breadcrumbJsonLd([{ name: "Najot Ta'lim", path: '/' }, { name: 'Vakansiyalar', path: '/vacancies' }])} />
      {vacancies.length > 0 && <JsonLd data={vacancyListJsonLd(vacancies)} />}
      <VacanciesExplorer vacancies={vacancies} failed={failed} />
    </>
  );
}
