import { MetadataRoute } from 'next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://ekaty.fly.dev'
  
  // Get all restaurants
  const restaurants = await prisma.restaurant.findMany({
    select: {
      slug: true,
      id: true,
      updatedAt: true
    }
  })

  // Static pages
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/discover`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/spinner`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/categories`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/advertise`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/favorites`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.5,
    },
  ]

  // Category pages
  const categories = ['Mexican', 'BBQ', 'Asian', 'American', 'Seafood', 'Indian', 'Greek', 'Breakfast', 'Italian', 'Chinese', 'Japanese', 'Thai', 'Vietnamese']
  const categoryPages = categories.map(cat => ({
    url: `${baseUrl}/discover?category=${encodeURIComponent(cat)}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }))

  // Restaurant pages
  const restaurantPages = restaurants.map(restaurant => ({
    url: `${baseUrl}/restaurants/${restaurant.slug || restaurant.id}`,
    lastModified: restaurant.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  return [...staticPages, ...categoryPages, ...restaurantPages]
}
