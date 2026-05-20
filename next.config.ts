import type { NextConfig } from "next";

// Trigger rebuild for Azure Appsettings sync
const nextConfig: NextConfig = {
  output: "standalone",
  serverExternalPackages: ["better-sqlite3"],
  experimental: {
    proxyClientMaxBodySize: "100mb"
  },
  async rewrites() {
    return [
      {
        source: "/uploads/:path*",
        destination: "https://legezt-backend-api.azurewebsites.net/uploads/:path*",
      },
    ];
  },
};

export default nextConfig;
