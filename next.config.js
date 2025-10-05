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
  },
}

module.exports = nextConfig