export interface ShowcaseMetric {
  value: string;
  label: string;
}

export interface HeroSlide {
  _id?: string;
  title: string;
  description: string;
  image: string;
}

export interface ShowcaseSettings {
  eyebrow: string;
  title: string;
  description: string;
  primaryCtaLabel: string;
  primaryCtaHref: string;
  secondaryCtaLabel: string;
  secondaryCtaHref: string;
  metrics: ShowcaseMetric[];
}

export const DEFAULT_SHOWCASE: ShowcaseSettings = {
  eyebrow: "Najot Ta'lim jamoasi",
  title: "Najot Ta'lim jamoasida o'z izingizni qoldiring.",
  description: "Kelajak kasblarini o‘rgatayotgan, bir-birini qo‘llaydigan va doim o‘sishga intiladigan jamoaga qo‘shiling.",
  primaryCtaLabel: "Ochiq vakansiyalar",
  primaryCtaHref: "/vacancies",
  secondaryCtaLabel: "Ko‘nikmamni tekshirish",
  secondaryCtaHref: "/skills-check",
  metrics: [
    { value: "350+", label: "jamoa a’zosi" },
    { value: "6", label: "zamonaviy filial" },
    { value: "2 500+", label: "faol o‘quvchi" },
  ],
};

export function createShowcaseDraft(showcase: ShowcaseSettings = DEFAULT_SHOWCASE): ShowcaseSettings {
  return {
    ...showcase,
    metrics: showcase.metrics.map((metric) => ({ ...metric })),
  };
}
