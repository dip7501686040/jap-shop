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
  create(@Body() createEntryDto: CreateEntryDto) {
    return this.entryService.create(createEntryDto);
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
  findAll(@Query('customerId') customerId?: string) {
    if (customerId) {
      return this.entryService.findByCustomer(customerId);
    }
    return this.entryService.findAll();
  }

  @ApiOperation({ summary: 'Get an entry by ID' })
  @ApiResponse({
    status: 200,
    description: 'Returns the entry with customer details',
  })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.entryService.findOne(id);
  }

  @ApiOperation({ summary: 'Get entries by customer ID' })
  @ApiResponse({
    status: 200,
    description: 'Returns all entries for a specific customer',
  })
  @Get('customer/:customerId')
  findByCustomer(@Param('customerId') customerId: string) {
    return this.entryService.findByCustomer(customerId);
  }

  @ApiOperation({ summary: 'Get customer GOT balance' })
  @ApiResponse({
    status: 200,
    description: 'Returns the customer GOT balance',
  })
  @Get('customer/:customerId/got-balance')
  getGotBalance(@Param('customerId') customerId: string) {
    return this.entryService.getCustomerGOTBalance(customerId);
  }

  @ApiOperation({ summary: 'Get customer GAVE balance' })
  @ApiResponse({
    status: 200,
    description: 'Returns the customer GAVE balance',
  })
  @Get('customer/:customerId/gave-balance')
  getGaveBalance(@Param('customerId') customerId: string) {
    return this.entryService.getCustomerGAVEBalance(customerId);
  }

  @ApiOperation({ summary: 'Update an entry' })
  @ApiResponse({
    status: 200,
    description: 'Entry successfully updated',
  })
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateEntryDto: UpdateEntryDto) {
    return this.entryService.update(id, updateEntryDto);
  }

  @ApiOperation({ summary: 'Delete an entry' })
  @ApiResponse({
    status: 200,
    description: 'Entry successfully deleted',
  })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.entryService.remove(id);
  }
}
