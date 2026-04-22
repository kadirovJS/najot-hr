import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import Test from "@/models/Test";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type"); // DISC yoki PAEI
    
    const query = type ? { type } : {};
    const questions = await Test.find(query).sort({ createdAt: -1 });
    
    return NextResponse.json(questions);
  } catch (error) {
    return NextResponse.json({ error: "Xatolik yuz berdi" }, { status: 500 });
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
    const question = await Test.create(body);

    return NextResponse.json(question, { status: 201 });
  } catch (error) {
    console.error("POST TEST ERROR:", error);
    return NextResponse.json({ error: "Savol yaratishda xatolik" }, { status: 500 });
  }
}
