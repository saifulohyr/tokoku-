// order.controller.ts - Order Controller with Swagger
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import { OrderService } from './order.service';
import type { CreateOrderDto } from './dto/order.dto';
import { CurrentUser } from '../../common/decorators/user.decorator';
import type { JwtPayload } from '../../common/decorators/user.decorator';

@ApiTags('Orders')
@ApiBearerAuth()
@Controller('orders')
export class OrderController {
  private readonly logger = new Logger(OrderController.name);
  
  constructor(private readonly orderService: OrderService) {
    this.logger.log('OrderController initialized');
  }

  @Post()
  @ApiOperation({ summary: 'Create a new order (Saga orchestration)' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        items: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              productId: { type: 'number', example: 1 },
              quantity: { type: 'number', example: 2 },
            },
            required: ['productId', 'quantity'],
          },
        },
      },
      required: ['items'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Order created successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            id: { type: 'number' },
            totalPrice: { type: 'number' },
            status: { type: 'string' },
            snapToken: { type: 'string' },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Insufficient stock or payment failed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async create(
    @CurrentUser() user: JwtPayload,
    @Body() createOrderDto: CreateOrderDto,
  ) {
    this.logger.log(`POST /orders received - User: ${user?.sub}, Body: ${JSON.stringify(createOrderDto)}`);
    
    // Manual validation for better error messages
    if (!createOrderDto || !createOrderDto.items) {
      throw new BadRequestException('items field is required');
    }
    
    if (!Array.isArray(createOrderDto.items)) {
      throw new BadRequestException('items must be an array');
    }
    
    if (createOrderDto.items.length === 0) {
      throw new BadRequestException('Order must contain at least one item');
    }
    
    // Validate each item
    for (const item of createOrderDto.items) {
      if (!item.productId || typeof item.productId !== 'number') {
        throw new BadRequestException('Each item must have a valid productId');
      }
      if (!item.quantity || typeof item.quantity !== 'number' || item.quantity < 1) {
        throw new BadRequestException('Each item must have a valid quantity >= 1');
      }
    }
    
    return this.orderService.createOrder(user.sub, createOrderDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get current user orders' })
  @ApiResponse({ status: 200, description: 'List of user orders' })
  async findAll(@CurrentUser() user: JwtPayload) {
    return this.orderService.findUserOrders(user.sub);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get order by ID' })
  @ApiParam({ name: 'id', type: 'number' })
  @ApiResponse({ status: 200, description: 'Order details' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async findOne(
    @CurrentUser() user: JwtPayload,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.orderService.findOne(user.sub, id);
  }
}
