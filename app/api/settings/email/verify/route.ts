import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import User from "@/models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });

    const { email, code } = await req.json();
    await dbConnect();

    const userId = (session.user as any).id;
    const user = await User.findById(userId);

    if (user.verificationCode !== code) {
      return NextResponse.json({ error: "Kod noto'g'ri" }, { status: 400 });
    }

    user.email = email;
    user.emailVerified = true;
    user.verificationCode = undefined;
    await user.save();

    return NextResponse.json({ message: "Email tasdiqlandi" });
  } catch (error) {
    return NextResponse.json({ error: "Xatolik" }, { status: 500 });
  }
}
