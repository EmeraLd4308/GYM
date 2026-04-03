import type { NextConfig } from "next";

const devLanOrigins =
  process.env.NODE_ENV === "development" && process.env.ALLOWED_DEV_ORIGINS?.trim()
    ? process.env.ALLOWED_DEV_ORIGINS.split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

const nextConfig: NextConfig = {
  // Prisma на Vercel: не збирати клієнт у бандл Next — інакше runtime може не знайти engines
  serverExternalPackages: ["@prisma/client", "prisma"],
  // Dev: дозволити /_next/webpack-hmr з телефона, коли відкрито http://<LAN-IP>:3000
  // (див. ALLOWED_DEV_ORIGINS у .env.example).
  ...(devLanOrigins.length > 0 ? { allowedDevOrigins: devLanOrigins } : {}),
};

export default nextConfig;
