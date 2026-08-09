export const ONBOARDING_TRACKS = ['SOFT_SKILLS', 'TECHNICAL_SKILLS', 'MARKETING_DESIGN', 'SALES'] as const;

export type OnboardingTrack = (typeof ONBOARDING_TRACKS)[number];

export const ONBOARDING_TRACK_META: Record<OnboardingTrack, { label: string; description: string }> = {
  SOFT_SKILLS: {
    label: 'Moslashuv darslari',
    description: 'Yangi xodimning jamoa va ish jarayoniga moslashuvi uchun darslar.',
  },
  TECHNICAL_SKILLS: {
    label: 'Texnik ko‘nikmalar',
    description: 'Barcha xodimlar uchun zarur texnik bilim va ko‘nikmalar.',
  },
  MARKETING_DESIGN: {
    label: 'Marketing',
    description: 'Marketing, kontent va dizayn jamoasi uchun amaliy o‘quvlar.',
  },
  SALES: {
    label: 'Sotuv',
    description: 'Sotuv jamoasi uchun mijoz bilan ishlash va savdo jarayonlari.',
  },
};

export const getEmployeeOnboardingTrack = (role?: string, department?: string): OnboardingTrack => {
  if (role === 'SALES' || department === 'Sales') return 'SALES';
  if (role === 'MARKETING_DESIGN') return 'MARKETING_DESIGN';
  return 'SOFT_SKILLS';
};

// Barcha yangi tracklardagi videolar xodimlarga ochiq. Bu kurslar ko‘rinishini
// boshqaradi; majburiy biriktirish va statistika isOnboardingTrackAssigned orqali qoladi.
export const getEmployeeOnboardingTracks = (): OnboardingTrack[] => [...ONBOARDING_TRACKS];

export const isOnboardingTrackAssigned = (track: OnboardingTrack | undefined, role?: string, department?: string) =>
  track === 'TECHNICAL_SKILLS' || track === getEmployeeOnboardingTrack(role, department);

export const getOnboardingTrackQuery = (role?: string, department?: string) => {
  const tracks = getEmployeeOnboardingTracks();
  return {
    $or: [
      { track: { $in: tracks } },
      // Videolarning eski bo‘limlar bo‘yicha biriktirilishi saqlanadi.
      { track: { $exists: false }, $or: [{ departments: 'All' }, { departments: department }] },
    ],
  };
};
