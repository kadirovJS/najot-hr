import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import Vacancy from "@/models/Vacancy";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { normalizeBitrixFormUrl } from '@/lib/bitrix';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await dbConnect();
    const vacancy = await Vacancy.findById(id);
    if (!vacancy) return NextResponse.json({ error: "Topilmadi" }, { status: 404 });
    return NextResponse.json(vacancy);
  } catch {
    return NextResponse.json({ error: "Xatolik yuz berdi" }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as { role?: string }).role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 403 });
    }

    const { id } = await params;
    await dbConnect();
    const body = await req.json() as Record<string, unknown>;
    if (Object.hasOwn(body, 'bitrixFormUrl')) {
      body.bitrixFormUrl = normalizeBitrixFormUrl(body.bitrixFormUrl, true);
    }
    
    const updatedVacancy = await Vacancy.findByIdAndUpdate(id, body, { new: true });
    
    if (!updatedVacancy) return NextResponse.json({ error: "Topilmadi" }, { status: 404 });
    return NextResponse.json(updatedVacancy);
  } catch {
    return NextResponse.json({ error: "Tahrirlashda xatolik" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as { role?: string }).role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 403 });
    }

    const { id } = await params;
    await dbConnect();
    await Vacancy.findByIdAndDelete(id);
    
    return NextResponse.json({ message: "O'chirildi" });
  } catch {
    return NextResponse.json({ error: "O'chirishda xatolik" }, { status: 500 });
  }
}
