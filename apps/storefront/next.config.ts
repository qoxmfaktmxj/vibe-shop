import path from "node:path";
import { fileURLToPath } from "node:url";

import type { NextConfig } from "next";

const dirname = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  devIndicators: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "loremflickr.com",
      },
    ],
  },
  turbopack: {
    root: path.join(dirname, "../.."),
  },
};

export default nextConfig;
