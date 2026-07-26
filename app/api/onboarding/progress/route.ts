import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import Progress from '@/models/Progress';
import Video from '@/models/Video';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const MIN_FORWARD_HEARTBEAT_SECONDS = 1;
const PLAYBACK_SPEED_TOLERANCE = 1.1;
const MAX_HEARTBEAT_ADVANCE_SECONDS = 45;
const COMPLETION_TOLERANCE_SECONDS = 2;

type SessionUser = { id?: string; department?: string };
type TestQuestion = { options: string[]; correctAnswer: number };

function getPosition(value: unknown, duration: number) {
  const position = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(position) || position < 0) return null;
  return Math.min(Math.floor(position), duration);
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user as SessionUser | undefined;
    if (!user?.id) return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });

    await dbConnect();
    const progress = await Progress.find({ userId: user.id }).sort({ lastWatched: -1 });
    return NextResponse.json(progress);
  } catch {
    return NextResponse.json({ error: 'Xatolik yuz berdi' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user as SessionUser | undefined;
    if (!user?.id) return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });

    const body = await req.json() as Record<string, unknown>;
    const videoId = body.videoId;
    const action = body.action;
    if (typeof videoId !== 'string' || (action !== 'heartbeat' && action !== 'submit-test')) {
      return NextResponse.json({ error: 'So‘rov ma’lumotlari noto‘g‘ri' }, { status: 400 });
    }

    await dbConnect();
    const video = await Video.findById(videoId).select('duration departments testQuestions');
    if (!video) return NextResponse.json({ error: 'Video topilmadi' }, { status: 404 });

    const isAssigned = video.departments.includes('All') || video.departments.includes(user.department);
    if (!isAssigned) return NextResponse.json({ error: "Bu video sizga biriktirilmagan" }, { status: 403 });

    const duration = Math.floor(video.duration || 0);
    if (duration <= 0) {
      return NextResponse.json({ error: 'Video davomiyligi belgilanmagan. Administrator video ma’lumotini tekshirishi kerak.' }, { status: 409 });
    }

    const now = new Date();
    const existing = await Progress.findOne({ userId: user.id, videoId });

    if (action === 'heartbeat') {
      const position = getPosition(body.position, duration);
      if (position === null) return NextResponse.json({ error: 'Video vaqti noto‘g‘ri' }, { status: 400 });

      const previousPosition = existing?.watchedSeconds || 0;
      const lastHeartbeat = existing?.lastHeartbeatAt || existing?.lastWatched || now;
      const elapsedSeconds = Math.max(0, (now.getTime() - new Date(lastHeartbeat).getTime()) / 1000);
      if (position > previousPosition && elapsedSeconds < MIN_FORWARD_HEARTBEAT_SECONDS) {
        return NextResponse.json({
          error: 'Progress juda tez yuborildi. Videoni odatiy tezlikda davom ettiring.',
          allowedPosition: previousPosition,
        }, { status: 409 });
      }
      const permittedAdvance = Math.min(Math.floor(elapsedSeconds * PLAYBACK_SPEED_TOLERANCE), MAX_HEARTBEAT_ADVANCE_SECONDS);
      const maximumAllowedPosition = Math.min(duration, previousPosition + permittedAdvance);

      if (position > maximumAllowedPosition) {
        return NextResponse.json({
          error: 'Videoning ko‘rilmagan qismiga oldinga o‘tib bo‘lmaydi.',
          allowedPosition: previousPosition,
        }, { status: 409 });
      }

      const watchedSeconds = Math.max(previousPosition, position);
      const ended = body.ended === true;
      const completed = Boolean(existing?.isCompleted) || (ended && watchedSeconds >= duration - COMPLETION_TOLERANCE_SECONDS);
      const progress = await Progress.findOneAndUpdate(
        { userId: user.id, videoId },
        {
          $set: {
            watchedSeconds,
            resumePosition: position,
            isCompleted: completed,
            lastWatched: now,
            lastHeartbeatAt: now,
            ...(completed && !existing?.isCompleted ? { completedAt: now } : {}),
          },
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );

      return NextResponse.json(progress);
    }

    if (!existing?.isCompleted) {
      return NextResponse.json({ error: 'Testni boshlashdan oldin videoni to‘liq tomosha qiling.' }, { status: 409 });
    }

    const questions = (video.testQuestions || []) as TestQuestion[];
    if (!questions.length) return NextResponse.json({ error: 'Bu video uchun test yo‘q' }, { status: 400 });
    if (!Array.isArray(body.answers) || body.answers.length !== questions.length || body.answers.some((answer, index) => !Number.isInteger(answer) || answer < 0 || answer >= questions[index].options.length)) {
      return NextResponse.json({ error: 'Test javoblari to‘liq emas' }, { status: 400 });
    }

    const answers = body.answers as number[];
    const score = questions.reduce((total, question, index) => total + (answers[index] === question.correctAnswer ? 1 : 0), 0);
    const scorePercentage = Math.round((score / questions.length) * 100);
    const progress = await Progress.findOneAndUpdate(
      { userId: user.id, videoId },
      {
        $set: {
          testScore: score,
          scorePercentage,
          testFinished: true,
          lastWatched: now,
        },
        $inc: { testAttempts: 1 },
      },
      { new: true }
    );

    return NextResponse.json(progress);
  } catch {
    return NextResponse.json({ error: 'Progress saqlashda xatolik' }, { status: 500 });
  }
}
