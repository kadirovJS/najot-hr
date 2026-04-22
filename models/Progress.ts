import mongoose, { Schema, model, models } from 'mongoose';

const ProgressSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  videoId: { type: Schema.Types.ObjectId, ref: 'Video', required: true },
  watchedSeconds: { type: Number, default: 0 },
  isCompleted: { type: Boolean, default: false },
  testScore: { type: Number, default: 0 },
  scorePercentage: { type: Number, default: 0 },
  testFinished: { type: Boolean, default: false },
  lastWatched: { type: Date, default: Date.now },
});

const Progress = models.Progress || model('Progress', ProgressSchema);
export default Progress;
