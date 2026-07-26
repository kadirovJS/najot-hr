import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import User from "@/models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });

    const { name, phone, image } = await req.json();
    if (image !== undefined && typeof image !== 'string') {
      return NextResponse.json({ error: "Rasm manzili noto‘g‘ri" }, { status: 400 });
    }

    await dbConnect();

    const userId = (session.user as any).id;
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { name, phone, image },
      { new: true }
    ).select('-password');

    if (!updatedUser) return NextResponse.json({ error: 'Foydalanuvchi topilmadi' }, { status: 404 });

    return NextResponse.json(updatedUser);
  } catch (error) {
    return NextResponse.json({ error: "Xatolik" }, { status: 500 });
  }
}
