import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { RoleService } from './role.service';
import { createSuccessResponse } from '../common/api-response.dto';

@ApiTags('Roles')
@Controller('roles')
@ApiBearerAuth()
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @ApiOperation({ summary: 'Create a new role' })
  @ApiResponse({ status: 201, description: 'Role successfully created' })
  @Post()
  async create(@Body() createRoleDto: any) {
    const role = await this.roleService.create(createRoleDto);
    return createSuccessResponse(role, 'Role successfully created');
  }

  @ApiOperation({ summary: 'Get all roles' })
  @ApiResponse({ status: 200, description: 'Returns all roles' })
  @Get()
  async findAll() {
    const roles = await this.roleService.findAll();
    return createSuccessResponse(roles, 'Roles retrieved successfully');
  }

  @ApiOperation({ summary: 'Get role by ID' })
  @ApiResponse({ status: 200, description: 'Returns a role by ID' })
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const role = await this.roleService.findOne(id);
    return createSuccessResponse(role, 'Role retrieved successfully');
  }

  @ApiOperation({ summary: 'Update a role' })
  @ApiResponse({ status: 200, description: 'Role updated successfully' })
  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateRoleDto: any) {
    const role = await this.roleService.update(id, updateRoleDto);
    return createSuccessResponse(role, 'Role updated successfully');
  }

  @ApiOperation({ summary: 'Delete a role' })
  @ApiResponse({ status: 200, description: 'Role deleted successfully' })
  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.roleService.remove(id);
    return createSuccessResponse(null, 'Role deleted successfully');
  }
}
