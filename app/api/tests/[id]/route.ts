import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import Test from "@/models/Test";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const testTypes = ['DISC', 'PAEI'] as const;

const validateQuestion = (input: unknown) => {
  if (!input || typeof input !== 'object') throw new Error('Savol ma’lumotlari noto‘g‘ri');
  const data = input as Record<string, unknown>;
  const question = typeof data.question === 'string' ? data.question.trim() : '';
  const options = Array.isArray(data.options) ? data.options.map((option) => typeof option === 'string' ? option.trim() : '') : [];
  const type = typeof data.type === 'string' && testTypes.includes(data.type as typeof testTypes[number]) ? data.type : '';
  if (!question || options.length < 2 || options.some((option) => !option) || !type) throw new Error('Savol, variantlar va test turini to‘liq kiriting');
  return { question, options, type };
};

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as { role?: string }).role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 403 });
    }

    const { id } = await params;
    await dbConnect();
    const body = validateQuestion(await req.json());
    
    const updatedQuestion = await Test.findByIdAndUpdate(id, body, { new: true });
    
    if (!updatedQuestion) return NextResponse.json({ error: "Topilmadi" }, { status: 404 });
    return NextResponse.json(updatedQuestion);
  } catch (error) {
    console.error("PUT TEST ERROR:", error);
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
    await Test.findByIdAndDelete(id);
    
    return NextResponse.json({ message: "O'chirildi" });
  } catch {
    return NextResponse.json({ error: "O'chirishda xatolik" }, { status: 500 });
  }
}
