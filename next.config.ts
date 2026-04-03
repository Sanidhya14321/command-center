import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ==========================================================================
  // SECURITY: Response Headers (defense-in-depth with middleware)
  // ==========================================================================
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // Prevent MIME type sniffing
          { key: "X-Content-Type-Options", value: "nosniff" },
          // Prevent clickjacking
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          // Enforce HTTPS (including subdomains and preload to HSTS list)
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains; preload",
          },
          // Referrer policy: send referrer only on same-site requests
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          // Restrict permissions (geolocation, microphone, camera, payment)
          {
            key: "Permissions-Policy",
            value: "geolocation=(), microphone=(), camera=(), payment=()",
          },
          // Content Security Policy (full context in middleware for dynamic paths)
          {
            key: "Content-Security-Policy",
            value:
              "default-src 'self'; script-src 'self' 'unsafe-inline' https://vercel.live https://*.vercel.app; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://api.groq.com https://newsapi.org",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
