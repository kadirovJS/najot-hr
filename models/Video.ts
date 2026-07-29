import { Schema, model, models } from 'mongoose';

const VideoSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String },
  youtubeUrl: { type: String },
  cloudinaryUrl: { type: String },
  publicId: { type: String }, // Cloudinary o'chirish uchun kerak
  coverImageUrl: { type: String },
  coverImagePublicId: { type: String }, // Cover rasmni Cloudinary'dan o'chirish uchun kerak
  duration: { type: Number, default: 0 }, // Sekundlarda
  track: {
    type: String,
    enum: ['SOFT_SKILLS', 'TECHNICAL_SKILLS', 'MARKETING_DESIGN', 'SALES'],
    default: 'SOFT_SKILLS',
  },
  departments: [{ 
    type: String, 
    enum: ['All', 'Support teacher', 'Main teacher', 'Management', 'Sales', 'Boshqaruv', 'Other'] 
  }],
  testQuestions: [{
    question: String,
    options: [String],
    correctAnswer: Number
  }],
  createdAt: { type: Date, default: Date.now },
});

const Video = models.Video || model('Video', VideoSchema);
export default Video;
