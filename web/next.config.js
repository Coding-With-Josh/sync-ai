/** @type {import('next').NextConfig} */
const nextConfig = {
  swcMinify: true,
  experimental: {
    // Remove swcPlugins if not specifically needed
    // swcPlugins: []
  }
}

module.exports = nextConfig
