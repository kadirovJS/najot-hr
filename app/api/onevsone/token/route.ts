import { NextResponse } from 'next/server';
import Ably from 'ably';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { dbConnect } from '@/lib/db';
import Game from '@/models/Game';

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  const gameId = new URL(request.url).searchParams.get('gameId');
  if (!userId || !gameId || !process.env.ABLY_API_KEY) return NextResponse.json({ error: 'Ruxsat yo‘q' }, { status: 401 });
  await dbConnect();
  const game = await Game.findOne({ _id: gameId, $or: [{ whitePlayerId: userId }, { blackPlayerId: userId }] }, '_id');
  if (!game) return NextResponse.json({ error: 'O‘yin topilmadi' }, { status: 404 });
  const ably = new Ably.Rest(process.env.ABLY_API_KEY);
  const token = await ably.auth.createTokenRequest({ clientId: userId, capability: { [`onevsone:game:${gameId}`]: ['subscribe'] }, ttl: 60 * 60 * 1000 });
  return NextResponse.json(token);
}
