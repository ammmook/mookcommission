import path from "node:path";
import type { NextConfig } from "next";

/**
 * Allow next/image to optimise files from this project's Supabase storage.
 * Derived from the env var so the host is never hard-coded, and omitted
 * entirely when Supabase is not configured.
 */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

const nextConfig: NextConfig = {
  // Pin the workspace root so Turbopack ignores lockfiles above the repo.
  turbopack: {
    root: path.resolve("."),
  },
  ...(supabaseUrl
    ? {
        images: {
          remotePatterns: [
            {
              protocol: "https" as const,
              hostname: new URL(supabaseUrl).hostname,
              pathname: "/storage/v1/object/public/**",
            },
          ],
        },
      }
    : {}),
};

export default nextConfig;
