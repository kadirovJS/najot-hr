export const ONBOARDING_TRACKS = ['SOFT_SKILLS', 'MARKETING_DESIGN', 'SALES'] as const;

export type OnboardingTrack = (typeof ONBOARDING_TRACKS)[number];

export const ONBOARDING_TRACK_META: Record<OnboardingTrack, { label: string; description: string }> = {
  SOFT_SKILLS: {
    label: 'Universal ko‘nikmalar',
    description: 'Har bir xodim uchun ishdagi muhim yumshoq ko‘nikmalar.',
  },
  MARKETING_DESIGN: {
    label: 'Marketing va dizayn',
    description: 'Marketing, kontent va dizayn jamoasi uchun amaliy o‘quvlar.',
  },
  SALES: {
    label: 'Sotuv yo‘nalishi',
    description: 'Sotuv jamoasi uchun mijoz bilan ishlash va savdo jarayonlari.',
  },
};

export const getEmployeeOnboardingTrack = (role?: string, department?: string): OnboardingTrack => {
  if (role === 'SALES' || department === 'Sales') return 'SALES';
  if (role === 'MARKETING_DESIGN') return 'MARKETING_DESIGN';
  return 'SOFT_SKILLS';
};

export const getOnboardingTrackQuery = (role?: string, department?: string) => {
  const track = getEmployeeOnboardingTrack(role, department);
  return {
    $or: [
      { track },
      // Videolarning eski bo‘limlar bo‘yicha biriktirilishi saqlanadi.
      { track: { $exists: false }, $or: [{ departments: 'All' }, { departments: department }] },
    ],
  };
};
