import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import Notification from "@/models/Notification";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });

    await dbConnect();
    const notifications = await Notification.find().sort({ createdAt: -1 }).limit(20);
    return NextResponse.json(notifications);
  } catch (error) {
    return NextResponse.json({ error: "Xatolik" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 403 });
    }

    await dbConnect();
    await Notification.deleteMany({}); // Barcha bildirishnomalarni tozalash
    return NextResponse.json({ message: "Tozalandi" });
  } catch (error) {
    return NextResponse.json({ error: "Xatolik" }, { status: 500 });
  }
}
