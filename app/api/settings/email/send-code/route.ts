import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import User from "@/models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sendVerificationCode } from "@/lib/mail";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });

    const { email } = await req.json();
    if (!email) return NextResponse.json({ error: "Email kiritilmadi" }, { status: 400 });

    const code = Math.floor(1000 + Math.random() * 9000).toString();
    
    await dbConnect();
    const userId = (session.user as any).id;
    await User.findByIdAndUpdate(userId, { verificationCode: code });

    await sendVerificationCode(email, code);

    return NextResponse.json({ message: "Kod yuborildi" });
  } catch (error) {
    console.error("MAIL ERROR:", error);
    return NextResponse.json({ error: "Xabar yuborishda xatolik" }, { status: 500 });
  }
}
