import { NextResponse } from "next/server";

import Blog from "@/models/Blog";
import Notification from "@/models/Notification";
import { getServerSession } from "next-auth";
import type { Session } from "next-auth";
import { authOptions } from "@/lib/auth";
import { dbConnect } from "@/lib/db";
import { createUniqueBlogSlug } from "@/lib/blogSlug";

function isSuperAdmin(session: Session | null) {
  return (session?.user as { role?: string } | undefined)?.role === 'SUPER_ADMIN';
}

function getPostImages(body: Record<string, unknown>, fallbackCoverImage = '') {
  const images = Array.isArray(body.images)
    ? [...new Set(body.images.filter((image): image is string => typeof image === 'string' && Boolean(image.trim())).map((image) => image.trim()))]
    : fallbackCoverImage ? [fallbackCoverImage] : [];
  if (!images.length || images.length > 5) throw new Error('Post uchun 1 tadan 5 tagacha rasm tanlang');

  const requestedCover = typeof body.coverImage === 'string' ? body.coverImage.trim() : fallbackCoverImage;
  const coverImage = images.includes(requestedCover) ? requestedCover : images[0];
  return { images: [coverImage, ...images.filter((image) => image !== coverImage)], coverImage };
}

export async function GET(req: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const wantsAdminPosts = searchParams.get("admin") === "true";
    const mainBlogOnly = searchParams.get("main") === "true";
    const session = wantsAdminPosts ? await getServerSession(authOptions) : null;
    const canViewAllPosts = wantsAdminPosts && isSuperAdmin(session);

    const query = canViewAllPosts
      ? {}
      : { isVisible: true, ...(mainBlogOnly ? { mainBlog: true } : {}) };

    const posts = await Blog.find(query).sort({ createdAt: -1 });
    await Promise.all(posts.filter((post) => !post.slug).map(async (post) => {
      post.slug = await createUniqueBlogSlug(post.title, String(post._id));
      await post.save();
    }));
    return NextResponse.json(posts);
  } catch {
    return NextResponse.json({ error: "Xatolik yuz berdi" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!isSuperAdmin(session)) {
      return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 403 });
    }

    await dbConnect();
    const body = await req.json() as Record<string, unknown>;
    const title = typeof body.title === 'string' ? body.title.trim() : '';
    if (!title) return NextResponse.json({ error: 'Post sarlavhasini kiriting' }, { status: 400 });
    const fallbackCoverImage = typeof body.coverImage === 'string' ? body.coverImage.trim() : '';
    const { images, coverImage } = getPostImages(body, fallbackCoverImage);
    const post = await Blog.create({
      title,
      excerpt: body.excerpt,
      content: body.content,
      coverImage,
      images,
      slug: await createUniqueBlogSlug(title),
      isVisible: body.isVisible ?? true,
      mainBlog: body.mainBlog ?? false,
      author: session?.user?.name || "Najot Ta'lim HR",
    });

    await Notification.create({
      type: 'NEW_BLOG_POST',
      title: 'Yangi blog post',
      message: `"${post.title}" sarlavhali yangi maqola e'lon qilindi.`,
      link: `/blog/${post._id}`
    });

    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    console.error("POST BLOG ERROR:", error);
    return NextResponse.json({ error: "Post yaratishda xatolik" }, { status: 500 });
  }
}
