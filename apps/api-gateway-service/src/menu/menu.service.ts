import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';

@Injectable()
export class MenuService {
  constructor(private prisma: PrismaService) {}

  async create(createMenuDto: CreateMenuDto) {
    const { roleIds, ...menuData } = createMenuDto;

    const menu = await this.prisma.menu.create({
      data: {
        ...menuData,
        ...(roleIds && {
          roleMenus: {
            create: roleIds.map((roleId) => ({ roleId })),
          },
        }),
      },
      include: {
        roleMenus: {
          include: {
            role: true,
          },
        },
        parent: true,
        children: true,
      },
    });

    return menu;
  }

  async findAll() {
    return this.prisma.menu.findMany({
      include: {
        roleMenus: {
          include: {
            role: true,
          },
        },
        parent: true,
        children: true,
      },
      orderBy: {
        order: 'asc',
      },
    });
  }

  async findOne(id: string) {
    const menu = await this.prisma.menu.findUnique({
      where: { id },
      include: {
        roleMenus: {
          include: {
            role: true,
          },
        },
        parent: true,
        children: true,
      },
    });

    if (!menu) {
      throw new NotFoundException(`Menu with ID ${id} not found`);
    }

    return menu;
  }

  async findByRole(roleId: string) {
    return this.prisma.menu.findMany({
      where: {
        isActive: true,
        roleMenus: {
          some: {
            roleId,
          },
        },
      },
      include: {
        parent: true,
        children: {
          where: {
            isActive: true,
            roleMenus: {
              some: {
                roleId,
              },
            },
          },
          orderBy: {
            order: 'asc',
          },
        },
      },
      orderBy: {
        order: 'asc',
      },
    });
  }

  async update(id: string, updateMenuDto: UpdateMenuDto) {
    const { roleIds, ...menuData } = updateMenuDto;

    // Check if menu exists
    await this.findOne(id);

    // If roleIds are provided, update role-menu relationships
    if (roleIds !== undefined) {
      // Delete existing role-menu relationships
      await this.prisma.roleMenu.deleteMany({
        where: { menuId: id },
      });

      // Create new role-menu relationships
      if (roleIds.length > 0) {
        await this.prisma.roleMenu.createMany({
          data: roleIds.map((roleId) => ({ roleId, menuId: id })),
        });
      }
    }

    const menu = await this.prisma.menu.update({
      where: { id },
      data: menuData,
      include: {
        roleMenus: {
          include: {
            role: true,
          },
        },
        parent: true,
        children: true,
      },
    });

    return menu;
  }

  async remove(id: string) {
    // Check if menu exists
    await this.findOne(id);

    // Delete role-menu relationships first
    await this.prisma.roleMenu.deleteMany({
      where: { menuId: id },
    });

    // Delete the menu
    return this.prisma.menu.delete({
      where: { id },
    });
  }

  async assignMenuToRole(menuId: string, roleId: string) {
    // Check if menu and role exist
    await this.findOne(menuId);

    const role = await this.prisma.role.findUnique({
      where: { id: roleId },
    });

    if (!role) {
      throw new NotFoundException(`Role with ID ${roleId} not found`);
    }

    // Check if relationship already exists
    const existingRelation = await this.prisma.roleMenu.findUnique({
      where: {
        roleId_menuId: {
          roleId,
          menuId,
        },
      },
    });

    if (existingRelation) {
      return { message: 'Menu already assigned to role' };
    }

    await this.prisma.roleMenu.create({
      data: {
        roleId,
        menuId,
      },
    });

    return { message: 'Menu successfully assigned to role' };
  }

  async removeMenuFromRole(menuId: string, roleId: string) {
    const roleMenu = await this.prisma.roleMenu.findUnique({
      where: {
        roleId_menuId: {
          roleId,
          menuId,
        },
      },
    });

    if (!roleMenu) {
      throw new NotFoundException('Menu-Role relationship not found');
    }

    await this.prisma.roleMenu.delete({
      where: {
        roleId_menuId: {
          roleId,
          menuId,
        },
      },
    });

    return { message: 'Menu successfully removed from role' };
  }
}
