import { Schema, model, models } from 'mongoose';

const BlogSchema = new Schema({
  title: { type: String, required: true },
  excerpt: { type: String, required: true },
  content: { type: String, required: true },
  coverImage: { type: String, required: true },
  author: { type: String, required: true },
  isVisible: { type: Boolean, default: true },
  mainBlog: { type: Boolean, default: false },
  viewCount: { type: Number, default: 0, min: 0 },
  createdAt: { type: Date, default: Date.now },
});

const Blog = models.Blog || model('Blog', BlogSchema);

// Next.js development hot reload avval tuzilgan Mongoose modelini saqlab qoladi.
// Shu holatda ham yangi `mainBlog` maydoni PUT so‘rovlaridan chiqarib tashlanmasligi kerak.
if (!Blog.schema.path('mainBlog')) {
  Blog.schema.add({ mainBlog: { type: Boolean, default: false } });
}

export default Blog;
