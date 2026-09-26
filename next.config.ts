import type { NextConfig } from "next";
// Images are precompressed at author time, so Next's image optimizer isn't needed.
const nextConfig: NextConfig = { images: { unoptimized: true } };
export default nextConfig;
