import SpinnerPageContent from '@/components/spinner/SpinnerPageContent'

export const metadata = {
  title: 'Grub Roulette - eKaty',
  description: 'Can\'t decide where to eat? Let Grub Roulette pick a random restaurant for you in Katy, Texas!',
}

export default function SpinnerPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
          Grub Roulette 🎰
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Can&apos;t decide where to eat? Let fate choose! Spin the wheel and discover
          your next favorite restaurant in Katy.
        </p>
      </div>

      <SpinnerPageContent />
    </div>
  )
}