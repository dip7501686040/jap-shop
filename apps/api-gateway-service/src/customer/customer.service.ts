import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BasePrismaService } from 'src/common/base-prisma.service';
import { Customer } from '@prisma/client';

@Injectable()
export class CustomerService extends BasePrismaService<Customer> {
  constructor(private readonly prismaService: PrismaService) {
    super(prismaService, 'customer');
  }

  async getCustomerGOTBalance(id: string): Promise<number> {
    const entries = await this.prismaService.entry.findMany({
      where: { customerId: id },
    });

    return entries.reduce((balance, entry) => {
      return entry.type === 'GOT'
        ? balance + entry.amount
        : balance - entry.amount;
    }, 0);
  }
  async getCustomerGAVEBalance(id: string): Promise<number> {
    const entries = await this.prismaService.entry.findMany({
      where: { customerId: id },
    });

    return entries.reduce((balance, entry) => {
      return entry.type === 'GAVE'
        ? balance + entry.amount
        : balance - entry.amount;
    }, 0);
  }
}
