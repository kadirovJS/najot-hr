import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import User from "@/models/User";
import Vacancy from "@/models/Vacancy";
import Progress from "@/models/Progress";
import Video from "@/models/Video";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as { role?: string }).role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 403 });
    }

    await dbConnect();

    const [employees, vacancyCount, videos, progressRecords] = await Promise.all([
      User.find({ role: { $ne: 'SUPER_ADMIN' } }, 'department'),
      Vacancy.countDocuments({ isVisible: true }),
      Video.find({}, '_id departments testQuestions'),
      Progress.find({}, 'userId videoId isCompleted testFinished scorePercentage'),
    ]);

    const progressByUserVideo = new Map(progressRecords.map((record) => [`${record.userId.toString()}:${record.videoId.toString()}`, record]));
    const courseProgress = employees.map((employee) => {
      const assignedVideos = videos.filter((video) => video.departments.includes('All') || video.departments.includes(employee.department));
      const completedSteps = assignedVideos.filter((video) => {
        const record = progressByUserVideo.get(`${employee._id.toString()}:${video._id.toString()}`);
        return record?.isCompleted && (!video.testQuestions?.length || (record.testFinished && record.scorePercentage >= 60));
      });
      return assignedVideos.length ? Math.round((completedSteps.length / assignedVideos.length) * 100) : 0;
    });

    const stats = {
      users: employees.length,
      vacancies: vacancyCount,
      avgOnboarding: courseProgress.length ? Math.round(courseProgress.reduce((sum, value) => sum + value, 0) / courseProgress.length) : 0,
      completedOnboarding: courseProgress.filter((value) => value === 100).length
    };

    return NextResponse.json(stats);
  } catch {
    return NextResponse.json({ error: "Statistika yuklashda xatolik" }, { status: 500 });
  }
}
