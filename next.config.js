/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  webpack: (config, { isServer }) => {
    // Ignore build errors
    config.ignoreWarnings = [
      /Failed to parse source map/,
      /Module not found/,
      /Can't resolve/,
    ];
    return config;
  },
}

module.exports = nextConfig
