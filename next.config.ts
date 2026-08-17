import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
  },
  // The Netlify/E2B preview is served from a proxied host; allow it explicitly.
  allowedDevOrigins: ["*.e2b.app"],
  async headers() {
    return [
      {
        // The scroll sequence frames are immutable build assets.
        source: "/hero/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
    ];
  },
};

export default nextConfig;
