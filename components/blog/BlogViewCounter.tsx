'use client';

import { useEffect, useState } from 'react';
import { Eye } from 'lucide-react';
import { blogService } from '@/services/blogService';
import { formatViewCount } from '@/lib/blog';

export default function BlogViewCounter({ blogId, initialViewCount }: { blogId: string; initialViewCount: number }) {
  const [viewCount, setViewCount] = useState(initialViewCount);

  useEffect(() => {
    let cancelled = false;
    blogService.recordBlogView(blogId)
      .then((result) => { if (!cancelled) setViewCount(result.viewCount); })
      .catch((error) => console.error('Blog view could not be recorded:', error));
    return () => { cancelled = true; };
  }, [blogId]);

  return <span><Eye size={16} /> {formatViewCount(viewCount)} marta o‘qilgan</span>;
}
