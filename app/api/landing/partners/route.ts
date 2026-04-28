import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { dbConnect } from "@/lib/db";
import Partner from "@/models/Partner";

export async function GET() {
  try {
    await dbConnect();
    const partners = await Partner.find().sort({ order: 1, createdAt: -1 });
    return NextResponse.json(partners);
  } catch (error) {
    console.error("GET PARTNERS ERROR:", error);
    return NextResponse.json({ error: "Hamkorlarni yuklashda xatolik" }, { status: 500 });
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
    const partner = await Partner.create(body);

    return NextResponse.json(partner, { status: 201 });
  } catch (error) {
    console.error("POST PARTNER ERROR:", error);
    return NextResponse.json({ error: "Hamkor qo'shishda xatolik" }, { status: 500 });
  }
}
