/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  
  // Ensure static files are served correctly
  async headers() {
    return [
      {
        source: '/manifest.json',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/manifest+json',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
  
  images: {
    domains: ['xlelbtiigxiodsbrqtgkls.supabase.co'], // Supabase storage domain
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [390, 768, 1024, 1280, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
        port: '',
        pathname: '/storage/**',
      },
    ],
  },
  
  experimental: {
    serverComponentsExternalPackages: ['@supabase/supabase-js'],
  },
  
  // PWA and mobile optimizations
  compress: true,
  poweredByHeader: false,
}

module.exports = nextConfig