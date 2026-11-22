/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
  experimental: {
    serverComponentsExternalPackages: ['postgres', '@neondatabase/serverless'],
  },
  transpilePackages: ['postgres'],
};

module.exports = nextConfig;
