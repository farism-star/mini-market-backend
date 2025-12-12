"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
exports.DeliveryModule = void 0;
var common_1 = require("@nestjs/common");
var delivery_controller_1 = require("./delivery.controller");
var delivery_service_1 = require("./delivery.service");
var prisma_service_1 = require("src/prisma/prisma.service");
var DeliveryModule = /** @class */ (function () {
    function DeliveryModule() {
    }
    DeliveryModule = __decorate([
        common_1.Module({
            controllers: [delivery_controller_1.DeliveryController],
            providers: [delivery_service_1.DeliveryService, prisma_service_1.PrismaService]
        })
    ], DeliveryModule);
    return DeliveryModule;
}());
exports.DeliveryModule = DeliveryModule;
