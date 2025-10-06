import { SpinWheel, SpinHistory } from '@/components/ui/placeholders'

export const metadata = {
  title: 'Grub Roulette - eKaty',
  description: 'Can\'t decide where to eat? Let Grub Roulette pick a random restaurant for you in Katy, Texas!',
}

export default function SpinnerPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Grub Roulette 🎲
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Can&apos;t decide where to eat? Let fate choose! Spin the wheel and discover 
          your next favorite restaurant in Katy.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Spinner */}
        <div className="lg:col-span-2">
          <SpinWheel />
        </div>

        {/* History */}
        <div className="lg:col-span-1">
          <SpinHistory />
        </div>
      </div>
    </div>
  )
}