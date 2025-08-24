/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  swcMinify: true,
  images: {
    domains: ['localhost', 'bind8.com', 'bind8-git-main-carlos-ruanos-projects.vercel.app'],
    unoptimized: process.env.NODE_ENV !== 'production',
  },
  webpack: (config) => {
    // Ignore build errors
    config.ignoreWarnings = [
      /Failed to parse source map/,
      /Module not found/,
      /Can't resolve/,
    ];
    return config;
  },
  experimental: {
    serverComponentsExternalPackages: ['stripe'],
  },
}

module.exports = nextConfig