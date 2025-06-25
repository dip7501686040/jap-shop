import { IsString, IsNumber, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum EntryType {
  GAVE = 'GAVE',
  GOT = 'GOT',
}

export class CreateEntryDto {
  @ApiProperty({
    description: 'Entry type',
    enum: EntryType,
    example: EntryType.GOT,
  })
  @IsEnum(EntryType)
  type: EntryType;

  @ApiProperty({ description: 'Entry amount' })
  @IsNumber()
  amount: number;

  @ApiProperty({ description: 'Customer ID' })
  @IsString()
  customerId: string;
}
