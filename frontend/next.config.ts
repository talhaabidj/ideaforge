import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  typescript: { ignoreBuildErrors: true },
  reactStrictMode: false,
  // Allow url() imports in CSS to resolve to any path (workaround for the
  // Tailwind v4 phantom texture-btn.png reference).
  urlImports: ["/static/texture-btn.png"],
};

export default nextConfig;
