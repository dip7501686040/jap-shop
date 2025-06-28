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

@ApiTags('Roles')
@Controller('roles')
@ApiBearerAuth()
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @ApiOperation({ summary: 'Create a new role' })
  @ApiResponse({ status: 201, description: 'Role successfully created' })
  @Post()
  create(@Body() createRoleDto: any) {
    return this.roleService.create(createRoleDto);
  }

  @ApiOperation({ summary: 'Get all roles' })
  @ApiResponse({ status: 200, description: 'Returns all roles' })
  @Get()
  findAll() {
    return this.roleService.findAll();
  }

  @ApiOperation({ summary: 'Get role by ID' })
  @ApiResponse({ status: 200, description: 'Returns a role by ID' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.roleService.findOne(id);
  }

  @ApiOperation({ summary: 'Update a role' })
  @ApiResponse({ status: 200, description: 'Role updated successfully' })
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRoleDto: any) {
    return this.roleService.update(id, updateRoleDto);
  }

  @ApiOperation({ summary: 'Delete a role' })
  @ApiResponse({ status: 200, description: 'Role deleted successfully' })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.roleService.remove(id);
  }
}
