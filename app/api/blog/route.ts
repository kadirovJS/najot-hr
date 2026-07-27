import { NextResponse } from "next/server";

import Blog from "@/models/Blog";
import Notification from "@/models/Notification";
import { getServerSession } from "next-auth";
import type { Session } from "next-auth";
import { authOptions } from "@/lib/auth";
import { dbConnect } from "@/lib/db";

function isSuperAdmin(session: Session | null) {
  return (session?.user as { role?: string } | undefined)?.role === 'SUPER_ADMIN';
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
    const body = await req.json();
    const post = await Blog.create({
      title: body.title,
      excerpt: body.excerpt,
      content: body.content,
      coverImage: body.coverImage,
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
