import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkRoleMenus() {
  try {
    const roleMenus = await prisma.roleMenu.findMany({
      take: 3,
      include: {
        role: true,
        menu: true,
      },
    });

    console.log('RoleMenus data:');
    console.log(JSON.stringify(roleMenus, null, 2));
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkRoleMenus();
