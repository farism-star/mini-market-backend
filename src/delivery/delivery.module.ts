import { Module } from "@nestjs/common";
import { DeliveryController } from "./delivery.controller";
import { DeliveryService } from "./delivery.service";
import { PrismaService } from "src/prisma/prisma.service";

@Module({
  controllers: [DeliveryController],
  providers: [DeliveryService, PrismaService],
})
export class DeliveryModule {}
