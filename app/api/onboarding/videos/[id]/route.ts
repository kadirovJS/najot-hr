import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import Video from "@/models/Video";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { deleteImage, deleteVideo, uploadVideo } from "@/lib/cloudinary";

const allowedDepartments = ['All', 'Support teacher', 'Main teacher', 'Management', 'Sales', 'Boshqaruv', 'Other'];
type SessionUser = { role?: string };
const getErrorMessage = (error: unknown, fallback: string) => error instanceof Error ? error.message : fallback;

function validateVideoUpdate(input: Record<string, unknown>) {
  const title = typeof input.title === 'string' ? input.title.trim() : '';
  const youtubeUrl = typeof input.youtubeUrl === 'string' ? input.youtubeUrl.trim() : '';
  const cloudinaryUrl = typeof input.cloudinaryUrl === 'string' ? input.cloudinaryUrl.trim() : '';
  const coverImageUrl = typeof input.coverImageUrl === 'string' ? input.coverImageUrl.trim() : '';
  const coverImagePublicId = typeof input.coverImagePublicId === 'string' ? input.coverImagePublicId.trim() : '';
  const duration = Number(input.duration);
  const departments = Array.isArray(input.departments) ? input.departments.filter((department): department is string => typeof department === 'string' && allowedDepartments.includes(department)) : [];
  const testQuestions = Array.isArray(input.testQuestions) ? input.testQuestions : [];
  if (!title || (!youtubeUrl && !cloudinaryUrl)) throw new Error('Sarlavha va video manbasi majburiy');
  if (!Number.isFinite(duration) || duration <= 0) throw new Error('Video davomiyligi sekundlarda aniq kiritilishi kerak');
  if (!departments.length) throw new Error('Kamida bitta bo‘limni tanlang');
  if (testQuestions.some((item) => {
    if (!item || typeof item !== 'object') return true;
    const question = item as Record<string, unknown>;
    return typeof question.question !== 'string' || !question.question.trim() || !Array.isArray(question.options) || question.options.length < 2 || question.options.some((option) => typeof option !== 'string' || !option.trim()) || !Number.isInteger(question.correctAnswer) || Number(question.correctAnswer) < 0 || Number(question.correctAnswer) >= question.options.length;
  })) throw new Error('Test savollarini to‘liq va to‘g‘ri kiriting');
  return { ...input, title, youtubeUrl, cloudinaryUrl, coverImageUrl, coverImagePublicId, duration: Math.round(duration), departments, testQuestions };
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as SessionUser).role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 403 });
    }

    const { id } = await params;
    await dbConnect();
    const existingVideo = await Video.findById(id);
    if (!existingVideo) return NextResponse.json({ error: 'Topilmadi' }, { status: 404 });

    const contentType = req.headers.get("content-type") || "";
    let updateData: Record<string, unknown>;

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get('file') as File | null;
      
      const formUpdate: Record<string, unknown> = {
        title: formData.get('title') as string,
        description: formData.get('description') as string,
        departments: JSON.parse(formData.get('departments') as string || '[]'),
        testQuestions: JSON.parse(formData.get('testQuestions') as string || '[]'),
      };

      if (file && file.size > 0) {
        // Eski videoni topish
        // Yangi videoni yuklash
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const fileUri = `data:${file.type};base64,${buffer.toString('base64')}`;
        const cloudinaryRes = await uploadVideo(fileUri);

        // Eski videoni Cloudinary'dan o'chirish
        if (existingVideo.publicId) {
          await deleteVideo(existingVideo.publicId);
        }

        formUpdate.cloudinaryUrl = cloudinaryRes.secure_url;
        formUpdate.publicId = cloudinaryRes.public_id;
        formUpdate.duration = Math.round(cloudinaryRes.duration || 0);
      }
      updateData = validateVideoUpdate({ ...existingVideo.toObject(), ...formUpdate });
    } else {
      updateData = validateVideoUpdate(await req.json());
    }

    const updatedVideo = await Video.findByIdAndUpdate(id, updateData, { new: true });
    
    if (!updatedVideo) return NextResponse.json({ error: "Topilmadi" }, { status: 404 });

    const oldCoverPublicId = existingVideo.coverImagePublicId as string | undefined;
    const newCoverPublicId = updatedVideo.coverImagePublicId as string | undefined;
    if (oldCoverPublicId && oldCoverPublicId !== newCoverPublicId) {
      try {
        await deleteImage(oldCoverPublicId);
      } catch (error) {
        console.error('OLD COVER DELETE ERROR:', error);
      }
    }
    return NextResponse.json(updatedVideo);
  } catch (error: unknown) {
    console.error("PUT VIDEO ERROR:", error);
    return NextResponse.json({ error: getErrorMessage(error, 'Tahrirlashda xatolik') }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as SessionUser).role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 403 });
    }

    const { id } = await params;
    await dbConnect();

    const video = await Video.findById(id);
    if (!video) return NextResponse.json({ error: "Topilmadi" }, { status: 404 });

    if (video.publicId) {
      await deleteVideo(video.publicId);
    }
    if (video.coverImagePublicId) {
      await deleteImage(video.coverImagePublicId);
    }

    await Video.findByIdAndDelete(id);
    return NextResponse.json({ message: "O'chirildi" });
  } catch (error) {
    return NextResponse.json({ error: "O'chirishda xatolik" }, { status: 500 });
  }
}
