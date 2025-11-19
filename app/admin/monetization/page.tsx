import { redirect } from 'next/navigation'

// Redirect to leads page
export default function MonetizationPage() {
  redirect('/admin/monetization/leads')
}
