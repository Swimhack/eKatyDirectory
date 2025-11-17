import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

/**
 * POST /api/auth/bootstrap-super-admin
 * One-off endpoint to bootstrap or reset the super admin account.
 *
 * Security:
 * - Requires X-Bootstrap-Token header matching process.env.ADMIN_BOOTSTRAP_TOKEN
 * - Should be used only temporarily and then disabled/removed after initial setup
 */
export async function POST(request: NextRequest) {
  try {
    const bootstrapToken = process.env.ADMIN_BOOTSTRAP_TOKEN

    if (!bootstrapToken) {
      console.error('[bootstrap-super-admin] ADMIN_BOOTSTRAP_TOKEN is not configured')
      return NextResponse.json({ error: 'Bootstrap not configured' }, { status: 500 })
    }

    const headerToken = request.headers.get('x-bootstrap-token')
    if (!headerToken || headerToken !== bootstrapToken) {
      console.warn('[bootstrap-super-admin] Invalid bootstrap token')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      )
    }

    const normalizedEmail = (email as string).toLowerCase()
    const passwordHash = await bcrypt.hash(password, 10)

    // Upsert the super admin user
    const user = await prisma.user.upsert({
      where: { email: normalizedEmail },
      update: {
        passwordHash,
        role: 'ADMIN',
      },
      create: {
        email: normalizedEmail,
        name: 'Super Admin',
        passwordHash,
        role: 'ADMIN',
      },
    })

    console.info('[bootstrap-super-admin] Super admin upserted', {
      email: user.email,
      id: user.id,
      role: user.role,
    })

    return NextResponse.json({
      success: true,
      message: 'Super admin bootstrapped successfully',
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    })
  } catch (error) {
    console.error('[bootstrap-super-admin] Error bootstrapping super admin', error)
    return NextResponse.json(
      { error: 'Failed to bootstrap super admin' },
      { status: 500 }
    )
  }
}
