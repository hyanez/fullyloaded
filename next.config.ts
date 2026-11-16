import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Dev only: let phones on the local network load the dev server by IP (e.g. 192.168.68.87:3000).
  // Without this, Next blocks its dev resources and the page never becomes interactive.
  allowedDevOrigins: ["192.168.*.*", "10.*.*.*", "*.local"],
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
