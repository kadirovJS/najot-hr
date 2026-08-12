import { Schema, model, models } from 'mongoose';

const NOTIFICATION_RETENTION_SECONDS = 14 * 24 * 60 * 60;

const NotificationSchema = new Schema({
  type: { 
    type: String, 
    enum: ['NEW_VIDEO', 'NEW_VACANCY', 'NEW_BLOG_POST', 'NEW_COMMENT', 'GAME_CHALLENGE', 'SYSTEM'],
    required: true 
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  link: { type: String }, // Bildirishnoma ustiga bosganda qayerga borishi
  recipientId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
  isRead: { type: Boolean, default: false },
  // MongoDB TTL indeksi muddati tugagan bildirishnomalarni avtomatik o‘chiradi.
  createdAt: { type: Date, default: Date.now, expires: NOTIFICATION_RETENTION_SECONDS },
});

const Notification = models.Notification || model('Notification', NotificationSchema);
export default Notification;
