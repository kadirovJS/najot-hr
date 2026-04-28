import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { dbConnect } from "@/lib/db";
import Partner from "@/models/Partner";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const id =  (await params).id
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 403 });
    }

    await dbConnect();
    const body = await req.json();
    const partner = await Partner.findByIdAndUpdate(id, body, { new: true });

    if (!partner) {
      return NextResponse.json({ error: "Topilmadi" }, { status: 404 });
    }

    return NextResponse.json(partner);
  } catch (error) {
    console.error("PUT PARTNER ERROR:", error);
    return NextResponse.json({ error: "Yangilashda xatolik" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
   const id =  (await params).id
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 403 });
    }

    await dbConnect();
    const partner = await Partner.findByIdAndDelete(id);

    if (!partner) {
      return NextResponse.json({ error: "Topilmadi" }, { status: 404 });
    }

    return NextResponse.json({ message: "O'chirildi" });
  } catch (error) {
    console.error("DELETE PARTNER ERROR:", error);
    return NextResponse.json({ error: "O'chirishda xatolik" }, { status: 500 });
  }
}
