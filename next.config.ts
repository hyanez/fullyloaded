import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Allow next/image to load assets served from Contentful
    remotePatterns: [
      { protocol: "https", hostname: "images.ctfassets.net", pathname: "/**" },
    ],
  },
};

export default nextConfig;
