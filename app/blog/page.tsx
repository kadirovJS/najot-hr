'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Eye, Newspaper, RefreshCw } from 'lucide-react';
import Header from '@/components/layout/Header';
import { blogService } from '@/services/blogService';
import { IBlog } from '@/types/blog';
import { formatBlogDate, formatViewCount } from '@/lib/blog';

function BlogSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
      {[1, 2, 3].map((item) => (
        <div key={item} className="rounded-2xl overflow-hidden border border-gray-100 bg-white">
          <div className="h-48 bg-gray-100 animate-pulse" />
          <div className="p-6 space-y-3">
            <div className="h-4 w-1/3 bg-gray-100 rounded animate-pulse" />
            <div className="h-6 w-full bg-gray-100 rounded animate-pulse" />
            <div className="h-4 w-3/4 bg-gray-100 rounded animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function BlogPage() {
  const [posts, setPosts] = useState<IBlog[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  const loadPosts = async () => {
    setLoading(true);
    setFailed(false);
    try {
      setPosts(await blogService.getPosts());
    } catch {
      setFailed(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  return (
    <div className="bg-white min-h-screen">
      <Header />
      <main className="blog-index">
        <div className="site-container">
          <div className="blog-index-heading">
            <div>
              <span className="eyebrow"><Newspaper size={15} /> Blog</span>
              <h1>Jamoamizdan<br /><em>yangi hikoyalar.</em></h1>
            </div>
            <p>Najot Ta’lim jamoasi, ta’lim va HR sohasidagi tajriba hamda yangiliklar bilan tanishing.</p>
          </div>

          {loading ? (
            <BlogSkeleton />
          ) : failed ? (
            <div className="min-h-[300px] flex flex-col items-center justify-center text-center border border-dashed border-gray-200 rounded-2xl py-16 px-6">
              <Newspaper className="h-10 w-10 text-gray-300 mb-4" />
              <h3 className="text-xl font-bold text-dark mb-2">Postlarni yuklab bo‘lmadi</h3>
              <p className="text-gray-500 mb-6">Internet aloqasini tekshirib, yana urinib ko‘ring.</p>
              <button onClick={loadPosts} className="button button-primary inline-flex items-center gap-2"><RefreshCw size={16} /> Qayta urinish</button>
            </div>
          ) : posts.length > 0 ? (
            <div className="blog-card-grid">
              {posts.map((post) => (
                <Link href={`/blog/${post.slug}`} key={post._id} className="blog-card">
                  <div className="blog-card-image">
                    <Image src={post.coverImage} alt={post.title} fill sizes="(max-width: 760px) 100vw, (max-width: 1100px) 50vw, 40vw" className="object-cover" />
                  </div>
                  <div className="blog-card-copy">
                    <div className="blog-card-meta"><span>{formatBlogDate(post.createdAt)}</span><span><Eye size={14} /> {formatViewCount(post.viewCount)}</span></div>
                    <h3>{post.title}</h3>
                    <p>{post.excerpt}</p>
                    <span className="blog-card-link">
                      Batafsil <ArrowRight size={16} />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="blog-empty-state">
              <Image src="/no-bg-icon-nt.png" alt="" width={88} height={88} className="blog-empty-icon" />
              <h3>Hozircha hikoyalar mavjud emas</h3>
              <p>Tez orada bu yerda yangi hikoyalar paydo bo‘ladi.</p>
              <Link href="/" className="blog-empty-link">Asosiy sahifaga qaytish</Link>
            </div>
          )}
        </div>
      </main>
      <footer className="vacancies-footer"><div className="site-container"><span>© 2026 Najot Ta’lim HR</span><Link href="/">Bosh sahifa</Link><Link href="/vacancies">Vakansiyalar</Link></div></footer>
    </div>
  );
}
