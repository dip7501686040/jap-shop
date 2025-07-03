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

export class BasePrismaService<
  T extends { id: unknown },
  M extends ModelName = ModelName,
> {
  protected readonly prisma: PrismaClient;
  protected readonly model: M;

  constructor(prisma: PrismaClient, model: M) {
    this.prisma = prisma;
    this.model = model;
  }

  async create(data: Partial<T>): Promise<T> {
    return await (
      this.prisma[this.model] as unknown as {
        create: (args: { data: Partial<T> }) => Promise<T>;
      }
    ).create({ data });
  }

  async findAll(): Promise<T[]> {
    return await (
      this.prisma[this.model] as unknown as { findMany: () => Promise<T[]> }
    ).findMany();
  }

  async findOne(id: unknown): Promise<T | null> {
    return await (
      this.prisma[this.model] as unknown as {
        findUnique: (args: { where: { id: unknown } }) => Promise<T | null>;
      }
    ).findUnique({ where: { id } });
  }

  async update(id: unknown, data: Partial<T>): Promise<T> {
    return await (
      this.prisma[this.model] as unknown as {
        update: (args: {
          where: { id: unknown };
          data: Partial<T>;
        }) => Promise<T>;
      }
    ).update({ where: { id }, data });
  }

  async remove(id: unknown): Promise<T> {
    return await (
      this.prisma[this.model] as unknown as {
        delete: (args: { where: { id: unknown } }) => Promise<T>;
      }
    ).delete({ where: { id } });
  }
}
