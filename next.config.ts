import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_HF_TOKEN: process.env.NEXT_PUBLIC_HF_TOKEN || "",
    HF_TOKEN: process.env.NEXT_PUBLIC_HF_TOKEN || "",
    GEMINI_KEY: process.env.GEMINI_KEY,
  },
};
export default nextConfig;
