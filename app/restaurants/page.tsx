import { redirect } from 'next/navigation'

export default function RestaurantsPage() {
  // Redirect to the discover page which has the full restaurant listing
  redirect('/discover')
}
