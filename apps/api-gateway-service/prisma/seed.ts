import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

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

  // Hash password for seed users
  const hashedPassword = await bcrypt.hash('password123', 10);
  const customSuperAdminPassword = await bcrypt.hash('password', 10);

  // Create sample users
  const superAdmin = await prisma.user.upsert({
    where: { email: 'superadmin@example.com' },
    update: {},
    create: {
      email: 'superadmin@example.com',
      password: hashedPassword,
      name: 'Super Admin',
      roleId: superAdminRole.id,
    },
  });

  // Create custom superadmin user
  const customSuperAdmin = await prisma.user.upsert({
    where: { email: 'dip7001733750@gmail.com' },
    update: {},
    create: {
      email: 'dip7001733750@gmail.com',
      password: customSuperAdminPassword,
      name: 'Dipankar Saha',
      roleId: superAdminRole.id,
    },
  });

  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      password: hashedPassword,
      name: 'Admin User',
      roleId: adminRole.id,
    },
  });

  const regularUser = await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      email: 'user@example.com',
      password: hashedPassword,
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

  // Create menus
  const dashboardMenu = await prisma.menu.upsert({
    where: { href: '/dashboard' },
    update: {},
    create: {
      name: 'Dashboard',
      href: '/dashboard',
      icon: 'dashboard',
      order: 1,
      isActive: true,
    },
  });

  const customersMenu = await prisma.menu.upsert({
    where: { href: '/dashboard/customers' },
    update: {},
    create: {
      name: 'Customers',
      href: '/dashboard/customers',
      icon: 'users',
      order: 2,
      isActive: true,
    },
  });

  const productsMenu = await prisma.menu.upsert({
    where: { href: '/dashboard/products' },
    update: {},
    create: {
      name: 'Products',
      href: '/dashboard/products',
      icon: 'package',
      order: 3,
      isActive: true,
    },
  });

  const ordersMenu = await prisma.menu.upsert({
    where: { href: '/dashboard/orders' },
    update: {},
    create: {
      name: 'Orders',
      href: '/dashboard/orders',
      icon: 'shopping-cart',
      order: 4,
      isActive: true,
    },
  });

  const usersMenu = await prisma.menu.upsert({
    where: { href: '/dashboard/users' },
    update: {},
    create: {
      name: 'Users',
      href: '/dashboard/users',
      icon: 'user',
      order: 5,
      isActive: true,
    },
  });

  const rolesMenu = await prisma.menu.upsert({
    where: { href: '/dashboard/roles' },
    update: {},
    create: {
      name: 'Roles',
      href: '/dashboard/roles',
      icon: 'shield',
      order: 6,
      isActive: true,
    },
  });

  const settingsMenu = await prisma.menu.upsert({
    where: { href: '/dashboard/settings' },
    update: {},
    create: {
      name: 'Settings',
      href: '/dashboard/settings',
      icon: 'settings',
      order: 7,
      isActive: true,
    },
  });

  const menusMenu = await prisma.menu.upsert({
    where: { href: '/dashboard/menus' },
    update: {},
    create: {
      name: 'Menus',
      href: '/dashboard/menus',
      icon: 'menu',
      order: 8,
      isActive: true,
    },
  });

  const testAccessMenu = await prisma.menu.upsert({
    where: { href: '/dashboard/test-access' },
    update: {},
    create: {
      name: 'Test Access',
      href: '/dashboard/test-access',
      icon: 'test-tube',
      order: 9,
      isActive: true,
    },
  });

  // Assign menus to roles
  const superAdminMenus = [
    dashboardMenu.id,
    customersMenu.id,
    productsMenu.id,
    ordersMenu.id,
    usersMenu.id,
    rolesMenu.id,
    settingsMenu.id,
    menusMenu.id,
    testAccessMenu.id,
  ];

  const adminMenus = [
    dashboardMenu.id,
    customersMenu.id,
    productsMenu.id,
    ordersMenu.id,
    usersMenu.id,
  ];

  const userMenus = [
    dashboardMenu.id,
    customersMenu.id,
    productsMenu.id,
    ordersMenu.id,
  ];

  // Create role-menu relationships for superAdmin with full permissions
  for (const menuId of superAdminMenus) {
    await prisma.roleMenu.upsert({
      where: {
        roleId_menuId: {
          roleId: superAdminRole.id,
          menuId: menuId,
        },
      },
      update: {
        canAdd: true,
        canRead: true,
        canUpdate: true,
        canDelete: true,
      },
      create: {
        roleId: superAdminRole.id,
        menuId: menuId,
        canAdd: true,
        canRead: true,
        canUpdate: true,
        canDelete: true,
      },
    });
  }

  // Create role-menu relationships for admin with limited permissions
  for (const menuId of adminMenus) {
    await prisma.roleMenu.upsert({
      where: {
        roleId_menuId: {
          roleId: adminRole.id,
          menuId: menuId,
        },
      },
      update: {
        canAdd: true,
        canRead: true,
        canUpdate: true,
        canDelete: false, // admins can't delete
      },
      create: {
        roleId: adminRole.id,
        menuId: menuId,
        canAdd: true,
        canRead: true,
        canUpdate: true,
        canDelete: false,
      },
    });
  }

  // Create role-menu relationships for user with read-only permissions
  for (const menuId of userMenus) {
    await prisma.roleMenu.upsert({
      where: {
        roleId_menuId: {
          roleId: userRole.id,
          menuId: menuId,
        },
      },
      update: {
        canAdd: false,
        canRead: true,
        canUpdate: false,
        canDelete: false,
      },
      create: {
        roleId: userRole.id,
        menuId: menuId,
        canAdd: false,
        canRead: true,
        canUpdate: false,
        canDelete: false,
      },
    });
  }

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
