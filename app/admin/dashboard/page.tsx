import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import AdminDashboardClient from './AdminDashboardClient'

export default async function AdminDashboard() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/auth/signin?redirect=/admin/dashboard')
  }

  return <AdminDashboardClient />
}
