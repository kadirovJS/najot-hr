import mongoose, { Schema, model, models } from 'mongoose';

const NotificationSchema = new Schema({
  type: { 
    type: String, 
    enum: ['NEW_VIDEO', 'NEW_VACANCY', 'NEW_COMMENT', 'SYSTEM'], 
    required: true 
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  link: { type: String }, // Bildirishnoma ustiga bosganda qayerga borishi
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

const Notification = models.Notification || model('Notification', NotificationSchema);
export default Notification;
