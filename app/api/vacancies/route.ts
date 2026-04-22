import { NextResponse } from "next/server";

import Vacancy from "@/models/Vacancy";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { dbConnect } from "@/lib/db";

export async function GET(req: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const isAdmin = searchParams.get("admin") === "true";
    
    // Agar admin bo'lmasa, faqat ko'rinadigan vakansiyalarni chiqaramiz
    const query = isAdmin ? {} : { isVisible: true };
    
    const vacancies = await Vacancy.find(query).sort({ createdAt: -1 });
    return NextResponse.json(vacancies);
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
    const vacancy = await Vacancy.create(body);

    return NextResponse.json(vacancy, { status: 201 });
  } catch (error) {
    console.error("POST VACANCY ERROR:", error);
    return NextResponse.json({ error: "Vakansiya yaratishda xatolik" }, { status: 500 });
  }
}
