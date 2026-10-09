import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 7,
  },
  async rewrites() {
    const apiUrl = (process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000").replace(/\/$/, "");
    return [{ source: "/uploads/:path*", destination: `${apiUrl}/uploads/:path*` }];
  },
};

export default nextConfig;
