// product.controller.ts - Product Controller with Swagger
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  UsePipes,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { ProductService } from './product.service';
import type { CreateProductDto, UpdateProductDto } from './dto/product.dto';
import { CreateProductSchema, UpdateProductSchema } from './dto/product.dto';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { Public } from '../../common/decorators/public.decorator';
import { AdminGuard } from '../../common/guards/admin.guard';

@ApiTags('Products')
@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'Get all products (with optional filters)' })
  @ApiQuery({ name: 'category', required: false, description: 'Filter by category (shoes, men, women, kids, sports, accessories)' })
  @ApiQuery({ name: 'name', required: false, description: 'Search by product name' })
  @ApiResponse({
    status: 200,
    description: 'List of all products',
  })
  async findAll(
    @Query('category') category?: string,
    @Query('name') name?: string,
    @Query('sort') sort?: string,
  ) {
    return this.productService.findAll({ category, name, sort });
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get product by ID' })
  @ApiParam({ name: 'id', type: 'number' })
  @ApiResponse({ status: 200, description: 'Product found' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productService.findOne(id);
  }

  @Post()
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @UsePipes(new ZodValidationPipe(CreateProductSchema))
  @ApiOperation({ summary: 'Create a new product (Admin)' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'Product Name' },
        description: { type: 'string', example: 'Product description' },
        price: { type: 'number', example: 50000 },
        stock: { type: 'number', example: 100 },
        imageUrl: { type: 'string', example: 'https://example.com/image.jpg' },
      },
      required: ['name', 'price', 'stock'],
    },
  })
  @ApiResponse({ status: 201, description: 'Product created' })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async create(@Body() createProductDto: CreateProductDto) {
    return this.productService.create(createProductDto);
  }

  @Put(':id')
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @UsePipes(new ZodValidationPipe(UpdateProductSchema))
  @ApiOperation({ summary: 'Update product (Admin)' })
  @ApiParam({ name: 'id', type: 'number' })
  @ApiResponse({ status: 200, description: 'Product updated' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return this.productService.update(id, updateProductDto);
  }

  @Delete(':id')
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete product (Admin)' })
  @ApiParam({ name: 'id', type: 'number' })
  @ApiResponse({ status: 200, description: 'Product deleted' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.productService.remove(id);
  }
}
