import {
  Controller,
  Get,
  Param,
  Body,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { UpdateOrderStatusDto } from './dto/order.dto';
import { JwtAuthGuard, RolesGuard, Roles } from '@org/auth';
import { UserRole } from '@prisma/client';

@Controller('orders')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  findAll(@Query('page') page = '1', @Query('limit') limit = '10') {
    return this.ordersService.findAll(+page, +limit);
  }

  @Get('stats')
  getOrderStats() {
    return this.ordersService.getOrderStats();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(id);
  }

  @Put(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() updateOrderStatusDto: UpdateOrderStatusDto
  ) {
    return this.ordersService.updateStatus(id, updateOrderStatusDto);
  }
}
