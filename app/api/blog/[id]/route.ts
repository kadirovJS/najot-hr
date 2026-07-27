import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import Blog from "@/models/Blog";
import BlogView from "@/models/BlogView";
import { getServerSession } from "next-auth";
import type { Session } from "next-auth";
import { authOptions } from "@/lib/auth";

function isSuperAdmin(session: Session | null) {
  return (session?.user as { role?: string } | undefined)?.role === 'SUPER_ADMIN';
}

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await dbConnect();
    const post = await Blog.findOne({ _id: id, isVisible: true });
    if (!post) return NextResponse.json({ error: "Topilmadi" }, { status: 404 });
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
    const allowedFields = ['title', 'excerpt', 'content', 'coverImage', 'isVisible', 'mainBlog'] as const;
    const update = Object.fromEntries(
      allowedFields
        .filter((field) => body[field] !== undefined)
        .map((field) => [field, body[field]]),
    );

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
