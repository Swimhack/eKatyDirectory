import Link from 'next/link'

export function GrubRouletteSection() {
  return (
    <div className="text-center bg-gradient-to-r from-brand-500 to-orange-500 text-white rounded-2xl p-12">
      <div className="max-w-2xl mx-auto">
        <div className="text-6xl mb-4">🎲</div>
        <h2 className="text-3xl font-bold mb-4">
          Can&apos;t Decide? Try Grub Roulette!
        </h2>
        <p className="text-xl mb-8 text-orange-100">
          Let fate choose your next meal! Our Grub Roulette will pick a random restaurant 
          based on your preferences. Perfect for the indecisive foodie.
        </p>
        <Link 
          href="/spinner"
          className="inline-block bg-white text-brand-600 font-bold px-8 py-4 rounded-lg hover:bg-gray-100 transition-colors text-lg"
        >
          Spin the Wheel Now!
        </Link>
      </div>
    </div>
  )
}