import { isValidObjectId } from 'mongoose';
import Blog from '@/models/Blog';

export function toBlogSlug(title: string) {
  const normalized = title
    .toLocaleLowerCase('uz-UZ')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[ʻ’‘'`]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return normalized || 'blog';
}

export async function createUniqueBlogSlug(title: string, excludeId?: string) {
  const base = toBlogSlug(title);
  let suffix = 0;

  while (suffix < 1000) {
    const slug = suffix === 0 ? base : `${base}-${suffix + 1}`;
    const query = excludeId ? { slug, _id: { $ne: excludeId } } : { slug };
    const exists = await Blog.exists(query);
    if (!exists) return slug;
    suffix += 1;
  }

  return `${base}-${Date.now()}`;
}

export function blogIdentifierQuery(identifier: string) {
  const decodedIdentifier = decodeURIComponent(identifier);

  return isValidObjectId(decodedIdentifier)
    ? { $or: [{ slug: decodedIdentifier }, { _id: decodedIdentifier }] }
    : { slug: decodedIdentifier };
}
