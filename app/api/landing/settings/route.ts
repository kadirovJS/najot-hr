import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { dbConnect } from "@/lib/db";
import LandingSetting from "@/models/LandingSetting";
import { DEFAULT_SHOWCASE, type ShowcaseSettings } from "@/lib/landing";

interface HeroSlide {
  title: string;
  description: string;
  image: string;
}

function normalizeShowcase(value: unknown): ShowcaseSettings {
  if (!value || typeof value !== 'object') {
    throw new Error("Showcase ma'lumotlari yuborilmadi");
  }

  const showcase = value as Partial<ShowcaseSettings>;
  const requiredTextFields: Array<keyof Omit<ShowcaseSettings, 'metrics'>> = [
    'eyebrow',
    'title',
    'description',
    'primaryCtaLabel',
    'primaryCtaHref',
    'secondaryCtaLabel',
    'secondaryCtaHref',
  ];

  const normalized = { ...DEFAULT_SHOWCASE } as ShowcaseSettings;
  for (const field of requiredTextFields) {
    const text = showcase[field];
    if (typeof text !== 'string' || !text.trim()) {
      throw new Error(`Showcase uchun ${field} majburiy`);
    }
    normalized[field] = text.trim();
  }

  if (!Array.isArray(showcase.metrics) || showcase.metrics.length === 0 || showcase.metrics.length > 4) {
    throw new Error("Showcase 1 tadan 4 tagacha ko‘rsatkichni qabul qiladi");
  }

  normalized.metrics = showcase.metrics.map((metric) => {
    if (!metric || typeof metric.value !== 'string' || typeof metric.label !== 'string' || !metric.value.trim() || !metric.label.trim()) {
      throw new Error("Har bir ko‘rsatkichda qiymat va nom bo‘lishi kerak");
    }
    return { value: metric.value.trim(), label: metric.label.trim() };
  });

  return normalized;
}

function normalizeHeroSlides(value: unknown): HeroSlide[] {
  if (!Array.isArray(value) || value.length === 0 || value.length > 5) {
    throw new Error("Hero uchun 1 tadan 5 tagacha slayd bo‘lishi kerak");
  }

  return value.map((slide) => {
    if (!slide || typeof slide !== 'object') {
      throw new Error("Hero slayd ma'lumotlari noto‘g‘ri");
    }
    const { title, description, image } = slide as Partial<HeroSlide>;
    if (typeof title !== 'string' || typeof description !== 'string' || typeof image !== 'string' || !title.trim() || !description.trim() || !image.trim()) {
      throw new Error("Hero slaydida sarlavha, tavsif va rasm majburiy");
    }
    return { title: title.trim(), description: description.trim(), image: image.trim() };
  });
}

export async function GET() {
  try {
    await dbConnect();
    let settings = await LandingSetting.findOne();
    
    if (!settings) {
      settings = await LandingSetting.create({ showcase: DEFAULT_SHOWCASE });
    } else if (!settings.showcase?.title) {
      settings.showcase = DEFAULT_SHOWCASE;
      await settings.save();
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error("GET LANDING SETTINGS ERROR:", error);
    return NextResponse.json({ error: "Sozlamalarni yuklashda xatolik" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 403 });
    }

    await dbConnect();
    const body = await req.json();
    const update: { showcase?: ShowcaseSettings; heroSlides?: HeroSlide[] } = {};
    if (body.showcase !== undefined) update.showcase = normalizeShowcase(body.showcase);
    if (body.heroSlides !== undefined) update.heroSlides = normalizeHeroSlides(body.heroSlides);
    if (Object.keys(update).length === 0) {
      return NextResponse.json({ error: "Yangilanadigan sozlama yuborilmadi" }, { status: 400 });
    }
    
    const settings = await LandingSetting.findOneAndUpdate(
      {}, 
      { $set: update },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    return NextResponse.json(settings);
  } catch (error: any) {
    console.error("PUT LANDING SETTINGS ERROR:", error);
    return NextResponse.json({ error: error.message || "Sozlamalarni yangilashda xatolik" }, { status: 500 });
  }
}
