import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import Book from "@/models/Book";
import Notification from "@/models/Notification";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });
    }

    const { id } = await params;
    const { text } = await req.json();
    if (!text) return NextResponse.json({ error: "Matn kiritilmadi" }, { status: 400 });

    await dbConnect();
    
    const comment = {
      userId: (session.user as any).id,
      userName: session.user?.name || "Noma'lum",
      text: text,
      createdAt: new Date()
    };

    const book = await Book.findByIdAndUpdate(
      id,
      { $push: { comments: comment } },
      { new: true }
    );

    if (!book) return NextResponse.json({ error: "Kitob topilmadi" }, { status: 404 });

    // Bildirishnoma yaratish
    await Notification.create({
      type: 'NEW_COMMENT',
      title: 'Yangi izoh',
      message: `${comment.userName} "${book.title}" kitobiga izoh qoldirdi: "${text.substring(0, 30)}${text.length > 30 ? '...' : ''}"`,
      link: `/dashboard/books/${id}`
    });
    
    return NextResponse.json(book);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
