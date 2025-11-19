import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Partner with eKaty - Restaurant Partnership Program',
  description: 'Join Katy\'s premier restaurant discovery platform. Increase visibility, reach new customers, and grow your business with our proven partnership program.',
  keywords: 'restaurant partnership, Katy Texas, restaurant advertising, local business, partner program',
  openGraph: {
    title: 'Partner with eKaty - Grow Your Restaurant Business',
    description: 'Connect with thousands of local food lovers and increase your restaurant\'s visibility on Katy\'s top dining platform.',
    url: 'https://ekaty.com/partner',
    siteName: 'eKaty',
    type: 'website',
  },
}

export default function PartnerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
