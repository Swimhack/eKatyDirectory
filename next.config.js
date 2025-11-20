/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    domains: [
      'localhost',
      'ekaty.com',
      'ekaty.fly.dev',
      'images.unsplash.com',
      'lh3.googleusercontent.com', // Google Places photos
      'maps.googleapis.com', // Google Maps static images
      'res.cloudinary.com', // If using Cloudinary
      'supabase.co', // Supabase storage
      'supabase.com'
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
    instrumentationHook: false, // Disabled because cron file doesn't exist
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Mark resend as external to prevent bundling during build
      config.externals = config.externals || []
      config.externals.push('resend')
    }
    return config
  },
}

module.exports = nextConfig