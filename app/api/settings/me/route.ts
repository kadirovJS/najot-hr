import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import User from "@/models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });

    await dbConnect();
    const user = await User.findById((session.user as any).id).select("-password");
    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json({ error: "Xatolik" }, { status: 500 });
  }
}
