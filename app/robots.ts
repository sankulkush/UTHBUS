import type { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
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
