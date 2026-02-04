import path from "path"
import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(import.meta.dirname, ".."),
  turbopack: {
    root: path.join(import.meta.dirname, ".."),
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
      },
      {
        protocol: "https",
        hostname: "**.drhorton.com",
      },
      {
        protocol: "https",
        hostname: "flagcdn.com",
      },
    ],
  },
}

export default nextConfig
