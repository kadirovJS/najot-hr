import mongoose, { Schema, model, models } from 'mongoose';

const CommentSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  userName: { type: String, required: true },
  userImage: { type: String, default: '' },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const BookSchema = new Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  description: { type: String, required: true },
  imageUrl: { type: String },
  publicId: { type: String }, // Cloudinary rasmni o'chirish uchun
  comments: [CommentSchema],
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
});

const Book = models.Book || model('Book', BookSchema);
export default Book;
