import type { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  // Anything that isn't the live production deploy (uthbus.com) should be
  // completely invisible to crawlers — dev.uthbus.com, preview URLs, etc.
  if (process.env.VERCEL_ENV && process.env.VERCEL_ENV !== "production") {
    return {
      rules: [{ userAgent: "*", disallow: "/" }],
    }
  }

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/operator/",
          "/user/",
          "/booking/",
          "/profile/",
          "/payment/",
        ],
      },
    ],
    sitemap: "https://uthbus.com/sitemap.xml",
  }
}
