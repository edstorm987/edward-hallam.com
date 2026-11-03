/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ["127.0.0.1"],
  // Link-tree mode is the original hand-built page, served as-is from public/links.
  async rewrites() {
    return [
      { source: "/links", destination: "/links/index.html" },
      { source: "/privacy", destination: "/privacy.html" },
    ];
  },
};

export default nextConfig;
