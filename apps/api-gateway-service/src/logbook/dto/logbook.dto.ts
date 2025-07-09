import { IsString, IsOptional, IsUUID, IsBoolean } from 'class-validator';

export class CreateLogbookDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;
}

export class UpdateLogbookDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;
}

export class LogbookPermissionDto {
  @IsString()
  userId: string;

  @IsBoolean()
  canAdd: boolean;

  @IsBoolean()
  canRead: boolean;

  @IsBoolean()
  canUpdate: boolean;

  @IsBoolean()
  canDelete: boolean;
}

export class AddCustomerToLogbookDto {
  @IsString()
  customerId: string;
}

export class LogbookQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  page?: string = '1';

  @IsOptional()
  @IsString()
  limit?: string = '10';
}
