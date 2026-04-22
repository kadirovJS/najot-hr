import mongoose, { Schema, model, models } from 'mongoose';

const TestSchema = new Schema({
  question: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctAnswer: { type: Number, required: true }, // 0-3 gacha bo'lgan index
  type: { 
    type: String, 
    required: true, 
    enum: ['DISC', 'PAEI'] 
  },
  createdAt: { type: Date, default: Date.now },
});

const Test = models.Test || model('Test', TestSchema);
export default Test;
