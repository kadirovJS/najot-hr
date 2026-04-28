import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import User from "@/models/User";
import Video from "@/models/Video";
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

    // 1. Umumiy foydalanuvchilar o'sishi (O'tgan oy vs Bu oy)
    const now = new Date();
    const firstDayThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const usersThisMonth = await User.countDocuments({ 
      role: 'TEACHER', 
      createdAt: { $gte: firstDayThisMonth } 
    });
    const usersLastMonth = await User.countDocuments({ 
      role: 'TEACHER', 
      createdAt: { $gte: firstDayLastMonth, $lt: firstDayThisMonth } 
    });

    // 2. Videolarni ko'rish statistikasi
    const videos = await Video.find({}, '_id departments title');
    const totalVideosCount = videos.length;

    const progressData = await Progress.find();
    
    // 3. Test statistikasi
    const testStats = await Progress.aggregate([
      { $match: { testFinished: true } },
      {
        $group: {
          _id: null,
          avgScore: { $avg: "$scorePercentage" },
          totalAttempts: { $sum: "$testAttempts" },
          totalTestsFinished: { $count: {} }
        }
      }
    ]);

    // 4. Har bir foydalanuvchi bo'yicha progress
    const teachers = await User.find({ role: 'TEACHER' }, 'name department createdAt');
    const userProgress = teachers.map(teacher => {
      const teacherProgress = progressData.filter(p => p.userId.toString() === teacher._id.toString());
      
      // Ustozga tegishli videolarni hisoblash
      const assignedVideos = videos.filter(v => 
        v.departments.includes('All') || v.departments.includes(teacher.department)
      );
      
      const completedCount = teacherProgress.filter(p => p.isCompleted).length;
      const progressPercent = assignedVideos.length > 0 
        ? Math.round((completedCount / assignedVideos.length) * 100) 
        : 0;

      const avgTestScore = teacherProgress.filter(p => p.testFinished).length > 0
        ? Math.round(teacherProgress.reduce((acc, curr) => acc + (curr.scorePercentage || 0), 0) / teacherProgress.filter(p => p.testFinished).length)
        : 0;

      return {
        _id: teacher._id,
        name: teacher.name,
        department: teacher.department,
        progress: progressPercent,
        avgScore: avgTestScore,
        joinedAt: teacher.createdAt
      };
    });

    return NextResponse.json({
      overview: {
        usersThisMonth,
        usersLastMonth,
        totalTeachers: teachers.length,
        avgTestScore: testStats[0]?.avgScore || 0,
        totalAttempts: testStats[0]?.totalAttempts || 0,
        avgAttemptsPerTest: testStats[0] ? (testStats[0].totalAttempts / testStats[0].totalTestsFinished).toFixed(1) : 0
      },
      userProgress: userProgress.sort((a, b) => b.progress - a.progress)
    });
  } catch (error) {
    console.error("STATS ERROR:", error);
    return NextResponse.json({ error: "Xatolik" }, { status: 500 });
  }
}
