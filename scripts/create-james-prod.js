const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function createUser() {
  try {
    const existing = await prisma.user.findUnique({
      where: { email: 'james@ekaty.com' }
    });

    if (existing) {
      console.log('User already exists:', existing.email);
      await prisma.$disconnect();
      return;
    }

    const passwordHash = await bcrypt.hash('admin123', 10);
    const user = await prisma.user.create({
      data: {
        email: 'james@ekaty.com',
        name: 'James',
        role: 'ADMIN',
        passwordHash: passwordHash
      }
    });

    console.log('User created successfully!');
    console.log('Email:', user.email);
    console.log('Role:', user.role);
    await prisma.$disconnect();
  } catch (error) {
    console.error('Error:', error.message);
    await prisma.$disconnect();
    process.exit(1);
  }
}

createUser();
