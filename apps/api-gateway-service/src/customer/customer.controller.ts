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
import {
  createSuccessResponse,
  ApiResponse as CustomApiResponse,
} from '../common/api-response.dto';

@ApiTags('Customers')
@Controller('customers')
@ApiBearerAuth()
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @ApiOperation({ summary: 'Get total debits and credits for all customers' })
  @ApiResponse({
    status: 200,
    description: 'Returns total debits and credits',
  })
  @Get('summary')
  async getSummary() {
    const summary = await this.customerService.getTotalDebitsAndCredits();
    console.log('SUMMARY DEBUG:', summary);
    return createSuccessResponse(summary, 'Summary retrieved successfully');
  }

  @ApiOperation({ summary: 'Create a new customer' })
  @ApiResponse({
    status: 201,
    description: 'Customer successfully created',
  })
  @Post()
  async create(@Body() createCustomerDto: CreateCustomerDto) {
    const customer = await this.customerService.create(createCustomerDto);
    return createSuccessResponse(customer, 'Customer successfully created');
  }

  @ApiOperation({ summary: 'Get all customers' })
  @ApiResponse({
    status: 200,
    description: 'Returns all customers with their entries',
  })
  @Get()
  async findAll() {
    const customers = await this.customerService.findAll();
    return createSuccessResponse(customers, 'Customers retrieved successfully');
  }

  @ApiOperation({ summary: 'Get a customer by ID' })
  @ApiResponse({
    status: 200,
    description: 'Returns the customer with entries',
  })
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const customer = await this.customerService.findOne(id);
    return createSuccessResponse(customer, 'Customer retrieved successfully');
  }

  @ApiOperation({ summary: 'Get customer balance' })
  @ApiResponse({
    status: 200,
    description: 'Returns the customer balance',
  })
  @Get(':id/balanceGot')
  async getBalance(@Param('id') id: string) {
    const balance = await this.customerService.getCustomerGOTBalance(id);
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
  @Get(':id/balanceGave')
  async getGaveBalance(@Param('id') id: string) {
    const balance = await this.customerService.getCustomerGAVEBalance(id);
    return createSuccessResponse(
      balance,
      'Customer GAVE balance retrieved successfully',
    );
  }

  @ApiOperation({ summary: 'Update a customer' })
  @ApiResponse({
    status: 200,
    description: 'Customer successfully updated',
  })
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateCustomerDto: UpdateCustomerDto,
  ) {
    const customer = await this.customerService.update(id, updateCustomerDto);
    return createSuccessResponse(customer, 'Customer updated successfully');
  }

  @ApiOperation({ summary: 'Delete a customer' })
  @ApiResponse({
    status: 200,
    description: 'Customer successfully deleted',
  })
  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.customerService.remove(id);
    return createSuccessResponse(null, 'Customer deleted successfully');
  }
}
