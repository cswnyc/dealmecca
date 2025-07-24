/** @type {import("next").NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_APP_NAME: "DealMecca",
    NEXT_PUBLIC_BRAND_NAME: "DealMecca", 
    NEXT_PUBLIC_TAGLINE: "The mecca for media deals",
    NEXT_PUBLIC_SITE_URL: "https://dealmecca.com",
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options", 
            value: "DENY",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
        ],
      },
      {
        source: "/sw.js",
        headers: [
          {
            key: "Cache-Control",
            value: "no-cache, no-store, must-revalidate",
          },
        ],
      },
      {
        source: "/manifest.json",
        headers: [
          {
            key: "Cache-Control", 
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ]
  },
  images: {
    domains: ["api.placeholder.com"],
    formats: ["image/webp", "image/avif"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  compress: true,
  poweredByHeader: false,
};

export default nextConfig;
