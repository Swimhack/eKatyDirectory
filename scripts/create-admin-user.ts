import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function createAdminUser() {
  const email = 'james@ekaty.com'
  const password = 'admin123' // Change this to your desired password
  const name = 'James Strickland'

  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      console.log('✅ User already exists:', email)
      console.log('   Role:', existingUser.role)
      return
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10)

    // Create admin user
    const user = await prisma.user.create({
      data: {
        email,
        name,
        passwordHash,
        role: 'ADMIN'
      }
    })

    console.log('✅ Admin user created successfully!')
    console.log('   Email:', user.email)
    console.log('   Role:', user.role)
    console.log('   Password:', password)
    console.log('\n⚠️  Please change the password after first login!')
  } catch (error) {
    console.error('❌ Error creating admin user:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createAdminUser()
