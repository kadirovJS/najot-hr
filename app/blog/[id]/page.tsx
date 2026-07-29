import { cache } from 'react';
import type { Metadata } from 'next';
import { notFound, permanentRedirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import Header from '@/components/layout/Header';
import BlogShareTools from '@/components/blog/BlogShareTools';
import BlogViewCounter from '@/components/blog/BlogViewCounter';
import BlogImageGallery from '@/components/blog/BlogImageGallery';
import { getPublicBlogPostByIdentifier } from '@/lib/queries/blog';
import { formatBlogDate } from '@/lib/blog';
import { BASE_URL, JsonLd, blogPostingJsonLd, breadcrumbJsonLd } from '@/lib/seo';

export const revalidate = 60;

type Params = { id: string };

const loadPost = cache((id: string) => getPublicBlogPostByIdentifier(id));

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { id } = await params;
  const post = await loadPost(id);
  if (!post) return {};

  const url = `${BASE_URL}/blog/${post.slug}`;
  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url,
      type: 'article',
      publishedTime: post.createdAt,
      images: [{ url: post.coverImage }],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
      images: [post.coverImage],
    },
  };
}

export default async function BlogDetail({ params }: { params: Promise<Params> }) {
  const { id } = await params;
  const post = await loadPost(id);

  if (!post) notFound();
  if (post.slug && post.slug !== id) permanentRedirect(`/blog/${post.slug}`);

  return (
    <div className="bg-white min-h-screen">
      <Header />
      <JsonLd data={blogPostingJsonLd(post)} />
      <JsonLd data={breadcrumbJsonLd([
        { name: 'Bosh sahifa', path: '/' },
        { name: 'Blog', path: '/blog' },
        { name: post.title, path: `/blog/${post.slug}` },
      ])} />
      <main className="pt-32 pb-24">
        <div className="site-container max-w-3xl">
          <Link href="/blog" className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-primary transition-colors mb-8">
            <ArrowLeft size={16} /> Barcha maqolalar
          </Link>

          <BlogShareTools />
          <h1 className="mt-6 text-3xl md:text-5xl font-bold text-dark tracking-tight leading-tight">{post.title}</h1>

          <BlogImageGallery images={post.images?.length ? post.images : [post.coverImage]} title={post.title} />

          <article className="mt-10 text-gray-700 text-lg leading-relaxed whitespace-pre-line">
            {post.content}
          </article>

          <div className="blog-detail-stats">
            <span>{formatBlogDate(post.createdAt)}</span>
            <BlogViewCounter blogId={post._id} initialViewCount={post.viewCount} />
          </div>
        </div>
      </main>
      <footer className="vacancies-footer"><div className="site-container"><span>© 2026 Najot Ta’lim HR</span><Link href="/">Bosh sahifa</Link><Link href="/blog">Blog</Link></div></footer>
    </div>
  );
}
