import type { IBlog } from '@/types/blog';
import type { IVacancy } from '@/types/vacancy';

export const BASE_URL = 'https://najottalimjamoasi.uz';
export const SITE_NAME = "Najot Ta'lim HR";
export const DEFAULT_DESCRIPTION = "Najot Ta'lim o'quv markazining HR tizimi va vakansiyalar portali";

export function absoluteUrl(path: string) {
  return `${BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

export function organizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    alternateName: ["Najot Ta'lim", "Najot Ta'lim HR"],
    url: BASE_URL,
    logo: absoluteUrl('/najot.png'),
    description: "Najot Ta'lim — dasturlash, dizayn va marketing kabi zamonaviy kasblarni o'rgatuvchi ta'lim markazi. Bu sahifa Najot Ta'lim jamoasining rasmiy HR tizimi va vakansiyalar portali.",
    sameAs: [
      'https://najottalim.uz',
      'https://t.me/najottalim',
      'https://www.instagram.com/najottalimteam/',
      'https://youtube.com/@najottalim',
    ],
  };
}

export function websiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    alternateName: "Najot Ta'lim",
    url: BASE_URL,
    inLanguage: 'uz',
  };
}

export type BreadcrumbItem = { name: string; path: string };

export function breadcrumbJsonLd(items: BreadcrumbItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function blogPostingJsonLd(post: IBlog) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    image: [post.coverImage],
    datePublished: post.createdAt,
    dateModified: post.createdAt,
    author: { '@type': 'Organization', name: post.author || SITE_NAME },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      logo: { '@type': 'ImageObject', url: absoluteUrl('/najot.png') },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': absoluteUrl(`/blog/${post.slug}`) },
  };
}

export function blogListJsonLd(posts: IBlog[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: posts.map((post, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: absoluteUrl(`/blog/${post.slug}`),
      name: post.title,
    })),
  };
}

export function vacancyListJsonLd(vacancies: IVacancy[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: vacancies.map((vacancy, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: absoluteUrl(`/vacancies/${vacancy._id}`),
      name: vacancy.title,
    })),
  };
}

const EMPLOYMENT_TYPE_MAP: Record<string, string> = {
  'Full-time': 'FULL_TIME',
  'Part-time': 'PART_TIME',
  Remote: 'OTHER',
  Internship: 'INTERN',
};

// Modelda vakansiya muddati saqlanmaydi, shuning uchun Google JobPosting talabi
// bo'yicha validThrough e'lon sanasidan 60 kun keyin deb taxminiy hisoblanadi.
export function jobPostingJsonLd(vacancy: IVacancy) {
  const posted = new Date(vacancy.createdAt);
  const validThrough = new Date(posted);
  validThrough.setDate(validThrough.getDate() + 60);

  return {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title: vacancy.title,
    description: vacancy.description,
    datePosted: posted.toISOString(),
    validThrough: validThrough.toISOString(),
    employmentType: EMPLOYMENT_TYPE_MAP[vacancy.type] || 'OTHER',
    hiringOrganization: {
      '@type': 'Organization',
      name: SITE_NAME,
      sameAs: BASE_URL,
      logo: absoluteUrl('/najot.png'),
    },
    jobLocation: {
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        addressLocality: vacancy.location,
        addressCountry: 'UZ',
      },
    },
  };
}

export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
