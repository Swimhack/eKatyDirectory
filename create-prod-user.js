const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function createUser() {
  try {
    const existing = await prisma.user.findUnique({
      where: { email: 'james@ekaty.com' }
    });

    if (existing) {
      console.log('Updating existing user password');
      const passwordHash = await bcrypt.hash('admin123', 10);
      await prisma.user.update({
        where: { email: 'james@ekaty.com' },
        data: { passwordHash }
      });
      console.log('SUCCESS: Password updated for james@ekaty.com');
    } else {
      const passwordHash = await bcrypt.hash('admin123', 10);
      const user = await prisma.user.create({
        data: {
          email: 'james@ekaty.com',
          name: 'James',
          role: 'ADMIN',
          passwordHash
        }
      });
      console.log('SUCCESS: User created - james@ekaty.com ADMIN');
    }
  } catch (error) {
    console.error('ERROR:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createUser();
