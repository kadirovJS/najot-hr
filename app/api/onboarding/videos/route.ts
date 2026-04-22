import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import Video from "@/models/Video";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });
    await dbConnect();
    const user = session.user as any;
    const query = user.role === 'SUPER_ADMIN' ? {} : { $or: [{ departments: 'All' }, { departments: user.department }] };
    const videos = await Video.find(query).sort({ createdAt: -1 });
    return NextResponse.json(videos);
  } catch (error: any) {
    console.error("ONBOARDING VIDEOS ERROR:", error);
    return NextResponse.json({ error: error.message || "Xatolik" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 403 });
    }

    const body = await req.json();
    await dbConnect();
    const video = await Video.create(body);
    return NextResponse.json(video, { status: 201 });
  } catch (error: any) {
    console.error("ONBOARDING VIDEOS ERROR:", error);
    return NextResponse.json({ error: error.message || "Xatolik" }, { status: 500 });
  }
}
