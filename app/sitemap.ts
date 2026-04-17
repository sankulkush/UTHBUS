import type { MetadataRoute } from "next"

const BASE = "https://uthbus.com"
const now  = new Date()

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    // ── Core ────────────────────────────────────────────────────────────────
    { url: BASE,                  lastModified: now, changeFrequency: "daily",   priority: 1.0 },
    { url: `${BASE}/search`,      lastModified: now, changeFrequency: "daily",   priority: 0.8 },
    { url: `${BASE}/about`,       lastModified: now, changeFrequency: "monthly", priority: 0.4 },
    { url: `${BASE}/contact`,     lastModified: now, changeFrequency: "monthly", priority: 0.4 },

    // ── SEO route pages ──────────────────────────────────────────────────────
    { url: `${BASE}/kathmandu-to-pokhara-bus`,    lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE}/kathmandu-to-itahari-bus`,    lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE}/kathmandu-to-dharan-bus`,     lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE}/kathmandu-to-damak-bus`,      lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE}/biratnagar-to-kathmandu-bus`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE}/kakarvitta-to-kathmandu-bus`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
  ]
}
