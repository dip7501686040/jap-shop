import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create roles
  const superAdminRole = await prisma.role.upsert({
    where: { name: 'superAdmin' },
    update: {},
    create: {
      name: 'superAdmin',
      description: 'Super Administrator with full access',
    },
  });

  const adminRole = await prisma.role.upsert({
    where: { name: 'admin' },
    update: {},
    create: {
      name: 'admin',
      description: 'Administrator with admin access',
    },
  });

  const userRole = await prisma.role.upsert({
    where: { name: 'user' },
    update: {},
    create: {
      name: 'user',
      description: 'Regular user with restricted access',
    },
  });

  // Create sample users
  const superAdmin = await prisma.user.upsert({
    where: { email: 'superadmin@example.com' },
    update: {},
    create: {
      email: 'superadmin@example.com',
      password: 'password123',
      name: 'Super Admin',
      roleId: superAdminRole.id,
    },
  });

  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      password: 'password123',
      name: 'Admin User',
      roleId: adminRole.id,
    },
  });

  const regularUser = await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      email: 'user@example.com',
      password: 'password123',
      name: 'Regular User',
      roleId: userRole.id,
    },
  });

  // Create sample customers
  const customer1 = await prisma.customer.create({
    data: {
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+1234567890',
      address: '123 Main St, City, State',
    },
  });

  const customer2 = await prisma.customer.create({
    data: {
      name: 'Jane Smith',
      email: 'jane@example.com',
      phone: '+0987654321',
      address: '456 Oak Ave, City, State',
    },
  });

  // Create sample entries
  await prisma.entry.createMany({
    data: [
      {
        type: 'GOT',
        amount: 1000,
        customerId: customer1.id,
      },
      {
        type: 'GAVE',
        amount: 500,
        customerId: customer1.id,
      },
      {
        type: 'GOT',
        amount: 2000,
        customerId: customer2.id,
      },
      {
        type: 'GAVE',
        amount: 750,
        customerId: customer2.id,
      },
    ],
  });

  console.log('Seed data created successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
