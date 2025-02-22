/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    serverActions: true,
  },
  images: {
    domains: ['raw.githubusercontent.com', 'assets.coingecko.com'],
  },
}
