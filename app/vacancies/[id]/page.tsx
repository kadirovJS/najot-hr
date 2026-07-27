import { cache } from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import VacancyDetailView from '@/components/vacancies/VacancyDetailView';
import { getPublicVacancyById } from '@/lib/queries/vacancy';
import { BASE_URL, JsonLd, breadcrumbJsonLd, jobPostingJsonLd } from '@/lib/seo';

export const revalidate = 60;

type Params = { id: string };

const loadVacancy = cache((id: string) => getPublicVacancyById(id));

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { id } = await params;
  const vacancy = await loadVacancy(id);
  if (!vacancy) return {};

  const description = vacancy.description.length > 160
    ? `${vacancy.description.slice(0, 157)}...`
    : vacancy.description;

  return {
    title: vacancy.title,
    description,
    alternates: { canonical: `/vacancies/${vacancy._id}` },
    openGraph: {
      title: vacancy.title,
      description,
      url: `${BASE_URL}/vacancies/${vacancy._id}`,
      type: 'article',
    },
  };
}

export default async function VacancyDetail({ params }: { params: Promise<Params> }) {
  const { id } = await params;
  const vacancy = await loadVacancy(id);

  if (!vacancy) notFound();

  return (
    <>
      <JsonLd data={jobPostingJsonLd(vacancy)} />
      <JsonLd data={breadcrumbJsonLd([
        { name: 'Bosh sahifa', path: '/' },
        { name: 'Vakansiyalar', path: '/vacancies' },
        { name: vacancy.title, path: `/vacancies/${vacancy._id}` },
      ])} />
      <VacancyDetailView vacancy={vacancy} />
    </>
  );
}
