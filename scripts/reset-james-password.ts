import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

async function main() {
  const email = 'james@ekaty.com'
  const plainPassword = 'admin123'

  const user = await prisma.user.findUnique({ where: { email } })

  if (!user) {
    console.error(`User not found: ${email}`)
    return
  }

  const hash = await bcrypt.hash(plainPassword, 10)

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: hash },
  })

  console.log('Password reset complete for', email)
}

main().catch((err) => {
  console.error(err)
}).finally(async () => {
  await prisma.$disconnect()
})
