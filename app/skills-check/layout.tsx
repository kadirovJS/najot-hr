import type { Metadata } from 'next';
import { BASE_URL } from '@/lib/seo';

const PAGE_DESCRIPTION = "Bilim va ko'nikmalaringizni bepul onlayn test orqali sinab ko'ring va natijangizni HR jamoamiz bilan ulashing.";

export const metadata: Metadata = {
  title: 'Bilimingizni sinang',
  description: PAGE_DESCRIPTION,
  alternates: { canonical: '/skills-check' },
  openGraph: {
    title: "Bilimingizni sinang | Najot Ta'lim HR",
    description: PAGE_DESCRIPTION,
    url: `${BASE_URL}/skills-check`,
    type: 'website',
  },
};

export default function SkillsCheckLayout({ children }: { children: React.ReactNode }) {
  return children;
}
