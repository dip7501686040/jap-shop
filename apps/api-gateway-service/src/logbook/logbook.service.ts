import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateLogbookDto,
  UpdateLogbookDto,
  LogbookPermissionDto,
  AddCustomerToLogbookDto,
  LogbookQueryDto,
} from './dto/logbook.dto';

@Injectable()
export class LogbookService {
  constructor(private prisma: PrismaService) {}

  private successResponse(data: any, message?: string) {
    return {
      success: true,
      message: message || 'Operation completed successfully',
      data,
    };
  }

  private paginatedResponse(
    data: any[],
    total: number,
    page: number,
    limit: number,
  ) {
    return {
      success: true,
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  private notFoundError(message: string) {
    return new HttpException(message, HttpStatus.NOT_FOUND);
  }

  private forbiddenError(message: string) {
    return new HttpException(message, HttpStatus.FORBIDDEN);
  }

  private conflictError(message: string) {
    return new HttpException(message, HttpStatus.CONFLICT);
  }

  async findAll(query: LogbookQueryDto, userId?: string) {
    const page = parseInt(query.page || '1') || 1;
    const limit = parseInt(query.limit || '10') || 10;
    const skip = (page - 1) * limit;

    const where: any = {};

    // If user is not superadmin, only show logbooks they have access to
    if (userId) {
      where.userLogbooks = {
        some: {
          userId: userId,
        },
      };
    }

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [logbooks, total] = await Promise.all([
      this.prisma.logbook.findMany({
        where,
        include: {
          userLogbooks: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
          logbookCustomers: {
            include: {
              customer: true,
            },
          },
          _count: {
            select: {
              userLogbooks: true,
              logbookCustomers: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.logbook.count({ where }),
    ]);

    return this.paginatedResponse(logbooks, total, page, limit);
  }

  async findOne(id: string, userId?: string) {
    const where: any = { id };

    // If user is not superadmin, check if they have access to this logbook
    if (userId) {
      where.userLogbooks = {
        some: {
          userId: userId,
        },
      };
    }

    const logbook = await this.prisma.logbook.findFirst({
      where,
      include: {
        userLogbooks: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        logbookCustomers: {
          include: {
            customer: true,
          },
        },
      },
    });

    if (!logbook) {
      throw this.notFoundError('Logbook not found');
    }

    return this.successResponse(logbook);
  }

  async create(createLogbookDto: CreateLogbookDto) {
    const logbook = await this.prisma.logbook.create({
      data: createLogbookDto,
      include: {
        userLogbooks: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        logbookCustomers: {
          include: {
            customer: true,
          },
        },
      },
    });

    return this.successResponse(logbook, 'Logbook created successfully');
  }

  async update(id: string, updateLogbookDto: UpdateLogbookDto) {
    const existingLogbook = await this.prisma.logbook.findUnique({
      where: { id },
    });

    if (!existingLogbook) {
      throw this.notFoundError('Logbook not found');
    }

    const logbook = await this.prisma.logbook.update({
      where: { id },
      data: updateLogbookDto,
      include: {
        userLogbooks: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        logbookCustomers: {
          include: {
            customer: true,
          },
        },
      },
    });

    return this.successResponse(logbook, 'Logbook updated successfully');
  }

  async remove(id: string) {
    const existingLogbook = await this.prisma.logbook.findUnique({
      where: { id },
    });

    if (!existingLogbook) {
      throw this.notFoundError('Logbook not found');
    }

    await this.prisma.logbook.delete({
      where: { id },
    });

    return this.successResponse(null, 'Logbook deleted successfully');
  }

  // User Permission Management
  async setUserPermissions(
    logbookId: string,
    permissionDto: LogbookPermissionDto,
  ) {
    const logbook = await this.prisma.logbook.findUnique({
      where: { id: logbookId },
    });

    if (!logbook) {
      throw this.notFoundError('Logbook not found');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: permissionDto.userId },
    });

    if (!user) {
      throw this.notFoundError('User not found');
    }

    const userLogbook = await this.prisma.userLogbook.upsert({
      where: {
        userId_logbookId: {
          userId: permissionDto.userId,
          logbookId: logbookId,
        },
      },
      update: {
        canAdd: permissionDto.canAdd,
        canRead: permissionDto.canRead,
        canUpdate: permissionDto.canUpdate,
        canDelete: permissionDto.canDelete,
      },
      create: {
        userId: permissionDto.userId,
        logbookId: logbookId,
        canAdd: permissionDto.canAdd,
        canRead: permissionDto.canRead,
        canUpdate: permissionDto.canUpdate,
        canDelete: permissionDto.canDelete,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return this.successResponse(
      userLogbook,
      'User permissions updated successfully',
    );
  }

  async removeUserPermissions(logbookId: string, userId: string) {
    const userLogbook = await this.prisma.userLogbook.findUnique({
      where: {
        userId_logbookId: {
          userId: userId,
          logbookId: logbookId,
        },
      },
    });

    if (!userLogbook) {
      throw this.notFoundError('User permission not found');
    }

    await this.prisma.userLogbook.delete({
      where: {
        userId_logbookId: {
          userId: userId,
          logbookId: logbookId,
        },
      },
    });

    return this.successResponse(null, 'User permissions removed successfully');
  }

  // Customer Management
  async getLogbookCustomers(
    logbookId: string,
    query: LogbookQueryDto,
    userId?: string,
  ) {
    // Check if user has access to this logbook
    if (userId) {
      const hasAccess = await this.prisma.userLogbook.findUnique({
        where: {
          userId_logbookId: {
            userId: userId,
            logbookId: logbookId,
          },
        },
      });

      if (!hasAccess) {
        throw this.forbiddenError('You do not have access to this logbook');
      }
    }

    const page = parseInt(query.page || '1') || 1;
    const limit = parseInt(query.limit || '10') || 10;
    const skip = (page - 1) * limit;

    const where: any = {
      logbookId: logbookId,
    };

    if (query.search) {
      where.customer = {
        OR: [
          { name: { contains: query.search, mode: 'insensitive' } },
          { email: { contains: query.search, mode: 'insensitive' } },
          { phone: { contains: query.search, mode: 'insensitive' } },
        ],
      };
    }

    const [logbookCustomers, total] = await Promise.all([
      this.prisma.logbookCustomer.findMany({
        where,
        include: {
          customer: {
            include: {
              entries: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.logbookCustomer.count({ where }),
    ]);

    return this.paginatedResponse(logbookCustomers, total, page, limit);
  }

  async addCustomerToLogbook(
    logbookId: string,
    addCustomerDto: AddCustomerToLogbookDto,
  ) {
    const logbook = await this.prisma.logbook.findUnique({
      where: { id: logbookId },
    });

    if (!logbook) {
      throw this.notFoundError('Logbook not found');
    }

    const customer = await this.prisma.customer.findUnique({
      where: { id: addCustomerDto.customerId },
    });

    if (!customer) {
      throw this.notFoundError('Customer not found');
    }

    // Check if customer is already in this logbook
    const existingRelation = await this.prisma.logbookCustomer.findUnique({
      where: {
        logbookId_customerId: {
          logbookId: logbookId,
          customerId: addCustomerDto.customerId,
        },
      },
    });

    if (existingRelation) {
      throw this.conflictError('Customer is already in this logbook');
    }

    const logbookCustomer = await this.prisma.logbookCustomer.create({
      data: {
        logbookId: logbookId,
        customerId: addCustomerDto.customerId,
      },
      include: {
        customer: true,
      },
    });

    return this.successResponse(
      logbookCustomer,
      'Customer added to logbook successfully',
    );
  }

  async removeCustomerFromLogbook(logbookId: string, customerId: string) {
    const logbookCustomer = await this.prisma.logbookCustomer.findUnique({
      where: {
        logbookId_customerId: {
          logbookId: logbookId,
          customerId: customerId,
        },
      },
    });

    if (!logbookCustomer) {
      throw this.notFoundError('Customer not found in this logbook');
    }

    await this.prisma.logbookCustomer.delete({
      where: {
        logbookId_customerId: {
          logbookId: logbookId,
          customerId: customerId,
        },
      },
    });

    return this.successResponse(
      null,
      'Customer removed from logbook successfully',
    );
  }

  async getUserPermissions(logbookId: string, userId: string) {
    const userLogbook = await this.prisma.userLogbook.findUnique({
      where: {
        userId_logbookId: {
          userId: userId,
          logbookId: logbookId,
        },
      },
    });

    if (!userLogbook) {
      return {
        canAdd: false,
        canRead: false,
        canUpdate: false,
        canDelete: false,
      };
    }

    return {
      canAdd: userLogbook.canAdd,
      canRead: userLogbook.canRead,
      canUpdate: userLogbook.canUpdate,
      canDelete: userLogbook.canDelete,
    };
  }

  async setUserDefaultLogbook(logbookId: string, userId: string) {
    // First check if the logbook exists
    const logbook = await this.prisma.logbook.findUnique({
      where: { id: logbookId },
    });

    if (!logbook) {
      throw this.notFoundError('Logbook not found');
    }

    // For now, we'll store the default logbook preference in localStorage on frontend
    // In a real application, you might want to add a defaultLogbookId field to the User model
    return this.successResponse(
      { logbookId, userId },
      'Default logbook set successfully',
    );
  }

  async getLogbookCustomersSummary(logbookId: string, userId?: string) {
    // Check if user has access to this logbook (skip for superAdmin)
    if (userId) {
      const userLogbook = await this.prisma.userLogbook.findUnique({
        where: {
          userId_logbookId: {
            userId: userId,
            logbookId: logbookId,
          },
        },
      });

      if (!userLogbook || !userLogbook.canRead) {
        throw this.forbiddenError(
          'You do not have permission to access this logbook',
        );
      }
    }

    // Get all customers in this logbook with their entries
    const logbookCustomers = await this.prisma.logbookCustomer.findMany({
      where: { logbookId },
      include: {
        customer: {
          include: {
            entries: true,
          },
        },
      },
    });

    let totalDebits = 0;
    let totalCredits = 0;

    logbookCustomers.forEach((lc) => {
      lc.customer.entries.forEach((entry) => {
        if (entry.type === 'GAVE') {
          totalDebits += entry.amount;
        } else if (entry.type === 'GOT') {
          totalCredits += entry.amount;
        }
      });
    });

    return this.successResponse({
      totalDebits,
      totalCredits,
    });
  }
}
