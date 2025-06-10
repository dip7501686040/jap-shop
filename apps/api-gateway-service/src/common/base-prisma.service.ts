import { PrismaClient } from '@prisma/client';

type ModelName = keyof Omit<
  PrismaClient,
  | '$connect'
  | '$disconnect'
  | '$on'
  | '$transaction'
  | '$use'
  | '$executeRaw'
  | '$executeRawUnsafe'
  | '$queryRaw'
  | '$queryRawUnsafe'
  | '$extends'
>;

type ModelDelegate<T> = T extends ModelName ? PrismaClient[T] : never;

export class BasePrismaService<
  T extends { id: any },
  M extends ModelName = ModelName,
> {
  protected readonly prisma: PrismaClient;
  protected readonly model: M;

  constructor(prisma: PrismaClient, model: M) {
    this.prisma = prisma;
    this.model = model;
  }

  async create(data: Partial<T>): Promise<T> {
    return (this.prisma[this.model] as any).create({ data });
  }

  async findAll(): Promise<T[]> {
    return (this.prisma[this.model] as any).findMany();
  }

  async findOne(id: any): Promise<T | null> {
    return (this.prisma[this.model] as any).findUnique({ where: { id } });
  }

  async update(id: any, data: Partial<T>): Promise<T> {
    return (this.prisma[this.model] as any).update({ where: { id }, data });
  }

  async remove(id: any): Promise<T> {
    return (this.prisma[this.model] as any).delete({ where: { id } });
  }
}
