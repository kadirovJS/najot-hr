'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, Eye } from 'lucide-react';
import { useEffect, useState } from 'react';
import { formatBlogDate, formatViewCount } from '@/lib/blog';
import type { IBlog } from '@/types/blog';

export default function FeaturedBlogs() {
  const [posts, setPosts] = useState<IBlog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    fetch('/api/blog?main=true', { cache: 'no-store', signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error('Main blog posts request failed');
        return response.json() as Promise<IBlog[]>;
      })
      .then((data) => setPosts(data))
      .catch((error: unknown) => {
        if (!(error instanceof DOMException && error.name === 'AbortError')) {
          console.error('Main blog posts could not be loaded:', error);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, []);

  if (loading || posts.length === 0) return null;

  return (
    <section id="blog" className="featured-blogs">
      <div className="site-container">
        <div data-reveal className="featured-blogs-heading">
          <div>
            <span className="eyebrow">Hikoyalarimiz</span>
            <h2>Jamoamizdan yangi hikoyalar.</h2>
          </div>
          <Link href="/blog" className="featured-blogs-all">To‘liq ko‘rish <ArrowUpRight size={18} /></Link>
        </div>

        <div data-stagger className="featured-blogs-grid">
          {posts.map((post, index) => (
            <Link href={`/blog/${post.slug}`} key={post._id} className={`featured-blog-card featured-blog-card-${index + 1}`}>
              <div className="featured-blog-image">
                <Image src={post.coverImage} alt={post.title} fill sizes="(max-width: 760px) 100vw, (max-width: 1100px) 50vw, 33vw" className="object-cover" />
              </div>
              <div className="featured-blog-copy">
                <div className="featured-blog-meta"><span>{formatBlogDate(post.createdAt)}</span><span><Eye size={14} /> {formatViewCount(post.viewCount)}</span></div>
                <h3>{post.title}</h3>
                <p>{post.excerpt}</p>
                <span className="featured-blog-link">Maqolani o‘qish <ArrowUpRight size={17} /></span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
