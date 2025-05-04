import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Patch,
} from '@nestjs/common';
import { InventoryService } from './inventory.service';
import {
  CheckStockDto,
  SetStockAlertThresholdDto,
  UpdateStockDto,
} from './dto/inventory.dto';
import { JwtAuthGuard, RolesGuard, Roles } from '@org/auth';
import { UserRole } from '@prisma/client';

@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Patch('products/:id/stock')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  updateStock(@Param('id') id: string, @Body() updateStockDto: UpdateStockDto) {
    return this.inventoryService.updateStock(id, updateStockDto);
  }

  @Post('products/:id/check-stock')
  @UseGuards(JwtAuthGuard)
  checkStock(@Param('id') id: string, @Body() checkStockDto: CheckStockDto) {
    return this.inventoryService.checkStock(id, checkStockDto);
  }

  @Patch('products/:id/alert-threshold')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  setStockAlertThreshold(
    @Param('id') id: string,
    @Body() setStockAlertThresholdDto: SetStockAlertThresholdDto
  ) {
    return this.inventoryService.setStockAlertThreshold(
      id,
      setStockAlertThresholdDto
    );
  }

  @Get('products/:id/stock')
  @UseGuards(JwtAuthGuard)
  getProductStock(@Param('id') id: string) {
    return this.inventoryService.getProductStock(id);
  }

  @Get('products')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  getAllProductsStock(
    @Query('page') page = '1',
    @Query('limit') limit = '10',
    @Query('search') search?: string
  ) {
    return this.inventoryService.getAllProductsStock(+page, +limit, search);
  }

  @Get('low-stock')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  getLowStockProducts() {
    return this.inventoryService.getLowStockProducts();
  }
}
