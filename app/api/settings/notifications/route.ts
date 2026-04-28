import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import User from "@/models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });

    const { browser, email } = await req.json();
    await dbConnect();

    const userId = (session.user as any).id;
    const user = await User.findById(userId);

    if (email && !user.emailVerified) {
      return NextResponse.json({ error: "Email tasdiqlanmagan" }, { status: 400 });
    }

    user.notificationSettings = { browser, email };
    await user.save();

    return NextResponse.json(user.notificationSettings);
  } catch (error) {
    return NextResponse.json({ error: "Xatolik" }, { status: 500 });
  }
}
