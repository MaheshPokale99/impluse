import type { NextConfig } from "next";
// Images are precompressed at author time for the static Sites deployment.
const nextConfig: NextConfig = { output: "export", images: { unoptimized: true } };
export default nextConfig;
