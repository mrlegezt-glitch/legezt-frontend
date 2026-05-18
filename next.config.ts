import type { NextConfig } from "next";

// Trigger rebuild for Azure Appsettings sync
const nextConfig: NextConfig = {
  output: "standalone",
  serverExternalPackages: ["better-sqlite3"],
};

export default nextConfig;
