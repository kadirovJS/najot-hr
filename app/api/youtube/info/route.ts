import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

function getYoutubeVideoId(value: string) {
  try {
    const url = new URL(value);
    const hostname = url.hostname.replace(/^www\./, '');
    let id = '';

    if (hostname === 'youtu.be') id = url.pathname.split('/').filter(Boolean)[0] || '';
    if (hostname.endsWith('youtube.com')) {
      id = url.searchParams.get('v') || url.pathname.split('/').filter(Boolean).at(-1) || '';
    }

    return /^[A-Za-z0-9_-]{11}$/.test(id) ? id : '';
  } catch {
    return '';
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as { role?: string }).role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 403 });
    }

    const videoUrl = new URL(req.url).searchParams.get('url') || '';
    const videoId = getYoutubeVideoId(videoUrl);
    if (!videoId) {
      return NextResponse.json({ error: "YouTube havolasi noto‘g‘ri" }, { status: 400 });
    }

    const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(`https://www.youtube.com/watch?v=${videoId}`)}&format=json`;
    const response = await fetch(oembedUrl, { cache: 'no-store' });
    if (!response.ok) {
      return NextResponse.json({ error: "YouTube videosi topilmadi yoki ochiq emas" }, { status: 404 });
    }

    const data = await response.json() as { title?: unknown };
    return NextResponse.json({ title: typeof data.title === 'string' ? data.title : '' });
  } catch (error) {
    console.error("YOUTUBE INFO ERROR:", error);
    return NextResponse.json({ error: "YouTube ma’lumotlarini yuklab bo‘lmadi" }, { status: 500 });
  }
}
