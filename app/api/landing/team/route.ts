import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { dbConnect } from "@/lib/db";
import TeamMember from "@/models/TeamMember";

export async function GET() {
  try {
    await dbConnect();
    const members = await TeamMember.find().sort({ order: 1 });
    return NextResponse.json(members);
  } catch (error) {
    console.error("GET TEAM MEMBERS ERROR:", error);
    return NextResponse.json({ error: "Jamoa a'zolarini yuklashda xatolik" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 403 });
    }

    await dbConnect();
    const body = await req.json();
    const member = await TeamMember.create(body);
    
    return NextResponse.json(member, { status: 201 });
  } catch (error) {
    console.error("POST TEAM MEMBER ERROR:", error);
    return NextResponse.json({ error: "Jamoa a'zosini qo'shishda xatolik" }, { status: 500 });
  }
}
