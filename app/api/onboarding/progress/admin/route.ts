import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { dbConnect } from '@/lib/db';
import Progress from '@/models/Progress';
import User from '@/models/User';
import Video from '@/models/Video';

type VideoRecord = {
  _id: { toString(): string };
  departments: string[];
  testQuestions?: unknown[];
};
type ProgressRecord = {
  userId: { toString(): string };
  videoId: { toString(): string };
  isCompleted: boolean;
  testFinished: boolean;
  scorePercentage: number;
  watchedSeconds: number;
  testAttempts: number;
  lastWatched?: Date;
};

const isAssigned = (video: VideoRecord, department: string) =>
  video.departments.includes('All') || video.departments.includes(department);

const isCourseStepComplete = (video: VideoRecord, progress?: ProgressRecord) =>
  Boolean(progress?.isCompleted && (!video.testQuestions?.length || (progress.testFinished && progress.scorePercentage >= 60)));

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if ((session?.user as { role?: string } | undefined)?.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: "Ruxsat yo‘q" }, { status: 403 });
    }

    await dbConnect();
    const [videos, employees, records] = await Promise.all([
      Video.find({}, '_id title duration departments testQuestions').lean<VideoRecord[]>(),
      User.find({ role: { $ne: 'SUPER_ADMIN' } }, 'name department image role').lean<{ _id: { toString(): string }; name: string; department: string; image?: string; role: string }[]>(),
      Progress.find({}, 'userId videoId isCompleted testFinished scorePercentage watchedSeconds testAttempts lastWatched').lean<ProgressRecord[]>(),
    ]);

    const byUserAndVideo = new Map(records.map((record) => [`${record.userId.toString()}:${record.videoId.toString()}`, record]));
    const learners = employees.map((employee) => {
      const assignedVideos = videos.filter((video) => isAssigned(video, employee.department));
      const completedSteps = assignedVideos.filter((video) => isCourseStepComplete(video, byUserAndVideo.get(`${employee._id.toString()}:${video._id.toString()}`)));
      const watchedSteps = assignedVideos.filter((video) => byUserAndVideo.get(`${employee._id.toString()}:${video._id.toString()}`)?.isCompleted);
      const testRecords = assignedVideos
        .map((video) => byUserAndVideo.get(`${employee._id.toString()}:${video._id.toString()}`))
        .filter((record): record is ProgressRecord => Boolean(record?.testFinished));
      const lastActivity = assignedVideos
        .map((video) => byUserAndVideo.get(`${employee._id.toString()}:${video._id.toString()}`)?.lastWatched)
        .filter((date): date is Date => Boolean(date))
        .sort((a, b) => b.getTime() - a.getTime())[0];

      return {
        _id: employee._id.toString(),
        name: employee.name,
        department: employee.department,
        image: employee.image || null,
        role: employee.role,
        assignedVideos: assignedVideos.length,
        watchedVideos: watchedSteps.length,
        completedVideos: completedSteps.length,
        courseProgress: assignedVideos.length ? Math.round((completedSteps.length / assignedVideos.length) * 100) : 0,
        avgTestScore: testRecords.length ? Math.round(testRecords.reduce((sum, record) => sum + record.scorePercentage, 0) / testRecords.length) : null,
        testAttempts: testRecords.reduce((sum, record) => sum + (record.testAttempts || 0), 0),
        lastActivity: lastActivity || null,
      };
    });

    const totalEmployees = learners.length;
    return NextResponse.json({
      summary: {
        totalEmployees,
        averageCourseProgress: totalEmployees ? Math.round(learners.reduce((sum, learner) => sum + learner.courseProgress, 0) / totalEmployees) : 0,
        completedCourses: learners.filter((learner) => learner.assignedVideos > 0 && learner.courseProgress === 100).length,
      },
      learners: learners.sort((a, b) => b.courseProgress - a.courseProgress || a.name.localeCompare(b.name)),
    });
  } catch {
    return NextResponse.json({ error: 'Onboarding statistikasi yuklanmadi' }, { status: 500 });
  }
}
