import Blog from '@/models/Blog';
import { dbConnect } from '@/lib/db';
import { blogIdentifierQuery, createUniqueBlogSlug } from '@/lib/blogSlug';
import type { IBlog } from '@/types/blog';

type BlogDoc = {
  _id: unknown;
  title: string;
  excerpt: string;
  content: string;
  coverImage: string;
  images?: string[];
  slug?: string;
  author: string;
  isVisible: boolean;
  mainBlog: boolean;
  viewCount: number;
  createdAt: Date | string;
};

function toPlainBlog(doc: BlogDoc): IBlog {
  const savedImages = doc.images?.length ? doc.images : [doc.coverImage];
  return {
    _id: String(doc._id),
    title: doc.title,
    excerpt: doc.excerpt,
    content: doc.content,
    coverImage: doc.coverImage,
    images: [doc.coverImage, ...savedImages.filter((image) => image !== doc.coverImage)],
    slug: doc.slug || '',
    author: doc.author,
    isVisible: doc.isVisible,
    mainBlog: doc.mainBlog,
    viewCount: doc.viewCount,
    createdAt: new Date(doc.createdAt).toISOString(),
  };
}

async function ensureSlugs(posts: InstanceType<typeof Blog>[]) {
  await Promise.all(posts.filter((post) => !post.slug).map(async (post) => {
    post.slug = await createUniqueBlogSlug(post.title, String(post._id));
    await post.save();
  }));
}

export async function getPublicBlogPosts(): Promise<IBlog[]> {
  await dbConnect();
  const posts = await Blog.find({ isVisible: true }).sort({ createdAt: -1 });
  await ensureSlugs(posts);
  return posts.map((post) => toPlainBlog(post.toObject()));
}

export async function getPublicBlogPostByIdentifier(identifier: string): Promise<IBlog | null> {
  await dbConnect();
  const post = await Blog.findOne({ ...blogIdentifierQuery(identifier), isVisible: true });
  if (!post) return null;
  await ensureSlugs([post]);
  return toPlainBlog(post.toObject());
}
