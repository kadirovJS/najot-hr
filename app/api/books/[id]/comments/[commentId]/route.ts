import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import Book from "@/models/Book";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Izohni tahrirlash
export async function PUT(
  req: Request, 
  { params }: { params: Promise<{ id: string, commentId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });

    const { id, commentId } = await params;
    const { text } = await req.json();
    const userId = (session.user as any).id;
    const isSuperAdmin = (session.user as any).role === 'SUPER_ADMIN';

    await dbConnect();

    const book = await Book.findOneAndUpdate(
      isSuperAdmin
        ? { _id: id, "comments._id": commentId }
        : { _id: id, "comments._id": commentId, "comments.userId": userId },
      { $set: { "comments.$.text": text } },
      { new: true }
    );

    if (!book) return NextResponse.json({ error: "Izoh topilmadi yoki ruxsat yo'q" }, { status: 404 });

    return NextResponse.json(book);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Izohni o'chirish
export async function DELETE(
  req: Request, 
  { params }: { params: Promise<{ id: string, commentId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });

    const { id, commentId } = await params;
    const userId = (session.user as any).id;
    const isSuperAdmin = (session.user as any).role === 'SUPER_ADMIN';

    await dbConnect();

    const book = await Book.findOneAndUpdate(
      { _id: id },
      { $pull: { comments: isSuperAdmin ? { _id: commentId } : { _id: commentId, userId } } },
      { new: true }
    );

    if (!book) return NextResponse.json({ error: "Kitob topilmadi" }, { status: 404 });

    return NextResponse.json(book);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
