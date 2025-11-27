/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      }
    }
    // Ensure CSS extraction plugins are preserved
    if (config.plugins) {
      // Keep existing plugins including CSS extraction
      config.plugins = config.plugins.filter(Boolean)
    }
    return config
  },
}

export default nextConfig