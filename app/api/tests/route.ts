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

export async function GET(req: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type"); // DISC yoki PAEI
    
    const query = type ? { type } : {};
    const questions = await Test.find(query).select('-correctAnswer').sort({ createdAt: -1 });
    
    return NextResponse.json(questions);
  } catch {
    return NextResponse.json({ error: "Xatolik yuz berdi" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as { role?: string }).role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 403 });
    }

    await dbConnect();
    const question = await Test.create(validateQuestion(await req.json()));

    return NextResponse.json(question, { status: 201 });
  } catch (error) {
    console.error("POST TEST ERROR:", error);
    return NextResponse.json({ error: "Savol yaratishda xatolik" }, { status: 500 });
  }
}
