import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { EntryService } from './entry.service';
import { CreateEntryDto } from './dto/create-entry.dto';
import { UpdateEntryDto } from './dto/update-entry.dto';
import { createSuccessResponse } from '../common/api-response.dto';

@ApiTags('Entries')
@Controller('entries')
@ApiBearerAuth()
export class EntryController {
  constructor(private readonly entryService: EntryService) {}

  @ApiOperation({ summary: 'Create a new entry' })
  @ApiResponse({
    status: 201,
    description: 'Entry successfully created',
  })
  @Post()
  async create(@Body() createEntryDto: CreateEntryDto) {
    const entry = await this.entryService.create(createEntryDto);
    return createSuccessResponse(entry, 'Entry successfully created');
  }

  @ApiOperation({ summary: 'Get all entries' })
  @ApiResponse({
    status: 200,
    description: 'Returns all entries with customer details',
  })
  @ApiQuery({
    name: 'customerId',
    required: false,
    description: 'Filter by customer ID',
  })
  @Get()
  async findAll(@Query('customerId') customerId?: string) {
    if (customerId) {
      const entries = await this.entryService.findByCustomer(customerId);
      return createSuccessResponse(
        entries,
        'Customer entries retrieved successfully',
      );
    }
    const entries = await this.entryService.findAll();
    return createSuccessResponse(entries, 'All entries retrieved successfully');
  }

  @ApiOperation({ summary: 'Get an entry by ID' })
  @ApiResponse({
    status: 200,
    description: 'Returns the entry with customer details',
  })
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const entry = await this.entryService.findOne(id);
    return createSuccessResponse(entry, 'Entry retrieved successfully');
  }

  @ApiOperation({ summary: 'Get entries by customer ID' })
  @ApiResponse({
    status: 200,
    description: 'Returns all entries for a specific customer',
  })
  @Get('customer/:customerId')
  async findByCustomer(@Param('customerId') customerId: string) {
    const entries = await this.entryService.findByCustomer(customerId);
    return createSuccessResponse(
      entries,
      'Customer entries retrieved successfully',
    );
  }

  @ApiOperation({ summary: 'Get customer GOT balance' })
  @ApiResponse({
    status: 200,
    description: 'Returns the customer GOT balance',
  })
  @Get('customer/:customerId/got-balance')
  async getGotBalance(@Param('customerId') customerId: string) {
    const balance = await this.entryService.getCustomerGOTBalance(customerId);
    return createSuccessResponse(
      balance,
      'Customer GOT balance retrieved successfully',
    );
  }

  @ApiOperation({ summary: 'Get customer GAVE balance' })
  @ApiResponse({
    status: 200,
    description: 'Returns the customer GAVE balance',
  })
  @Get('customer/:customerId/gave-balance')
  async getGaveBalance(@Param('customerId') customerId: string) {
    const balance = await this.entryService.getCustomerGAVEBalance(customerId);
    return createSuccessResponse(
      balance,
      'Customer GAVE balance retrieved successfully',
    );
  }

  @ApiOperation({ summary: 'Update an entry' })
  @ApiResponse({
    status: 200,
    description: 'Entry successfully updated',
  })
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateEntryDto: UpdateEntryDto,
  ) {
    const entry = await this.entryService.update(id, updateEntryDto);
    return createSuccessResponse(entry, 'Entry updated successfully');
  }

  @ApiOperation({ summary: 'Delete an entry' })
  @ApiResponse({
    status: 200,
    description: 'Entry successfully deleted',
  })
  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.entryService.remove(id);
    return createSuccessResponse(null, 'Entry deleted successfully');
  }
}
