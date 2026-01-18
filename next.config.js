/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  swcMinify: true,
  // Optimize for production
  productionBrowserSourceMaps: false,
}

module.exports = nextConfig

