'use client'

import { Check, X, Star } from 'lucide-react'

interface Tier {
  id: string
  name: string
  slug: string
  monthly_price: number
  features: string[]
  display_order: number
  is_active: boolean
}

interface TierComparisonProps {
  tiers: Tier[]
  featuredTierId?: string
}

export default function TierComparison({
  tiers,
  featuredTierId,
}: TierComparisonProps) {
  // Sort tiers by display_order
  const sortedTiers = [...tiers].sort(
    (a, b) => a.display_order - b.display_order
  )

  // Get all unique features across all tiers
  const allFeatures = Array.from(
    new Set(sortedTiers.flatMap((tier) => tier.features))
  )

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Desktop View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">
                Features
              </th>
              {sortedTiers.map((tier) => (
                <th
                  key={tier.id}
                  className={`px-6 py-4 text-center ${
                    tier.id === featuredTierId
                      ? 'bg-amber-50 border-x-2 border-amber-400'
                      : ''
                  }`}
                >
                  <div className="flex flex-col items-center gap-2">
                    {tier.id === featuredTierId && (
                      <div className="flex items-center gap-1 text-amber-600">
                        <Star className="w-4 h-4 fill-current" />
                        <span className="text-xs font-semibold uppercase">
                          Featured
                        </span>
                      </div>
                    )}
                    <div className="text-lg font-bold text-gray-900">
                      {tier.name}
                    </div>
                    <div className="text-2xl font-bold text-gray-900">
                      ${tier.monthly_price}
                      <span className="text-sm font-normal text-gray-600">
                        /mo
                      </span>
                    </div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {allFeatures.map((feature, idx) => (
              <tr key={idx} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm text-gray-900">{feature}</td>
                {sortedTiers.map((tier) => (
                  <td
                    key={tier.id}
                    className={`px-6 py-4 text-center ${
                      tier.id === featuredTierId
                        ? 'bg-amber-50 border-x-2 border-amber-400'
                        : ''
                    }`}
                  >
                    {tier.features.includes(feature) ? (
                      <Check className="w-5 h-5 text-green-600 mx-auto" />
                    ) : (
                      <X className="w-5 h-5 text-gray-300 mx-auto" />
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile View - Stacked Cards */}
      <div className="md:hidden divide-y divide-gray-200">
        {sortedTiers.map((tier) => (
          <div
            key={tier.id}
            className={`p-6 ${
              tier.id === featuredTierId ? 'bg-amber-50 border-2 border-amber-400' : ''
            }`}
          >
            <div className="flex flex-col items-center mb-4">
              {tier.id === featuredTierId && (
                <div className="flex items-center gap-1 text-amber-600 mb-2">
                  <Star className="w-4 h-4 fill-current" />
                  <span className="text-xs font-semibold uppercase">
                    Featured
                  </span>
                </div>
              )}
              <h3 className="text-xl font-bold text-gray-900">{tier.name}</h3>
              <div className="text-3xl font-bold text-gray-900 mt-2">
                ${tier.monthly_price}
                <span className="text-sm font-normal text-gray-600">/mo</span>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-medium text-gray-700 uppercase">
                Included Features
              </p>
              <ul className="space-y-2">
                {tier.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-900">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* Show missing features */}
              {allFeatures.filter((f) => !tier.features.includes(f)).length >
                0 && (
                <>
                  <p className="text-sm font-medium text-gray-500 uppercase mt-4">
                    Not Included
                  </p>
                  <ul className="space-y-2">
                    {allFeatures
                      .filter((f) => !tier.features.includes(f))
                      .map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <X className="w-5 h-5 text-gray-300 flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-gray-500">
                            {feature}
                          </span>
                        </li>
                      ))}
                  </ul>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
