import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { dbConnect } from '@/lib/db';
import GameChallenge from '@/models/GameChallenge';
import Game from '@/models/Game';
import Notification from '@/models/Notification';
import { initialGameState } from '@/lib/game';

export async function PATCH(request: Request, { params }: { params: Promise<{ challengeId: string }> }) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return NextResponse.json({ error: 'Ruxsat yo‘q' }, { status: 401 });
  const { challengeId } = await params;
  const { action } = await request.json() as { action?: 'accept' | 'decline' | 'cancel' };
  await dbConnect();
  if (action === 'cancel') {
    const own = await GameChallenge.findOne({ _id: challengeId, challengerId: userId, status: 'PENDING' });
    if (!own) return NextResponse.json({ error: 'Taklif topilmadi' }, { status: 404 });
    own.status = 'CANCELLED';
    await own.save();
    return NextResponse.json(own);
  }
  const challenge = await GameChallenge.findOne({ _id: challengeId, opponentId: userId, status: 'PENDING' });
  if (!challenge || !action) return NextResponse.json({ error: 'Taklif topilmadi' }, { status: 404 });
  if (action === 'decline') { challenge.status = 'DECLINED'; await challenge.save(); return NextResponse.json(challenge); }
  const game = await Game.create({ gameType: challenge.gameType, whitePlayerId: challenge.challengerId, blackPlayerId: challenge.opponentId, scheduledFor: challenge.scheduledFor, status: challenge.scheduledFor <= new Date() ? 'ACTIVE' : 'SCHEDULED', boardState: initialGameState(challenge.gameType) });
  challenge.status = 'ACCEPTED'; challenge.gameId = game._id; await challenge.save();
  await Notification.create({ type: 'GAME_CHALLENGE', recipientId: challenge.challengerId, title: '1 vs 1 taklifi qabul qilindi', message: `Raqibingiz ${challenge.gameType === 'CHESS' ? 'shaxmat' : 'shashka'} taklifini qabul qildi.`, link: `/onevsone/${game._id}` });
  return NextResponse.json({ gameId: game._id.toString() });
}
