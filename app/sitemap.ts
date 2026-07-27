import type { MetadataRoute } from "next";

import { getPublicBlogPosts } from "@/lib/queries/blog";
import { getPublicVacancies } from "@/lib/queries/vacancy";
import { BASE_URL } from "@/lib/seo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${BASE_URL}/vacancies`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/skills-check`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/blog`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
  ];

  try {
    const [vacancies, posts] = await Promise.all([
      getPublicVacancies(),
      getPublicBlogPosts(),
    ]);

    const vacancyRoutes: MetadataRoute.Sitemap = vacancies.map((vacancy) => ({
      url: `${BASE_URL}/vacancies/${vacancy._id}`,
      lastModified: vacancy.createdAt,
      changeFrequency: "weekly",
      priority: 0.7,
    }));

    const blogRoutes: MetadataRoute.Sitemap = posts.map((post) => ({
      url: `${BASE_URL}/blog/${post.slug}`,
      lastModified: post.createdAt,
      changeFrequency: "weekly",
      priority: 0.6,
    }));

    return [...staticRoutes, ...vacancyRoutes, ...blogRoutes];
  } catch {
    return staticRoutes;
  }
}
