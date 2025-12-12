import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  Req,
  UseGuards,
  UploadedFile,
  UseInterceptors
} from "@nestjs/common";
import { DeliveryService } from "./delivery.service";
import { CreateDeliveryDto } from "./dtos/create-delivery.dto";
import { UpdateDeliveryDto } from "./dtos/update-delivery.dto";
import { AuthGuard } from "@nestjs/passport";
import { RolesGuard } from "src/auth/roles.gaurd";
import { Roles } from "src/auth/Role.decorator";
import { Role } from "src/auth/roles.enum";
import { FileInterceptor } from "@nestjs/platform-express";
import { multerConfig } from '../upload/multer.config';
@Controller({
  path: "delivery",
  version: "1",
})
@UseGuards(AuthGuard("jwt"), RolesGuard)
export class DeliveryController {
  constructor(private deliveryService: DeliveryService) {}

  // OWNER: Create delivery + upload image
  @Roles(Role.OWNER)
  @Post("create")
  @UseInterceptors(FileInterceptor("image", multerConfig))
  create(
    @Req() req: any,
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: CreateDeliveryDto
  ) {
    const imageUrl = file ? `/uploads/${file.filename}` : undefined;
    return this.deliveryService.createDelivery(dto, req.user.id, req.user.type, imageUrl);
  }

  // OWNER: list my deliveries
  @Roles(Role.OWNER)
  @Get("me")
  getMine(@Req() req: any) {
    return this.deliveryService.getMyDeliveries(req.user.id, req.user.type);
  }

  // ADMIN: list all deliveries
  @Roles(Role.ADMIN)
  @Get("all")
  getAll() {
    return this.deliveryService.getAll();
  }

  // Update delivery (ADMIN or OWNER) + optional upload
  @Roles(Role.ADMIN, Role.OWNER)
  @Patch(":id")
  @UseInterceptors(FileInterceptor("image", multerConfig))
  update(
    @Param("id") id: string,
    @Req() req: any,
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UpdateDeliveryDto
  ) {
    const imageUrl = file ? `/uploads/${file.filename}` : undefined;
    return this.deliveryService.updateDelivery(id, dto, req.user, imageUrl);
  }

  // Delete delivery
  @Roles(Role.ADMIN, Role.OWNER)
  @Delete(":id")
  delete(@Param("id") id: string, @Req() req: any) {
    return this.deliveryService.deleteDelivery(id, req.user);
  }
}
