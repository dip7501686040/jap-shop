import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BasePrismaService } from 'src/common/base-prisma.service';
import { Customer } from '@prisma/client';

@Injectable()
export class CustomerService extends BasePrismaService<Customer> {
  constructor(private readonly prismaService: PrismaService) {
    super(prismaService, 'customer');
  }

  // Override base methods to include entries
  async findAll(): Promise<Customer[]> {
    return this.prismaService.customer.findMany({
      include: {
        entries: true,
      },
    });
  }

  async findOne(id: string): Promise<Customer | null> {
    return this.prismaService.customer.findUnique({
      where: { id },
      include: {
        entries: true,
      },
    });
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

  async getTotalDebitsAndCredits(): Promise<{
    totalDebits: number;
    totalCredits: number;
  }> {
    const customers = await this.prismaService.customer.findMany({
      include: {
        entries: true,
      },
    });
    let totalDebits = 0;
    let totalCredits = 0;
    for (const customer of customers) {
      const gaveAmount =
        customer.entries?.reduce(
          (sum, entry) => (entry.type === 'GAVE' ? sum + entry.amount : sum),
          0,
        ) || 0;
      const gotAmount =
        customer.entries?.reduce(
          (sum, entry) => (entry.type === 'GOT' ? sum + entry.amount : sum),
          0,
        ) || 0;
      const netAmount = gaveAmount - gotAmount;

      // Sum up based on net balance type
      if (netAmount > 0) {
        totalDebits += netAmount; // Customer owes (GAVE more than GOT)
      } else if (netAmount < 0) {
        totalCredits += Math.abs(netAmount); // Customer is owed (GOT more than GAVE)
      }
    }
    return { totalDebits, totalCredits };
  }
}
