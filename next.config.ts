import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  outputFileTracingIncludes: {
    "/api/**/*": ["./src/generated/prisma/**/*"],
    "/dashboard": ["./src/generated/prisma/**/*"],
  },
};

export default nextConfig;
