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
  ApiParam,
} from '@nestjs/swagger';
import { MenuService } from './menu.service';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
import {
  createSuccessResponse,
  ApiResponse as CustomApiResponse,
} from '../common/api-response.dto';

@ApiTags('Menus')
@Controller('menus')
@ApiBearerAuth()
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  @ApiOperation({ summary: 'Create a new menu' })
  @ApiResponse({
    status: 201,
    description: 'Menu successfully created',
  })
  @Post()
  async create(@Body() createMenuDto: CreateMenuDto) {
    const menu = await this.menuService.create(createMenuDto);
    return createSuccessResponse(menu, 'Menu successfully created');
  }

  @ApiOperation({ summary: 'Get all menus' })
  @ApiResponse({
    status: 200,
    description: 'Returns all menus with their role assignments',
  })
  @Get()
  async findAll() {
    const menus = await this.menuService.findAll();
    return createSuccessResponse(menus, 'Menus retrieved successfully');
  }

  @ApiOperation({ summary: 'Get menus by role ID' })
  @ApiParam({ name: 'roleId', description: 'Role ID' })
  @ApiResponse({
    status: 200,
    description: 'Returns menus accessible by the role',
  })
  @Get('role/:roleId')
  async findByRole(@Param('roleId') roleId: string) {
    const menus = await this.menuService.findByRole(roleId);
    return createSuccessResponse(menus, 'Role menus retrieved successfully');
  }

  @ApiOperation({ summary: 'Get a menu by ID' })
  @ApiParam({ name: 'id', description: 'Menu ID' })
  @ApiResponse({
    status: 200,
    description: 'Returns the menu with role assignments',
  })
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const menu = await this.menuService.findOne(id);
    return createSuccessResponse(menu, 'Menu retrieved successfully');
  }

  @ApiOperation({ summary: 'Update a menu' })
  @ApiParam({ name: 'id', description: 'Menu ID' })
  @ApiResponse({
    status: 200,
    description: 'Menu successfully updated',
  })
  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateMenuDto: UpdateMenuDto) {
    const menu = await this.menuService.update(id, updateMenuDto);
    return createSuccessResponse(menu, 'Menu updated successfully');
  }

  @ApiOperation({ summary: 'Delete a menu' })
  @ApiParam({ name: 'id', description: 'Menu ID' })
  @ApiResponse({
    status: 200,
    description: 'Menu successfully deleted',
  })
  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.menuService.remove(id);
    return createSuccessResponse(null, 'Menu deleted successfully');
  }

  @ApiOperation({ summary: 'Assign menu to role' })
  @ApiParam({ name: 'menuId', description: 'Menu ID' })
  @ApiParam({ name: 'roleId', description: 'Role ID' })
  @ApiResponse({
    status: 200,
    description: 'Menu successfully assigned to role',
  })
  @Post(':menuId/assign/:roleId')
  async assignMenuToRole(
    @Param('menuId') menuId: string,
    @Param('roleId') roleId: string,
  ) {
    const result = await this.menuService.assignMenuToRole(menuId, roleId);
    return createSuccessResponse(result, result.message);
  }

  @ApiOperation({ summary: 'Remove menu from role' })
  @ApiParam({ name: 'menuId', description: 'Menu ID' })
  @ApiParam({ name: 'roleId', description: 'Role ID' })
  @ApiResponse({
    status: 200,
    description: 'Menu successfully removed from role',
  })
  @Delete(':menuId/assign/:roleId')
  async removeMenuFromRole(
    @Param('menuId') menuId: string,
    @Param('roleId') roleId: string,
  ) {
    const result = await this.menuService.removeMenuFromRole(menuId, roleId);
    return createSuccessResponse(result, result.message);
  }
}
