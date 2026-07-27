import { createHash, randomUUID } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import Blog from '@/models/Blog';
import BlogView from '@/models/BlogView';

const VIEWER_COOKIE = 'najot_blog_viewer';
const BOT_USER_AGENT = /bot|crawler|spider|crawling|facebookexternalhit|preview/i;

let viewIndexPromise: Promise<string> | undefined;

function ensureViewIndex() {
  viewIndexPromise ??= BlogView.collection.createIndex(
    { blogId: 1, deviceHash: 1 },
    { unique: true, name: 'unique_blog_device_view' },
  );
  return viewIndexPromise;
}

function isDuplicateKeyError(error: unknown) {
  return typeof error === 'object' && error !== null && 'code' in error && error.code === 11000;
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await dbConnect();

    const blog = await Blog.findOne({ _id: id, isVisible: true }).select('viewCount');
    if (!blog) return NextResponse.json({ error: 'Topilmadi' }, { status: 404 });

    if (BOT_USER_AGENT.test(req.headers.get('user-agent') || '')) {
      return NextResponse.json({ viewCount: blog.viewCount || 0, counted: false });
    }

    const existingDeviceId = req.cookies.get(VIEWER_COOKIE)?.value;
    const deviceId = existingDeviceId || randomUUID();
    const deviceHash = createHash('sha256').update(deviceId).digest('hex');
    await ensureViewIndex();

    let counted = false;
    let viewCount = blog.viewCount || 0;

    try {
      const viewResult = await BlogView.updateOne(
        { blogId: blog._id, deviceHash },
        { $setOnInsert: { blogId: blog._id, deviceHash } },
        { upsert: true },
      );

      if (viewResult.upsertedCount === 1) {
        const updatedBlog = await Blog.findByIdAndUpdate(
          blog._id,
          { $inc: { viewCount: 1 } },
          { new: true },
        ).select('viewCount');

        if (!updatedBlog) return NextResponse.json({ error: 'Topilmadi' }, { status: 404 });
        viewCount = updatedBlog.viewCount || 0;
        counted = true;
      }
    } catch (error) {
      // Ikki tab bir vaqtda ochilganda unique index ikkinchi yozuvni rad etadi.
      // Bu holatda post hisoblagichi oshirilmaydi.
      if (!isDuplicateKeyError(error)) throw error;
      const latestBlog = await Blog.findById(blog._id).select('viewCount');
      viewCount = latestBlog?.viewCount || 0;
    }

    const response = NextResponse.json({ viewCount, counted });
    if (!existingDeviceId) {
      response.cookies.set({
        name: VIEWER_COOKIE,
        value: deviceId,
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: 60 * 60 * 24 * 400,
      });
    }

    return response;
  } catch (error) {
    console.error('BLOG VIEW ERROR:', error);
    return NextResponse.json({ error: 'Ko‘rishni qayd etib bo‘lmadi' }, { status: 500 });
  }
}
