import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import Progress from "@/models/Progress";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });

    await dbConnect();
    const user = session.user as any;
    const progress = await Progress.find({ userId: user.id });
    
    return NextResponse.json(progress);
  } catch (error) {
    return NextResponse.json({ error: "Xatolik yuz berdi" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });

    await dbConnect();
    const user = session.user as any;
    const { 
      videoId, 
      watchedSeconds, 
      isCompleted, 
      testScore, 
      scorePercentage, 
      testFinished 
    } = await req.json();

    const progress = await Progress.findOneAndUpdate(
      { userId: user.id, videoId },
      { 
        watchedSeconds, 
        isCompleted, 
        testScore, 
        scorePercentage, 
        testFinished,
        lastWatched: new Date() 
      },
      { upsert: true, new: true }
    );

    return NextResponse.json(progress);
  } catch (error) {
    return NextResponse.json({ error: "Progress saqlashda xatolik" }, { status: 500 });
  }
}
