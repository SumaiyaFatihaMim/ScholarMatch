import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  allowedDevOrigins: ["localhost", "127.0.0.1", "192.168.0.8"],
  async redirects() {
    return [
      { source: "/dashboard/profile", destination: "/profile", permanent: true },
      { source: "/dashboard/opportunities/:path*", destination: "/opportunities/:path*", permanent: true },
      { source: "/dashboard/professors/:path*", destination: "/professors/:path*", permanent: true },
      { source: "/dashboard/outreach", destination: "/outreach", permanent: true },
      { source: "/dashboard/applications", destination: "/applications", permanent: true },
      { source: "/dashboard/settings", destination: "/settings", permanent: true },
    ];
  },
};
export default nextConfig;
