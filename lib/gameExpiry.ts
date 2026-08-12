import Game from '@/models/Game';
import GameChallenge from '@/models/GameChallenge';

const EXPIRY_MS = 60 * 60 * 1000;

export async function expireStaleGamesAndChallenges() {
  const cutoff = new Date(Date.now() - EXPIRY_MS);
  await Promise.all([
    Game.updateMany({ status: 'SCHEDULED', scheduledFor: { $lte: cutoff } }, { status: 'CANCELLED' }),
    Game.updateMany({ status: 'ACTIVE', 'moves.0': { $exists: false }, scheduledFor: { $lte: cutoff } }, { status: 'CANCELLED' }),
    GameChallenge.updateMany({ status: 'PENDING', createdAt: { $lte: cutoff } }, { status: 'EXPIRED' }),
  ]);
}
