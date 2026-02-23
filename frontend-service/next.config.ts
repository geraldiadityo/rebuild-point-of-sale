import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  async rewrites() {
    const backendUrl = process.env.INTERNAL_BACKEND_API_URL;

    if (!backendUrl) {
      console.warn('INTERNAL BACKEND API URL is not set');
      return [];
    }

    return [
      {
        source: '/api/proxy/:path*',
        destination: `${backendUrl}/:path*`
      }
    ]
  },
};

export default nextConfig;
