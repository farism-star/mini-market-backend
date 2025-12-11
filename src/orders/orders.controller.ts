import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dtos/create-order.dto';
import { UpdateOrderDto } from './dtos/update-order.dto';
import { Request } from 'express';
import { AuthGuard } from "@nestjs/passport";
import { RolesGuard } from "src/auth/roles.gaurd";
import { Roles } from "src/auth/Role.decorator";
import { Role } from "src/auth/roles.enum";
@Controller(
  {
    path:'orders',
    version:'1'
    
  }
)
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

 @Roles(Role.OWNER,Role.CLIENT,Role.ADMIN)
  @Post()
  async create(@Body() createOrderDto: CreateOrderDto, @Req() req: Request) {
    const user = (req as any).user ; // check your app's user shape
    return this.ordersService.create(createOrderDto, user);
  }

 @Roles(Role.OWNER,Role.CLIENT,Role.ADMIN)
  @Get()
  async findAll(@Req() req: Request) {
    const user = (req as any).user ;
    return this.ordersService.findAll(user);
  }

 @Roles(Role.OWNER,Role.CLIENT,Role.ADMIN)
  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: Request) {
    const user = (req as any).user ;
    return this.ordersService.findOne(id, user);
  }

 @Roles(Role.OWNER,Role.CLIENT,Role.ADMIN)
  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateDto: UpdateOrderDto, @Req() req: Request) {
    const user = (req as any).user ;
    return this.ordersService.update(id, updateDto, user);
  }

 @Roles(Role.OWNER,Role.CLIENT,Role.ADMIN)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string, @Req() req: Request) {
    const user = (req as any).user ;
    await this.ordersService.remove(id, user);
  }



  @Delete('delete-all')
  async deleteAllOrders(){
    await this.ordersService.removeAll
  }



}
