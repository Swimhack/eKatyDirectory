import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'

export interface AuthUser {
  id: string
  email: string
  name: string | null
  role: string
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get('ekaty_session')?.value
    const userId = cookieStore.get('ekaty_user_id')?.value

    if (!sessionToken || !userId) {
      return null
    }

    // Verify user exists (role-based restrictions can be reintroduced later)
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true
      }
    })

    if (!user) {
      return null
    }

    return user
  } catch (error) {
    console.error('Error getting current user:', error)
    return null
  }
}

export async function requireAuth(): Promise<AuthUser> {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error('Unauthorized')
  }
  return user
}






