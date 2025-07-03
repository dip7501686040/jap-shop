import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsInt,
  IsBoolean,
  IsArray,
} from 'class-validator';

export class CreateMenuDto {
  @ApiProperty({ description: 'Menu name', example: 'Dashboard' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Menu href/path', example: '/dashboard' })
  @IsString()
  href: string;

  @ApiProperty({
    description: 'Menu icon',
    example: 'dashboard-icon',
    required: false,
  })
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiProperty({ description: 'Menu order', example: 1, default: 0 })
  @IsOptional()
  @IsInt()
  order?: number;

  @ApiProperty({ description: 'Is menu active', example: true, default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ description: 'Parent menu ID', required: false })
  @IsOptional()
  @IsString()
  parentId?: string;

  @ApiProperty({
    description: 'Role IDs that have access to this menu',
    type: [String],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  roleIds?: string[];
}
