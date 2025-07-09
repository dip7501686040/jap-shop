import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
  ForbiddenException,
} from '@nestjs/common';
import { LogbookService } from './logbook.service';
import {
  CreateLogbookDto,
  UpdateLogbookDto,
  LogbookPermissionDto,
  AddCustomerToLogbookDto,
  LogbookQueryDto,
} from './dto/logbook.dto';
import { AuthGuard } from '../auth/auth.guard';

@Controller('logbooks')
@UseGuards(AuthGuard)
export class LogbookController {
  constructor(private readonly logbookService: LogbookService) {}

  @Get()
  async findAll(@Query() query: LogbookQueryDto, @Request() req) {
    const user = req.user;
    // Super admin can see all logbooks, others only see their assigned logbooks
    const userId = user.role === 'superAdmin' ? undefined : user.id;
    return this.logbookService.findAll(query, userId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req) {
    const user = req.user;
    // Super admin can see any logbook, others only see their assigned logbooks
    const userId = user.role === 'superAdmin' ? undefined : user.id;
    return this.logbookService.findOne(id, userId);
  }

  @Post()
  async create(@Body() createLogbookDto: CreateLogbookDto, @Request() req) {
    const user = req.user;
    if (user.role !== 'superAdmin') {
      throw new ForbiddenException('Only superAdmin can create logbooks');
    }
    return this.logbookService.create(createLogbookDto);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateLogbookDto: UpdateLogbookDto,
    @Request() req,
  ) {
    const user = req.user;
    if (user.role !== 'superAdmin') {
      throw new ForbiddenException('Only superAdmin can update logbooks');
    }
    return this.logbookService.update(id, updateLogbookDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req) {
    const user = req.user;
    if (user.role !== 'superAdmin') {
      throw new ForbiddenException('Only superAdmin can delete logbooks');
    }
    return this.logbookService.remove(id);
  }

  // User Permission Management Routes
  @Post(':id/permissions')
  async setUserPermissions(
    @Param('id') logbookId: string,
    @Body() permissionDto: LogbookPermissionDto,
    @Request() req,
  ) {
    const user = req.user;
    if (user.role !== 'superAdmin') {
      throw new ForbiddenException('Only superAdmin can set user permissions');
    }
    return this.logbookService.setUserPermissions(logbookId, permissionDto);
  }

  @Delete(':id/permissions/:userId')
  async removeUserPermissions(
    @Param('id') logbookId: string,
    @Param('userId') userId: string,
    @Request() req,
  ) {
    const user = req.user;
    if (user.role !== 'superAdmin') {
      throw new ForbiddenException(
        'Only superAdmin can remove user permissions',
      );
    }
    return this.logbookService.removeUserPermissions(logbookId, userId);
  }

  @Get(':id/permissions/:userId')
  async getUserPermissions(
    @Param('id') logbookId: string,
    @Param('userId') userId: string,
  ) {
    return this.logbookService.getUserPermissions(logbookId, userId);
  }

  // Customer Management Routes
  @Get(':id/customers')
  async getLogbookCustomers(
    @Param('id') logbookId: string,
    @Query() query: LogbookQueryDto,
    @Request() req,
  ) {
    const user = req.user;
    const userId = user.role === 'superAdmin' ? undefined : user.id;
    return this.logbookService.getLogbookCustomers(logbookId, query, userId);
  }

  @Post(':id/customers')
  async addCustomerToLogbook(
    @Param('id') logbookId: string,
    @Body() addCustomerDto: AddCustomerToLogbookDto,
    @Request() req,
  ) {
    const user = req.user;

    // Check if user has permission to add customers to this logbook
    if (user.role !== 'superAdmin') {
      const permissions = await this.logbookService.getUserPermissions(
        logbookId,
        user.id,
      );
      if (!permissions.canAdd) {
        throw new ForbiddenException(
          'You do not have permission to add customers to this logbook',
        );
      }
    }

    return this.logbookService.addCustomerToLogbook(logbookId, addCustomerDto);
  }

  @Delete(':id/customers/:customerId')
  async removeCustomerFromLogbook(
    @Param('id') logbookId: string,
    @Param('customerId') customerId: string,
    @Request() req,
  ) {
    const user = req.user;

    // Check if user has permission to remove customers from this logbook
    if (user.role !== 'superAdmin') {
      const permissions = await this.logbookService.getUserPermissions(
        logbookId,
        user.id,
      );
      if (!permissions.canDelete) {
        throw new ForbiddenException(
          'You do not have permission to remove customers from this logbook',
        );
      }
    }

    return this.logbookService.removeCustomerFromLogbook(logbookId, customerId);
  }

  @Post(':id/set-default')
  async setDefaultLogbook(@Param('id') logbookId: string, @Request() req) {
    const user = req.user;
    if (user.role !== 'superAdmin') {
      throw new ForbiddenException('Only superAdmin can set default logbook');
    }
    return this.logbookService.setUserDefaultLogbook(logbookId, user.id);
  }

  @Get(':id/customers/summary')
  async getLogbookCustomersSummary(
    @Param('id') logbookId: string,
    @Request() req,
  ) {
    const user = req.user;
    const userId = user.role === 'superAdmin' ? undefined : user.id;
    return this.logbookService.getLogbookCustomersSummary(logbookId, userId);
  }
}
