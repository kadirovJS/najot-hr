import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import Book from "@/models/Book";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await dbConnect();
    const book = await Book.findById(id).populate('comments.userId', 'image').lean();
    if (!book) return NextResponse.json({ error: "Kitob topilmadi" }, { status: 404 });

    const comments = book.comments.map((comment: any) => {
      const commenter = comment.userId && typeof comment.userId === 'object' ? comment.userId : null;
      return {
        ...comment,
        userId: commenter?._id?.toString() || comment.userId?.toString(),
        userImage: commenter?.image || comment.userImage || '',
      };
    });

    return NextResponse.json({ ...book, comments });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    await dbConnect();
    
    const book = await Book.findByIdAndUpdate(id, body, { new: true });
    if (!book) return NextResponse.json({ error: "Kitob topilmadi" }, { status: 404 });
    
    return NextResponse.json(book);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 403 });
    }

    const { id } = await params;
    await dbConnect();
    
    const book = await Book.findByIdAndDelete(id);
    if (!book) return NextResponse.json({ error: "Kitob topilmadi" }, { status: 404 });
    
    return NextResponse.json({ message: "O'chirildi" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
