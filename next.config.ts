/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'elias-docs.s3.us-east-1.amazonaws.com',
      },
    ],
  },
  eslint: {
    ignoreDuringBuilds: true, // 🚨 Permite build com erros ESLint
  },
  experimental: {
    serverComponentsExternalPackages: ['formidable'],
  },
  api: {
    bodyParser: {
      sizeLimit: '50mb',
    },
    responseLimit: '50mb',
  },
}

module.exports = nextConfig
