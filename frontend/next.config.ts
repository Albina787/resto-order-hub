import type { NextConfig } from "next";

// Browser-facing API URL (used by client-side code)
const BROWSER_API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080/api/v1";

// Server-side backend URL for rewrites (inside Docker: backend:8080, outside: localhost:8080)
// BACKEND_INTERNAL_URL is set as a build ARG in Dockerfile
const BACKEND_URL =
  process.env.BACKEND_INTERNAL_URL ??
  BROWSER_API_URL.replace("/api/v1", "");

console.log(`[next.config] BACKEND_URL for rewrites: ${BACKEND_URL}`);

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    // Disable image optimization for backend images served through rewrite
    // This allows /images/** paths to be proxied directly to backend
    unoptimized: true,
    // Allow images from any http/https source
    // This covers localhost:8080, backend:8080, and any external URLs
    remotePatterns: [
      { protocol: "http", hostname: "**" },
      { protocol: "https", hostname: "**" },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: `${BACKEND_URL}/api/v1/:path*`,
      },
      {
        source: "/images/:path*",
        destination: `${BACKEND_URL}/images/:path*`,
      },
      // Proxy Spring Security OAuth2 endpoints to backend
      {
        source: "/oauth2/:path*",
        destination: `${BACKEND_URL}/oauth2/:path*`,
      },
      {
        source: "/login/oauth2/:path*",
        destination: `${BACKEND_URL}/login/oauth2/:path*`,
      },
    ];
  },
};

export default nextConfig;
