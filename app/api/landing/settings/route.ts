import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { dbConnect } from "@/lib/db";
import LandingSetting from "@/models/LandingSetting";

export async function GET() {
  try {
    await dbConnect();
    let settings = await LandingSetting.findOne();
    
    if (!settings) {
      settings = await LandingSetting.create({
        heroSlides: [
          {
            title: "Najot Ta'lim — zamonaviy kasblar markazi",
            description: "Dasturlash, dizayn va marketing kabi zamonaviy kasblarni biz bilan o'rganing.",
            image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2070&auto=format&fit=crop"
          },
          {
            title: "Hayotni yaxshilovchi ta'lim",
            description: "Zamonaviy kasblar yordamida insonlar hayotini yaxshilovchi va kelajakka bo'lgan ishonchni mustahkamlovchi maskan.",
            image: "https://images.unsplash.com/photo-1524178232363-1fb28f74b671?q=80&w=2070&auto=format&fit=crop"
          },
          {
            title: "Katta jamoa, buyuk maqsadlar",
            description: "2500 dan ortiq o'quvchilar va 350 dan ortiq katta jamoani birlashtirgan ta'lim va innovatsiya markazi.",
            image: "https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=2070&auto=format&fit=crop"
          }
        ]
      });
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
    
    const settings = await LandingSetting.findOneAndUpdate(
      {}, 
      { $set: body }, 
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    return NextResponse.json(settings);
  } catch (error: any) {
    console.error("PUT LANDING SETTINGS ERROR:", error);
    return NextResponse.json({ error: error.message || "Sozlamalarni yangilashda xatolik" }, { status: 500 });
  }
}
