import type { NextConfig } from "next";

// Origins allowed to invoke Server Actions. Localhost for dev, plus the Vercel
// deployment/production URLs (injected automatically on Vercel) so submitting
// tests works behind Vercel's proxy. Add a custom domain via SERVER_ACTIONS_ORIGIN.
const allowedOrigins = [
  "localhost:3000",
  process.env.VERCEL_URL,
  process.env.VERCEL_PROJECT_PRODUCTION_URL,
  process.env.SERVER_ACTIONS_ORIGIN,
].filter((origin): origin is string => Boolean(origin));

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*.supabase.co" },
    ],
  },
  experimental: {
    serverActions: { allowedOrigins },
  },
};

export default nextConfig;
