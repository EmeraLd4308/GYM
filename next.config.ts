import type { NextConfig } from "next";

const devLanOrigins =
  process.env.NODE_ENV === "development" && process.env.ALLOWED_DEV_ORIGINS?.trim()
    ? process.env.ALLOWED_DEV_ORIGINS.split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ["recharts", "date-fns"],
  },
  serverExternalPackages: ["@prisma/client", "prisma"],
  ...(devLanOrigins.length > 0 ? { allowedDevOrigins: devLanOrigins } : {}),
};

export default nextConfig;
