import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  allowedDevOrigins: [
    "192.168.0.203",
    "26.254.181.244"
  ],
  images: {
    domains: ["i.pravatar.cc"],
  },
};

export default nextConfig;

