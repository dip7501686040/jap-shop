import { Injectable } from '@nestjs/common';
import { BasePrismaService } from '../common/base-prisma.service';
import { User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UserService extends BasePrismaService<User> {
  constructor(private readonly prismaService: PrismaService) {
    super(prismaService, 'user');
  }

  async findOneByEmail(email: string): Promise<User | null> {
    return this.prismaService.user.findUnique({
      where: { email },
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
  }

  async findOne(id: string): Promise<any> {
    return this.prismaService.user.findUnique({
      where: { id },
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
  }
}
