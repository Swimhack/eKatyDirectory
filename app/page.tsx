import { Hero } from '@/components/home/Hero'
import { CategoryChips } from '@/components/home/CategoryChips'
import { FeaturedRestaurants } from '@/components/home/FeaturedRestaurants'
import { GrubRouletteSection } from '@/components/home/GrubRouletteSection'

export default function HomePage() {
  return (
    <div className="space-y-8 md:space-y-12">
      <Hero />
      
      <section className="container-mobile">
        <div className="text-center mb-6 md:mb-8">
          <h2 className="font-bold text-gray-900 mb-4">
            Discover by Category
          </h2>
          <CategoryChips />
        </div>
      </section>

      <section className="bg-white section-spacing">
        <div className="container-mobile">
          <FeaturedRestaurants />
        </div>
      </section>

      <section className="section-spacing">
        <div className="container-mobile">
          <GrubRouletteSection />
        </div>
      </section>
    </div>
  )
}
