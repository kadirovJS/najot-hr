import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { dbConnect } from "@/lib/db";
import TeamMember from "@/models/TeamMember";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 403 });
    }

    await dbConnect();
    const body = await req.json();
    const member = await TeamMember.findByIdAndUpdate(id, body, { new: true });

    if (!member) {
      return NextResponse.json({ error: "Topilmadi" }, { status: 404 });
    }

    return NextResponse.json(member);
  } catch (error) {
    console.error("PUT TEAM MEMBER ERROR:", error);
    return NextResponse.json({ error: "Yangilashda xatolik" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 403 });
    }

    await dbConnect();
    const member = await TeamMember.findByIdAndDelete(id);

    if (!member) {
      return NextResponse.json({ error: "Topilmadi" }, { status: 404 });
    }

    return NextResponse.json({ message: "O'chirildi" });
  } catch (error) {
    console.error("DELETE TEAM MEMBER ERROR:", error);
    return NextResponse.json({ error: "O'chirishda xatolik" }, { status: 500 });
  }
}
