import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEntryDto } from './dto/create-entry.dto';
import { UpdateEntryDto } from './dto/update-entry.dto';
import { Entry } from '@prisma/client';
import { BasePrismaService } from 'src/common/base-prisma.service';

@Injectable()
export class EntryService extends BasePrismaService<Entry> {
  constructor(private readonly prismaService: PrismaService) {
    super(prismaService, 'entry');
  }

  async create(createEntryDto: CreateEntryDto) {
    // Verify customer exists
    const customer = await this.prismaService.customer.findUnique({
      where: { id: createEntryDto.customerId },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    return this.prismaService.entry.create({
      data: createEntryDto,
      include: {
        customer: true,
      },
    });
  }

  findAll() {
    return this.prismaService.entry.findMany({
      include: {
        customer: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  findOne(id: string) {
    return this.prismaService.entry.findUnique({
      where: { id },
      include: {
        customer: true,
      },
    });
  }

  findByCustomer(customerId: string) {
    return this.prismaService.entry.findMany({
      where: { customerId },
      include: {
        customer: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  update(id: string, updateEntryDto: UpdateEntryDto) {
    return this.prismaService.entry.update({
      where: { id },
      data: updateEntryDto,
      include: {
        customer: true,
      },
    });
  }

  remove(id: string) {
    return this.prismaService.entry.delete({
      where: { id },
    });
  }

  async getCustomerGOTBalance(customerId: string): Promise<number> {
    const entries = await this.prismaService.entry.findMany({
      where: { customerId },
    });

    return entries.reduce((balance, entry) => {
      return entry.type === 'GOT'
        ? balance + entry.amount
        : balance - entry.amount;
    }, 0);
  }
  async getCustomerGAVEBalance(customerId: string): Promise<number> {
    const entries = await this.prismaService.entry.findMany({
      where: { customerId },
    });

    return entries.reduce((balance, entry) => {
      return entry.type === 'GAVE'
        ? balance + entry.amount
        : balance - entry.amount;
    }, 0);
  }
}
