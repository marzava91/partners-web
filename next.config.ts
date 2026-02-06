import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    // Fijamos explícitamente el root para que Next no
    // infiera mal por lockfiles externos
    root: path.resolve(__dirname),
  },
  
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "spewnnoyktwuwjhjubtv.supabase.co",
        pathname: "/storage/v1/object/**",
      },
    ],
  },
};

export default nextConfig;
