import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import Video from "@/models/Video";
import Notification from "@/models/Notification";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ONBOARDING_TRACKS, getOnboardingTrackQuery } from '@/lib/onboarding';

const allowedDepartments = ['All', 'Support teacher', 'Main teacher', 'Management', 'Sales', 'Boshqaruv', 'Other'];
type SessionUser = { role?: string; department?: string };
const getErrorMessage = (error: unknown, fallback: string) => error instanceof Error ? error.message : fallback;

function validateVideoInput(input: unknown) {
  if (!input || typeof input !== 'object') throw new Error('Video ma’lumotlari noto‘g‘ri');
  const data = input as Record<string, unknown>;
  const title = typeof data.title === 'string' ? data.title.trim() : '';
  const youtubeUrl = typeof data.youtubeUrl === 'string' ? data.youtubeUrl.trim() : '';
  const cloudinaryUrl = typeof data.cloudinaryUrl === 'string' ? data.cloudinaryUrl.trim() : '';
  const coverImageUrl = typeof data.coverImageUrl === 'string' ? data.coverImageUrl.trim() : '';
  const coverImagePublicId = typeof data.coverImagePublicId === 'string' ? data.coverImagePublicId.trim() : '';
  const duration = Number(data.duration);
  const track = typeof data.track === 'string' && ONBOARDING_TRACKS.includes(data.track as typeof ONBOARDING_TRACKS[number]) ? data.track : '';
  const departments = Array.isArray(data.departments) ? data.departments.filter((department): department is string => typeof department === 'string' && allowedDepartments.includes(department)) : [];
  const testQuestions = Array.isArray(data.testQuestions) ? data.testQuestions : [];

  if (!title || (!youtubeUrl && !cloudinaryUrl)) throw new Error('Sarlavha va video manbasi majburiy');
  if (!Number.isFinite(duration) || duration <= 0) throw new Error('Video davomiyligi sekundlarda aniq kiritilishi kerak');
  if (!departments.length) throw new Error('Kamida bitta bo‘limni tanlang');
  if (!track) throw new Error('O‘quv yo‘nalishini tanlang');
  if (testQuestions.some((item) => {
    if (!item || typeof item !== 'object') return true;
    const question = item as Record<string, unknown>;
    return typeof question.question !== 'string' || !question.question.trim() || !Array.isArray(question.options) || question.options.length < 2 || question.options.some((option) => typeof option !== 'string' || !option.trim()) || !Number.isInteger(question.correctAnswer) || Number(question.correctAnswer) < 0 || Number(question.correctAnswer) >= question.options.length;
  })) throw new Error('Test savollarini to‘liq va to‘g‘ri kiriting');

  return { ...data, title, youtubeUrl, cloudinaryUrl, coverImageUrl, coverImagePublicId, duration: Math.round(duration), track, departments, testQuestions };
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });
    await dbConnect();
    const user = session.user as SessionUser;
    const query = user.role === 'SUPER_ADMIN' ? {} : getOnboardingTrackQuery(user.role, user.department);
    const videos = await Video.find(query).sort({ createdAt: -1 });
    return NextResponse.json(videos);
  } catch (error: unknown) {
    console.error("ONBOARDING VIDEOS ERROR:", error);
    return NextResponse.json({ error: getErrorMessage(error, 'Xatolik') }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as SessionUser).role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 403 });
    }

    const body = validateVideoInput(await req.json());
    await dbConnect();
    const video = await Video.create(body);

    // Bildirishnoma yaratish
    await Notification.create({
      type: 'NEW_VIDEO',
      title: 'Yangi darslik',
      message: `"${video.title}" videosi onboarding kursiga qo'shildi.`,
      link: '/dashboard/onboarding'
    });

    return NextResponse.json(video, { status: 201 });
  } catch (error: unknown) {
    console.error("ONBOARDING VIDEOS ERROR:", error);
    return NextResponse.json({ error: getErrorMessage(error, 'Xatolik') }, { status: 500 });
  }
}
