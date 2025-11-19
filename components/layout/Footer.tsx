'use client'

import Link from 'next/link'
import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { clsx } from 'clsx'

export function Footer() {
  const [expandedSection, setExpandedSection] = useState<string | null>(null)

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section)
  }

  return (
    <>
      {/* Desktop Footer */}
      <footer className="bg-gray-900 text-white hidden md:block">
        <div className="container-mobile section-spacing">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Brand */}
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-br from-brand-400 to-brand-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-lg">🏘️</span>
                  </div>
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-warm-400 rounded-full border-2 border-gray-900"></div>
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-xl leading-tight">eKaty</span>
                  <span className="text-xs text-brand-400 font-medium -mt-1">Local Flavors</span>
                </div>
              </div>
              <p className="text-gray-400 max-w-md text-sm md:text-base">
                Bringing Katy families together through authentic local dining experiences. 
                Discover the restaurants that make our community special.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="font-semibold text-base md:text-lg mb-4">Quick Links</h3>
              <div className="space-y-3">
                <Link href="/discover" className="block text-gray-400 hover:text-white transition-colors text-sm md:text-base min-h-[44px] md:min-h-0 flex items-center">
                  Discover Restaurants
                </Link>
                <Link href="/spinner" className="block text-gray-400 hover:text-white transition-colors text-sm md:text-base min-h-[44px] md:min-h-0 flex items-center">
                  Grub Roulette
                </Link>
                <Link href="/contact" className="block text-gray-400 hover:text-white transition-colors text-sm md:text-base min-h-[44px] md:min-h-0 flex items-center">
                  Contact Us
                </Link>
              </div>
            </div>

            {/* Business */}
            <div>
              <h3 className="font-semibold text-base md:text-lg mb-4">For Restaurants</h3>
              <div className="space-y-3">
                <Link href="/contact" className="block text-gray-400 hover:text-white transition-colors text-sm md:text-base min-h-[44px] md:min-h-0 flex items-center">
                  Get Listed
                </Link>
                <Link href="/contact" className="block text-gray-400 hover:text-white transition-colors text-sm md:text-base min-h-[44px] md:min-h-0 flex items-center">
                  Advertise
                </Link>
                <Link href="/contact" className="block text-gray-400 hover:text-white transition-colors text-sm md:text-base min-h-[44px] md:min-h-0 flex items-center">
                  Partnership
                </Link>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-6 md:pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 mb-4">
              <p className="text-gray-400 text-sm text-center md:text-left">
                © 2025 eKaty.com. All rights reserved.
              </p>
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-6 items-center">
                <Link href="/privacy" className="text-gray-400 hover:text-white text-sm transition-colors min-h-[44px] md:min-h-0 flex items-center">
                  Privacy Policy
                </Link>
                <Link href="/terms" className="text-gray-400 hover:text-white text-sm transition-colors min-h-[44px] md:min-h-0 flex items-center">
                  Terms of Service
                </Link>
              </div>
            </div>
            <div className="text-center">
              <a 
                href="https://StricklandTechnology.net" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-brand-400 text-xs transition-colors inline-flex items-center gap-1"
                title="Houston Web Design & Development by Strickland Technology"
                aria-label="Website designed and developed by Strickland Technology - Houston Web Design"
              >
                Powered by Strickland Technology
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Mobile Footer - Minimal version above bottom nav */}
      <footer className="bg-gray-800 text-white py-4 md:hidden">
        <div className="container-mobile">
          <div className="text-center">
            <p className="text-gray-400 text-xs">
              © 2025 eKaty.com. All rights reserved.
            </p>
          <div className="flex justify-center space-x-4 mt-2 mb-3">
            <Link href="/privacy" className="text-gray-400 hover:text-white text-xs transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center px-2 py-3">
              Privacy
            </Link>
            <Link href="/terms" className="text-gray-400 hover:text-white text-xs transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center px-2 py-3">
              Terms
            </Link>
          </div>
          <div className="text-center">
            <a 
              href="https://StricklandTechnology.net" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-500 hover:text-brand-400 text-xs transition-colors inline-flex items-center gap-1 min-h-[44px] px-2 py-3"
              title="Houston Web Design & Development by Strickland Technology"
              aria-label="Website designed and developed by Strickland Technology - Houston Web Design"
            >
              Powered by Strickland Technology
            </a>
          </div>
          </div>
        </div>
      </footer>
    </>
  )
}
