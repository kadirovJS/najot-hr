import { Schema, model, models } from 'mongoose';

const GameSchema = new Schema({
  gameType: { type: String, enum: ['CHESS', 'CHECKERS'], required: true },
  whitePlayerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  blackPlayerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  scheduledFor: { type: Date, required: true },
  status: { type: String, enum: ['SCHEDULED', 'ACTIVE', 'COMPLETED', 'CANCELLED'], default: 'SCHEDULED', index: true },
  boardState: { type: String, required: true },
  turn: { type: String, enum: ['white', 'black'], default: 'white' },
  winnerId: { type: Schema.Types.ObjectId, ref: 'User' },
  endReason: { type: String, enum: ['checkmate', 'stalemate', 'threefold', 'insufficient_material', 'fifty_move', 'draw', 'no_pieces', 'no_moves'] },
  pendingCapture: { type: String, default: null },
  moves: [{ from: String, to: String, notation: String, color: { type: String, enum: ['white', 'black'] }, at: { type: Date, default: Date.now } }],
}, { timestamps: true });

export default models.Game || model('Game', GameSchema);
