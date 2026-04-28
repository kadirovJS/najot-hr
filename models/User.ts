import { Schema, model, models } from 'mongoose';

const UserSchema = new Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['SUPER_ADMIN', 'TEACHER', 'HR', 'ACCOUNTANT'], 
    default: 'TEACHER' 
  },
  image: { type: String },
  email: { type: String },
  emailVerified: { type: Boolean, default: false },
  verificationCode: { type: String },
  notificationSettings: {
    browser: { type: Boolean, default: true },
    email: { type: Boolean, default: false }
  },
  department: { 
    type: String, 
    enum: ['Support teacher', 'Main teacher', 'Management', 'Sales', 'Boshqaruv', 'Other'],
    default: 'Other'
  },
  status: {
    type: String,
    enum: ['ACTIVE', 'BLOCKED'],
    default: 'ACTIVE'
  },
  onboardingProgress: { type: Number, default: 0 },
  watchedVideos: [{ type: Schema.Types.ObjectId, ref: 'Video' }],
  createdAt: { type: Date, default: Date.now },
});

const User = models.User || model('User', UserSchema);
export default User;