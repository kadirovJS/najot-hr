import type { MetadataRoute } from "next";

import Vacancy from "@/models/Vacancy";
import Blog from "@/models/Blog";
import { dbConnect } from "@/lib/db";

const BASE_URL = "https://najottalimjamoasi.uz";

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
    await dbConnect();
    const vacancies = await Vacancy.find({ isVisible: true }).select("_id createdAt");
    const posts = await Blog.find({ isVisible: true }).select("_id createdAt");

    const vacancyRoutes: MetadataRoute.Sitemap = vacancies.map((vacancy) => ({
      url: `${BASE_URL}/vacancies/${vacancy._id}`,
      lastModified: vacancy.createdAt ?? new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    }));

    const blogRoutes: MetadataRoute.Sitemap = posts.map((post) => ({
      url: `${BASE_URL}/blog/${post._id}`,
      lastModified: post.createdAt ?? new Date(),
      changeFrequency: "weekly",
      priority: 0.6,
    }));

    return [...staticRoutes, ...vacancyRoutes, ...blogRoutes];
  } catch {
    return staticRoutes;
  }
}
