// admin.controller.ts - Admin Controller with User/Order/Stats endpoints
import {
  Controller,
  Get,
  Put,
  Delete,
  Param,
  Body,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { CurrentUser } from '../../common/decorators/user.decorator';
import type { JwtPayload } from '../../common/decorators/user.decorator';
import { AdminGuard } from '../../common/guards/admin.guard';

@ApiTags('Admin')
@ApiBearerAuth()
@Controller('admin')
@UseGuards(AdminGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // ============================================
  // USER MANAGEMENT
  // ============================================

  @Get('users')
  @ApiOperation({ summary: 'Get all users (Admin only)' })
  @ApiResponse({ status: 200, description: 'List of all users' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  async findAllUsers() {
    return this.adminService.findAllUsers();
  }

  @Put('users/:id/role')
  @ApiOperation({ summary: 'Update user role (Admin only)' })
  @ApiParam({ name: 'id', type: 'number' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        role: { type: 'string', enum: ['user', 'admin'], example: 'admin' },
      },
      required: ['role'],
    },
  })
  @ApiResponse({ status: 200, description: 'User role updated' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async updateUserRole(
    @Param('id', ParseIntPipe) id: number,
    @Body('role') role: string,
    @CurrentUser() admin: JwtPayload,
  ) {
    return this.adminService.updateUserRole(id, role, admin.sub);
  }

  @Delete('users/:id')
  @ApiOperation({ summary: 'Delete user (Admin only)' })
  @ApiParam({ name: 'id', type: 'number' })
  @ApiResponse({ status: 200, description: 'User deleted' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async deleteUser(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() admin: JwtPayload,
  ) {
    return this.adminService.deleteUser(id, admin.sub);
  }

  // ============================================
  // ORDER MANAGEMENT
  // ============================================

  @Get('orders')
  @ApiOperation({ summary: 'Get all orders (Admin only)' })
  @ApiResponse({ status: 200, description: 'List of all orders' })
  async findAllOrders() {
    return this.adminService.findAllOrders();
  }

  // ============================================
  // DASHBOARD STATS
  // ============================================

  @Get('stats')
  @ApiOperation({ summary: 'Get dashboard statistics (Admin only)' })
  @ApiResponse({ status: 200, description: 'Dashboard statistics' })
  async getStats() {
    return this.adminService.getStats();
  }
}
