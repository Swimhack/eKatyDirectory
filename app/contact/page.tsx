import { ContactForm, BusinessInquiry } from '@/components/ui/placeholders'

export const metadata = {
  title: 'Contact Us - eKaty',
  description: 'Get in touch with eKaty for general inquiries or restaurant advertising opportunities.',
}

export default function ContactPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Contact Us
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Have questions or want to partner with us? We&apos;d love to hear from you!
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
        {/* General Contact */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            General Inquiries
          </h2>
          <ContactForm />
        </div>

        {/* Business Inquiries */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Restaurant Partnerships
          </h2>
          <BusinessInquiry />
        </div>
      </div>
    </div>
  )
}