import { Schema, model, models } from 'mongoose';

const BlogViewSchema = new Schema({
  blogId: { type: Schema.Types.ObjectId, ref: 'Blog', required: true },
  deviceHash: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
}, { versionKey: false });

// Bir browser/qurilma bir blog uchun faqat bitta ko‘rish yozuviga ega bo‘ladi.
BlogViewSchema.index({ blogId: 1, deviceHash: 1 }, { unique: true, name: 'unique_blog_device_view' });

const BlogView = models.BlogView || model('BlogView', BlogViewSchema);
export default BlogView;
