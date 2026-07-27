'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Check, Copy, Eye, Newspaper, Share2 } from 'lucide-react';
import Header from '@/components/layout/Header';
import { blogService } from '@/services/blogService';
import { IBlog } from '@/types/blog';
import { formatBlogDate, formatViewCount } from '@/lib/blog';

export default function BlogDetail() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [post, setPost] = useState<IBlog | null>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    const loadPost = async () => {
      try {
        const loadedPost = await blogService.getPostById(id);
        if (cancelled) return;

        if (loadedPost.slug && loadedPost.slug !== id) {
          router.replace(`/blog/${loadedPost.slug}`);
          return;
        }

        setPost(loadedPost);
        setLoading(false);

        try {
          const view = await blogService.recordBlogView(id);
          if (!cancelled) {
            setPost((current) => current ? { ...current, viewCount: view.viewCount } : current);
          }
        } catch (error) {
          // Maqola ko‘rsatish view analytics ishlamasa ham davom etadi.
          console.error('Blog view could not be recorded:', error);
        }
      } catch {
        if (!cancelled) {
          setFailed(true);
          setLoading(false);
        }
      }
    };

    void loadPost();
    return () => { cancelled = true; };
  }, [id, router]);

  const copyLink = async () => {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2500);
  };

  if (loading) {
    return (
      <div className="bg-white min-h-screen">
        <Header />
        <main className="pt-40 site-container max-w-3xl">
          <div className="h-6 w-40 bg-gray-100 rounded animate-pulse mb-8" />
          <div className="h-10 w-3/4 bg-gray-100 rounded animate-pulse mb-6" />
          <div className="h-80 w-full bg-gray-100 rounded-2xl animate-pulse mb-8" />
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => <div key={i} className="h-4 w-full bg-gray-100 rounded animate-pulse" />)}
          </div>
        </main>
      </div>
    );
  }

  if (failed || !post) {
    return (
      <div className="bg-white min-h-screen">
        <Header />
        <main className="pt-40 pb-24 site-container max-w-2xl text-center">
          <Newspaper className="h-10 w-10 text-gray-300 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-dark mb-2">Post topilmadi</h1>
          <p className="text-gray-500 mb-6">Bu maqola yopilgan yoki manzil noto‘g‘ri bo‘lishi mumkin.</p>
          <Link href="/blog" className="button button-primary inline-flex items-center gap-2"><ArrowLeft size={18} /> Barcha maqolalar</Link>
        </main>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      <Header />
      <main className="pt-32 pb-24">
        <div className="site-container max-w-3xl">
          <Link href="/blog" className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-primary transition-colors mb-8">
            <ArrowLeft size={16} /> Barcha maqolalar
          </Link>

          <div className="blog-detail-tools">
            <span><Share2 size={16} /> Maqolani ulashish</span>
            <button onClick={copyLink}>
              {copied ? <Check size={16} /> : <Copy size={16} />} {copied ? 'Nusxalandi' : 'Havolani nusxalash'}
            </button>
          </div>
          <h1 className="mt-6 text-3xl md:text-5xl font-bold text-dark tracking-tight leading-tight">{post.title}</h1>

          <div className="relative w-full h-64 md:h-96 rounded-2xl overflow-hidden mt-8 bg-gray-50">
            <Image src={post.coverImage} alt={post.title} fill className="object-cover" priority />
          </div>

          <article className="mt-10 text-gray-700 text-lg leading-relaxed whitespace-pre-line">
            {post.content}
          </article>

          <div className="blog-detail-stats">
            <span>{formatBlogDate(post.createdAt)}</span>
            <span><Eye size={16} /> {formatViewCount(post.viewCount)} marta o‘qilgan</span>
          </div>
        </div>
      </main>
      <footer className="vacancies-footer"><div className="site-container"><span>© 2026 Najot Ta’lim HR</span><Link href="/">Bosh sahifa</Link><Link href="/blog">Blog</Link></div></footer>
    </div>
  );
}
