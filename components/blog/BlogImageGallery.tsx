'use client';

import { useState } from 'react';
import Image from 'next/image';

type BlogImageGalleryProps = {
  images: string[];
  title: string;
};

export default function BlogImageGallery({ images, title }: BlogImageGalleryProps) {
  const [activeImage, setActiveImage] = useState(images[0]);

  if (!activeImage) return null;

  return (
    <section aria-label={`${title} rasmlari`} className="mt-8">
      <div className="relative  h-64 w-full overflow-hidden rounded-2xl bg-gray-50 md:h-96">
        <Image src={activeImage} alt={title} fill priority sizes="(max-width: 768px) 100vw, 768px" className="object-cover" />
      </div>

      {images.length > 1 && (
        <div className=" flex gap-2 p-2 overflow-x-auto pb-1" aria-label="Boshqa rasmlar">
          {images.map((image, index) => {
            const isActive = image === activeImage;
            return (
              <button
                key={image}
                type="button"
                onClick={() => setActiveImage(image)}
                aria-label={`${index + 1}-rasmni ko‘rsatish`}
                aria-pressed={isActive}
                className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${isActive ? 'ring-2 ring-primary ring-offset-2' : 'opacity-70 hover:opacity-100'}`}
              >
                <Image src={image} alt="" fill sizes="64px" className="object-cover" />
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}
