'use client'

import { useRouter } from 'next/navigation'

const categories = [
  { name: 'Mexican', emoji: '🌮' },
  { name: 'Chinese', emoji: '🍜' },
  { name: 'Burgers', emoji: '🍔' },
  { name: 'Asian', emoji: '🥡' },
  { name: 'Italian', emoji: '🍝' },
  { name: 'BBQ', emoji: '🍖' },
  { name: 'Pizza', emoji: '🍕' },
  { name: 'American', emoji: '🍟' },
]

export function CategoryChips() {
  const router = useRouter()

  const handleCategoryClick = (category: string) => {
    router.push(`/discover?categories=${encodeURIComponent(category)}`)
  }

  return (
    <div className="flex flex-wrap justify-center gap-2 md:gap-3">
      {categories.map((category) => (
        <button
          key={category.name}
          onClick={() => handleCategoryClick(category.name)}
          className="flex items-center space-x-1 md:space-x-2 px-3 md:px-4 py-2 md:py-2.5 bg-white hover:bg-brand-50 active:bg-brand-100 text-gray-800 hover:text-brand-700 font-medium rounded-full border border-earth-200 hover:border-brand-300 transition-all duration-200 shadow-sm hover:shadow-md min-h-[44px] text-sm md:text-base active:scale-95 transform hover:bg-warm-50"
        >
          <span className="text-sm md:text-base">{category.emoji}</span>
          <span>{category.name}</span>
        </button>
      ))}
    </div>
  )
}