import { NextResponse } from 'next/server';
import Ably from 'ably';
import { Chess } from 'chess.js';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { dbConnect } from '@/lib/db';
import Game from '@/models/Game';
import User from '@/models/User';
import { makeCheckersMove, hasAnyLegalMove, type CheckersBoard } from '@/lib/game';

type ChessPromotion = 'q' | 'r' | 'b' | 'n';

export async function POST(request: Request, { params }: { params: Promise<{ gameId: string }> }) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return NextResponse.json({ error: 'Ruxsat yo‘q' }, { status: 401 });
  const { gameId } = await params;
  const { from, to, promotion } = await request.json() as { from?: string; to?: string; promotion?: ChessPromotion };
  if (!from || !to) return NextResponse.json({ error: 'Yurish noto‘g‘ri' }, { status: 400 });
  await dbConnect();
  const game = await Game.findOne({ _id: gameId, $or: [{ whitePlayerId: userId }, { blackPlayerId: userId }], status: 'ACTIVE' });
  if (!game) return NextResponse.json({ error: 'Faol o‘yin topilmadi' }, { status: 404 });
  const color = game.whitePlayerId.toString() === userId ? 'white' : 'black';
  if (game.turn !== color) return NextResponse.json({ error: 'Hozir raqibingizning navbati' }, { status: 409 });
  try {
    let notation = `${from}-${to}`;
    let completed = false;
    let winnerId: string | undefined;
    let endReason: string | undefined;
    let keepTurn = false;
    if (game.gameType === 'CHESS') {
      const chess = new Chess(game.boardState);
      const move = chess.move({ from, to, promotion: promotion || 'q' });
      if (!move) throw new Error('Bu dona bunday yura olmaydi.');
      game.boardState = chess.fen();
      notation = move.san;
      completed = chess.isGameOver();
      if (completed) {
        if (chess.isCheckmate()) { winnerId = userId; endReason = 'checkmate'; }
        else if (chess.isStalemate()) endReason = 'stalemate';
        else if (chess.isThreefoldRepetition()) endReason = 'threefold';
        else if (chess.isInsufficientMaterial()) endReason = 'insufficient_material';
        else if (chess.isDrawByFiftyMoves()) endReason = 'fifty_move';
        else endReason = 'draw';
      }
    } else {
      if (game.pendingCapture && game.pendingCapture !== from) throw new Error('Avval boshlagan urishni davom ettirishingiz kerak.');
      const result = makeCheckersMove(JSON.parse(game.boardState) as CheckersBoard, from, to, color);
      game.boardState = JSON.stringify(result.board);
      keepTurn = result.continued;
      game.pendingCapture = result.continued ? to : null;
      const opponentColor = color === 'white' ? 'black' : 'white';
      const remaining = result.board.flat().filter(Boolean).filter((piece) => opponentColor === 'white' ? ['r', 'R'].includes(piece!) : ['b', 'B'].includes(piece!));
      if (remaining.length === 0) { completed = true; winnerId = userId; endReason = 'no_pieces'; }
      else if (!keepTurn && !hasAnyLegalMove(result.board, opponentColor)) { completed = true; winnerId = userId; endReason = 'no_moves'; }
    }
    if (!keepTurn) game.turn = color === 'white' ? 'black' : 'white';
    game.moves.push({ from, to, notation, color, at: new Date() });
    if (completed) {
      game.status = 'COMPLETED';
      game.endReason = endReason;
      if (winnerId) { game.winnerId = winnerId as never; const loserId = color === 'white' ? game.blackPlayerId : game.whitePlayerId; await Promise.all([User.updateOne({ _id: winnerId }, { $inc: { gameRating: 16, gamesWon: 1 } }), User.updateOne({ _id: loserId }, { $inc: { gameRating: -12, gamesLost: 1 } })]); }
    }
    await game.save();
    await game.populate([{ path: 'whitePlayerId', select: 'name image' }, { path: 'blackPlayerId', select: 'name image' }]);
    if (process.env.ABLY_API_KEY) { const ably = new Ably.Rest(process.env.ABLY_API_KEY); await ably.channels.get(`onevsone:game:${gameId}`).publish('game:update', { gameId }); }
    return NextResponse.json({ ...game.toObject(), playerColor: color });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Yurish saqlanmadi' }, { status: 400 });
  }
}
