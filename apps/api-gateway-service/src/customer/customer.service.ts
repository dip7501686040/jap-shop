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

  // Logbook-related methods
  async findByLogbook(logbookId: string): Promise<any[]> {
    const logbookCustomers = await this.prismaService.logbookCustomer.findMany({
      where: { logbookId },
      include: {
        customer: {
          include: {
            entries: true,
          },
        },
      },
    });

    return logbookCustomers.map((lc) => lc.customer);
  }

  async findOneInLogbook(id: string, logbookId: string): Promise<any> {
    const logbookCustomer = await this.prismaService.logbookCustomer.findUnique(
      {
        where: {
          logbookId_customerId: {
            logbookId,
            customerId: id,
          },
        },
        include: {
          customer: {
            include: {
              entries: true,
            },
          },
        },
      },
    );

    return logbookCustomer?.customer || null;
  }

  async getCustomerGOTBalanceInLogbook(
    id: string,
    logbookId: string,
  ): Promise<number> {
    // Verify customer is in logbook
    const customerInLogbook = await this.findOneInLogbook(id, logbookId);
    if (!customerInLogbook) {
      return 0;
    }

    const entries = await this.prismaService.entry.findMany({
      where: { customerId: id },
    });

    return entries.reduce((balance, entry) => {
      return entry.type === 'GOT'
        ? balance + entry.amount
        : balance - entry.amount;
    }, 0);
  }

  async getCustomerGAVEBalanceInLogbook(
    id: string,
    logbookId: string,
  ): Promise<number> {
    // Verify customer is in logbook
    const customerInLogbook = await this.findOneInLogbook(id, logbookId);
    if (!customerInLogbook) {
      return 0;
    }

    const entries = await this.prismaService.entry.findMany({
      where: { customerId: id },
    });

    return entries.reduce((balance, entry) => {
      return entry.type === 'GAVE'
        ? balance + entry.amount
        : balance - entry.amount;
    }, 0);
  }

  async getTotalDebitsAndCreditsForLogbook(logbookId: string): Promise<{
    totalDebits: number;
    totalCredits: number;
  }> {
    const customers = await this.findByLogbook(logbookId);
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
