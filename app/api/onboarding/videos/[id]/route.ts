import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import Video from "@/models/Video";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { deleteVideo, uploadVideo } from "@/lib/cloudinary";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 403 });
    }

    const { id } = await params;
    await dbConnect();

    const contentType = req.headers.get("content-type") || "";
    let updateData: any = {};

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get('file') as File | null;
      
      updateData = {
        title: formData.get('title') as string,
        description: formData.get('description') as string,
        departments: JSON.parse(formData.get('departments') as string || '[]'),
        testQuestions: JSON.parse(formData.get('testQuestions') as string || '[]'),
      };

      if (file && file.size > 0) {
        // Eski videoni topish
        const oldVideo = await Video.findById(id);
        
        // Yangi videoni yuklash
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const fileUri = `data:${file.type};base64,${buffer.toString('base64')}`;
        const cloudinaryRes = await uploadVideo(fileUri);

        // Eski videoni Cloudinary'dan o'chirish
        if (oldVideo?.publicId) {
          await deleteVideo(oldVideo.publicId);
        }

        updateData.cloudinaryUrl = cloudinaryRes.secure_url;
        updateData.publicId = cloudinaryRes.public_id;
        updateData.duration = Math.round(cloudinaryRes.duration || 0);
      }
    } else {
      updateData = await req.json();
    }

    const updatedVideo = await Video.findByIdAndUpdate(id, updateData, { new: true });
    
    if (!updatedVideo) return NextResponse.json({ error: "Topilmadi" }, { status: 404 });
    return NextResponse.json(updatedVideo);
  } catch (error: any) {
    console.error("PUT VIDEO ERROR:", error);
    return NextResponse.json({ error: error.message || "Tahrirlashda xatolik" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 403 });
    }

    const { id } = await params;
    await dbConnect();

    const video = await Video.findById(id);
    if (!video) return NextResponse.json({ error: "Topilmadi" }, { status: 404 });

    if (video.publicId) {
      await deleteVideo(video.publicId);
    }

    await Video.findByIdAndDelete(id);
    return NextResponse.json({ message: "O'chirildi" });
  } catch (error) {
    return NextResponse.json({ error: "O'chirishda xatolik" }, { status: 500 });
  }
}
