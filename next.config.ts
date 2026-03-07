import type { NextConfig } from "next";

const isExport = process.env.EXPORT_MODE === 'true';

const nextConfig: NextConfig = {
  output: isExport ? 'export' : undefined,
  images: {
    unoptimized: true,
  },
  // Skip route checking for API routes during export if possible
  // For now, we manually handle the routes to be export-compatible
};

export default nextConfig;
