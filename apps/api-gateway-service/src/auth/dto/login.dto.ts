import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'User password', example: 'strongPassword123' })
  @IsNotEmpty()
  password: string;

  @ApiProperty({
    description: 'Optional one-time password for two-factor authentication',
    example: '123456',
  })
  @IsOptional()
  @IsString()
  otp?: string;
}
