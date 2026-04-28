import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import User from "@/models/User";
import Vacancy from "@/models/Vacancy";
import Progress from "@/models/Progress";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 403 });
    }

    await dbConnect();

    const [userCount, vacancyCount, progressStats] = await Promise.all([
      User.countDocuments({ role: { $ne: 'SUPER_ADMIN' } }),
      Vacancy.countDocuments({ isVisible: true }),
      Progress.aggregate([
        {
          $group: {
            _id: null,
            avgScore: { $avg: "$scorePercentage" },
            totalCompleted: { $sum: { $cond: ["$isCompleted", 1, 0] } }
            
          }
        }
      ])
    ]);

    const stats = {
      users: userCount,
      vacancies: vacancyCount,
      avgOnboarding: progressStats[0]?.avgScore ? Math.round(progressStats[0].avgScore) : 0,
      completedOnboarding: progressStats[0]?.totalCompleted || 0
    };

    return NextResponse.json(stats);
  } catch (error) {
    return NextResponse.json({ error: "Statistika yuklashda xatolik" }, { status: 500 });
  }
}
