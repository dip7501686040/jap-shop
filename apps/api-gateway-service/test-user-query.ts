import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testUserQuery() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'admin@example.com' },
      include: {
        role: {
          include: {
            roleMenus: {
              include: {
                menu: true,
              },
            },
          },
        },
      },
    });

    console.log('User with permissions:');
    console.log(JSON.stringify(user, null, 2));
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testUserQuery();
