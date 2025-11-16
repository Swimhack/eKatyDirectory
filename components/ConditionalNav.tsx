'use client'

import { usePathname } from 'next/navigation'
import LaunchBanner from './LaunchBanner'
import MobileNavigation from './MobileNavigation'

export default function ConditionalNav() {
  const pathname = usePathname()
  
  // Hide navigation on auth pages
  const hideNav = pathname?.startsWith('/auth/')
  
  if (hideNav) return null
  
  return (
    <>
      <LaunchBanner />
      <MobileNavigation />
    </>
  )
}
