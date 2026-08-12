import { Schema, model, models } from 'mongoose';

const GameChallengeSchema = new Schema({
  challengerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  opponentId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  gameType: { type: String, enum: ['CHESS', 'CHECKERS'], required: true },
  scheduledFor: { type: Date, required: true },
  status: { type: String, enum: ['PENDING', 'ACCEPTED', 'DECLINED', 'CANCELLED', 'EXPIRED'], default: 'PENDING', index: true },
  gameId: { type: Schema.Types.ObjectId, ref: 'Game' },
}, { timestamps: true });

export default models.GameChallenge || model('GameChallenge', GameChallengeSchema);
