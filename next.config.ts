import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
  serverExternalPackages: ["@prisma/client", "@prisma/adapter-pg", "pg", "xlsx"],
};

export default nextConfig;
