import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { dbConnect } from '@/lib/db';
import User from '@/models/User';
import GameChallenge from '@/models/GameChallenge';
import Game from '@/models/Game';
import Notification from '@/models/Notification';
import { expireStaleGamesAndChallenges } from '@/lib/gameExpiry';

type SessionUser = { id?: string; name?: string };

export async function GET() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as SessionUser | undefined)?.id;
  if (!userId) return NextResponse.json({ error: 'Ruxsat yo‘q' }, { status: 401 });
  await dbConnect();
  await expireStaleGamesAndChallenges();
  const [players, challenges, leaderboard, games] = await Promise.all([
    User.find({ _id: { $ne: userId }, status: 'ACTIVE' }, 'name image role department gameRating gamesWon gamesLost').sort({ name: 1 }).lean(),
    GameChallenge.find({ $or: [{ challengerId: userId }, { opponentId: userId }], status: 'PENDING' }).populate('challengerId', 'name image').populate('opponentId', 'name image').sort({ createdAt: -1 }).lean(),
    User.find({ status: 'ACTIVE' }, 'name image gameRating gamesWon gamesLost').sort({ gameRating: -1, gamesWon: -1 }).limit(10).lean(),
    Game.find({ $or: [{ whitePlayerId: userId }, { blackPlayerId: userId }], status: { $in: ['SCHEDULED', 'ACTIVE'] } }).populate('whitePlayerId', 'name').populate('blackPlayerId', 'name').sort({ updatedAt: -1 }).limit(10).lean(),
  ]);
  return NextResponse.json({ viewerId: userId, players, challenges, leaderboard, games });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  const current = session?.user as SessionUser | undefined;
  if (!current?.id) return NextResponse.json({ error: 'Ruxsat yo‘q' }, { status: 401 });
  const body = await request.json();
  const { opponentId, gameType, scheduledFor } = body as { opponentId?: string; gameType?: string; scheduledFor?: string };
  if (!opponentId || opponentId === current.id || !['CHESS', 'CHECKERS'].includes(gameType || '')) return NextResponse.json({ error: 'Ma’lumotlar noto‘g‘ri' }, { status: 400 });
  const time = scheduledFor ? new Date(scheduledFor) : new Date();
  if (Number.isNaN(time.getTime()) || time.getTime() < Date.now() - 60_000) return NextResponse.json({ error: 'O‘yin vaqti noto‘g‘ri' }, { status: 400 });
  await dbConnect();
  const opponent = await User.findOne({ _id: opponentId, status: 'ACTIVE' }, '_id');
  if (!opponent) return NextResponse.json({ error: 'Xodim topilmadi' }, { status: 404 });
  const challenge = await GameChallenge.create({ challengerId: current.id, opponentId, gameType, scheduledFor: time });
  await Notification.create({ type: 'GAME_CHALLENGE', recipientId: opponentId, title: '1 vs 1 taklifi', message: `${current.name || 'Xodim'} sizni ${gameType === 'CHESS' ? 'shaxmat' : 'shashka'} o‘yiniga taklif qildi.`, link: '/onevsone' });
  return NextResponse.json(challenge, { status: 201 });
}
