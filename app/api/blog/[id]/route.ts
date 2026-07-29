import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import Blog from "@/models/Blog";
import BlogView from "@/models/BlogView";
import { getServerSession } from "next-auth";
import type { Session } from "next-auth";
import { authOptions } from "@/lib/auth";
import { blogIdentifierQuery, createUniqueBlogSlug } from "@/lib/blogSlug";

function isSuperAdmin(session: Session | null) {
  return (session?.user as { role?: string } | undefined)?.role === 'SUPER_ADMIN';
}

function getPostImages(body: Record<string, unknown>, fallbackImages: string[]) {
  const images = Array.isArray(body.images)
    ? [...new Set(body.images.filter((image): image is string => typeof image === 'string' && Boolean(image.trim())).map((image) => image.trim()))]
    : fallbackImages;
  if (!images.length || images.length > 5) throw new Error('Post uchun 1 tadan 5 tagacha rasm tanlang');

  const requestedCover = typeof body.coverImage === 'string' ? body.coverImage.trim() : images[0];
  const coverImage = images.includes(requestedCover) ? requestedCover : images[0];
  return { images: [coverImage, ...images.filter((image) => image !== coverImage)], coverImage };
}

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await dbConnect();
    const post = await Blog.findOne({ ...blogIdentifierQuery(id), isVisible: true });
    if (!post) return NextResponse.json({ error: "Topilmadi" }, { status: 404 });
    if (!post.slug) {
      post.slug = await createUniqueBlogSlug(post.title, String(post._id));
      await post.save();
    }
    return NextResponse.json(post);
  } catch {
    return NextResponse.json({ error: "Xatolik yuz berdi" }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!isSuperAdmin(session)) {
      return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 403 });
    }

    const { id } = await params;
    await dbConnect();
    const body = await req.json() as Record<string, unknown>;
    const existingPost = await Blog.findById(id).select('coverImage images');
    if (!existingPost) return NextResponse.json({ error: "Topilmadi" }, { status: 404 });

    const existingImages = Array.isArray(existingPost.images) && existingPost.images.length ? existingPost.images : [existingPost.coverImage];
    const { images, coverImage } = getPostImages(body, existingImages);
    const allowedFields = ['title', 'excerpt', 'content', 'isVisible', 'mainBlog'] as const;
    const update = Object.fromEntries(
      allowedFields
        .filter((field) => body[field] !== undefined)
        .map((field) => [field, body[field]]),
    );
    if (body.images !== undefined || body.coverImage !== undefined) {
      update.images = images;
      update.coverImage = coverImage;
    }

    const updatedPost = await Blog.findByIdAndUpdate(id, update, { new: true, runValidators: true });

    if (!updatedPost) return NextResponse.json({ error: "Topilmadi" }, { status: 404 });
    return NextResponse.json(updatedPost);
  } catch {
    return NextResponse.json({ error: "Tahrirlashda xatolik" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!isSuperAdmin(session)) {
      return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 403 });
    }

    const { id } = await params;
    await dbConnect();
    await Blog.findByIdAndDelete(id);
    await BlogView.deleteMany({ blogId: id });

    return NextResponse.json({ message: "O'chirildi" });
  } catch {
    return NextResponse.json({ error: "O'chirishda xatolik" }, { status: 500 });
  }
}
