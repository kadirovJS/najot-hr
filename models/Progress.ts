import { Schema, model, models } from 'mongoose';

const ProgressSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  videoId: { type: Schema.Types.ObjectId, ref: 'Video', required: true },
  // Video davomida erishilgan eng uzoq, server tasdiqlagan nuqta.
  watchedSeconds: { type: Number, default: 0, min: 0 },
  // Foydalanuvchi qaytib kelganda davom etadigan oxirgi nuqta.
  resumePosition: { type: Number, default: 0, min: 0 },
  isCompleted: { type: Boolean, default: false },
  testScore: { type: Number, default: 0 },
  scorePercentage: { type: Number, default: 0 },
  testFinished: { type: Boolean, default: false },
  testAttempts: { type: Number, default: 0 },
  lastWatched: { type: Date, default: Date.now },
  lastHeartbeatAt: { type: Date, default: Date.now },
  completedAt: { type: Date },
});

ProgressSchema.index({ userId: 1, videoId: 1 }, { unique: true });

const Progress = models.Progress || model('Progress', ProgressSchema);
export default Progress;
