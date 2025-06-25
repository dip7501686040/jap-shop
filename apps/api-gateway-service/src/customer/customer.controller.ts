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
import { CustomerService } from './customer.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@ApiTags('Customers')
@Controller('customers')
@ApiBearerAuth()
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @ApiOperation({ summary: 'Create a new customer' })
  @ApiResponse({
    status: 201,
    description: 'Customer successfully created',
  })
  @Post()
  create(@Body() createCustomerDto: CreateCustomerDto) {
    return this.customerService.create(createCustomerDto);
  }

  @ApiOperation({ summary: 'Get all customers' })
  @ApiResponse({
    status: 200,
    description: 'Returns all customers with their entries',
  })
  @Get()
  findAll() {
    return this.customerService.findAll();
  }

  @ApiOperation({ summary: 'Get a customer by ID' })
  @ApiResponse({
    status: 200,
    description: 'Returns the customer with entries',
  })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.customerService.findOne(id);
  }

  @ApiOperation({ summary: 'Get customer balance' })
  @ApiResponse({
    status: 200,
    description: 'Returns the customer balance',
  })
  @Get(':id/balanceGot')
  getBalance(@Param('id') id: string) {
    return this.customerService.getCustomerGOTBalance(id);
  }
  @ApiOperation({ summary: 'Get customer GAVE balance' })
  @ApiResponse({
    status: 200,
    description: 'Returns the customer GAVE balance',
  })
  @Get(':id/balanceGave')
  getGaveBalance(@Param('id') id: string) {
    return this.customerService.getCustomerGAVEBalance(id);
  }

  @ApiOperation({ summary: 'Update a customer' })
  @ApiResponse({
    status: 200,
    description: 'Customer successfully updated',
  })
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCustomerDto: UpdateCustomerDto,
  ) {
    return this.customerService.update(id, updateCustomerDto);
  }

  @ApiOperation({ summary: 'Delete a customer' })
  @ApiResponse({
    status: 200,
    description: 'Customer successfully deleted',
  })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.customerService.remove(id);
  }
}
