import { getSiteUrl } from "@/lib/config/env";

export default function sitemap() {
  const base = getSiteUrl();

  return [
    {
      url: `${base}/`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 1,
    },
  ];
}
