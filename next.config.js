/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    // Resolve Node.js native module imports
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      crypto: false,
      os: false,
      path: false,
      stream: false,
      zlib: false,
      url: false,
      util: false,
      assert: false,
    };

    return config;
  },
  // Removed experimental configuration with incorrect keys
  // Next.js 15.3.1 handles external packages differently
};

module.exports = nextConfig;
