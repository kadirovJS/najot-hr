import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { dbConnect } from '@/lib/db';
import Game from '@/models/Game';
import { expireStaleGamesAndChallenges } from '@/lib/gameExpiry';

export async function GET(_: Request, { params }: { params: Promise<{ gameId: string }> }) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return NextResponse.json({ error: 'Ruxsat yo‘q' }, { status: 401 });
  const { gameId } = await params;
  await dbConnect();
  await expireStaleGamesAndChallenges();
  const filter = { _id: gameId, $or: [{ whitePlayerId: userId }, { blackPlayerId: userId }] };
  const game = await Game.findOneAndUpdate({ ...filter, status: 'SCHEDULED', scheduledFor: { $lte: new Date() } }, { status: 'ACTIVE' }, { new: true })
    .populate('whitePlayerId', 'name image')
    .populate('blackPlayerId', 'name image')
    || await Game.findOne(filter).populate('whitePlayerId', 'name image').populate('blackPlayerId', 'name image');
  if (!game) return NextResponse.json({ error: 'O‘yin topilmadi' }, { status: 404 });
  return NextResponse.json({
    ...game.toObject(),
    playerColor: (game.whitePlayerId as unknown as { _id: { toString(): string } })._id.toString() === userId ? 'white' : 'black',
  });
}
