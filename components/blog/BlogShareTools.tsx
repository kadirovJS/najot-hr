'use client';

import { useState } from 'react';
import { Check, Copy, Share2 } from 'lucide-react';

export default function BlogShareTools() {
  const [copied, setCopied] = useState(false);

  const copyLink = async () => {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="blog-detail-tools">
      <span><Share2 size={16} /> Maqolani ulashish</span>
      <button onClick={copyLink}>
        {copied ? <Check size={16} /> : <Copy size={16} />} {copied ? 'Nusxalandi' : 'Havolani nusxalash'}
      </button>
    </div>
  );
}
