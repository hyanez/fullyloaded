import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // 75 is the default; 90 keeps skin and texture detail in event posters
    qualities: [75, 90],
    // Allow next/image to load assets served from Contentful
    remotePatterns: [
      { protocol: "https", hostname: "images.ctfassets.net", pathname: "/**" },
    ],
  },
};

export default nextConfig;
