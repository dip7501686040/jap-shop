import { Role } from '@prisma/client';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BasePrismaService } from 'src/common/base-prisma.service';

@Injectable()
export class RoleService extends BasePrismaService<Role> {
  constructor(private readonly prismaService: PrismaService) {
    super(prismaService, 'role');
  }
}
