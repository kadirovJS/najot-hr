import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const videoUrl = searchParams.get('url');

    if (!videoUrl) {
      return NextResponse.json({ error: "URL berilmadi" }, { status: 400 });
    }

    const res = await fetch(videoUrl);
    const html = await res.text();

    // YouTube uses ISO 8601 duration format in its meta tags: "PT5M30S"
    const durationMatch = html.match(/"approxDurationMs":"(\d+)"/);
    let durationSeconds = 0;

    if (durationMatch && durationMatch[1]) {
      durationSeconds = Math.floor(parseInt(durationMatch[1]) / 1000);
    } else {
      // Fallback to searching for "lengthSeconds"
      const lengthMatch = html.match(/"lengthSeconds":"(\d+)"/);
      if (lengthMatch && lengthMatch[1]) {
        durationSeconds = parseInt(lengthMatch[1]);
      }
    }

    // Get title if possible from meta tags
    const titleMatch = html.match(/<title>(.*?) - YouTube<\/title>/) || html.match(/<meta name="title" content="(.*?)">/);
    const title = titleMatch ? titleMatch[1] : "";

    return NextResponse.json({ 
      duration: durationSeconds,
      title: title
    });
  } catch (error) {
    console.error("YOUTUBE INFO ERROR:", error);
    return NextResponse.json({ error: "Xatolik yuz berdi" }, { status: 500 });
  }
}
