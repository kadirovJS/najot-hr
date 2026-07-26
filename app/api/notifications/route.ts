import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import Notification from "@/models/Notification";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const NOTIFICATION_RETENTION_MS = 14 * 24 * 60 * 60 * 1000;

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });

    await dbConnect();
    const cutoff = new Date(Date.now() - NOTIFICATION_RETENTION_MS);
    await Notification.deleteMany({ createdAt: { $lt: cutoff } });
    const notifications = await Notification.find({ createdAt: { $gte: cutoff } }).sort({ createdAt: -1 }).limit(20);
    return NextResponse.json(notifications);
  } catch {
    return NextResponse.json({ error: "Xatolik" }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const session = await getServerSession(authOptions);
    const role = (session?.user as { role?: string } | undefined)?.role;
    if (!session || role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 403 });
    }

    await dbConnect();
    await Notification.deleteMany({}); // Barcha bildirishnomalarni tozalash
    return NextResponse.json({ message: "Tozalandi" });
  } catch {
    return NextResponse.json({ error: "Xatolik" }, { status: 500 });
  }
}
