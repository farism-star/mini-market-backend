"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
exports.CreateOrderDto = void 0;
var class_validator_1 = require("class-validator");
var client_1 = require("@prisma/client"); // prisma enum types if available
var CreateOrderDto = /** @class */ (function () {
    function CreateOrderDto() {
    }
    __decorate([
        class_validator_1.IsOptional(),
        class_validator_1.IsString()
    ], CreateOrderDto.prototype, "orderId");
    __decorate([
        class_validator_1.IsOptional(),
        class_validator_1.IsString()
    ], CreateOrderDto.prototype, "deliveryId");
    __decorate([
        class_validator_1.IsOptional(),
        class_validator_1.IsString()
    ], CreateOrderDto.prototype, "clientId");
    __decorate([
        class_validator_1.IsOptional(),
        class_validator_1.IsString()
    ], CreateOrderDto.prototype, "marketId");
    __decorate([
        class_validator_1.IsOptional(),
        class_validator_1.IsString()
    ], CreateOrderDto.prototype, "deliveryAddress");
    __decorate([
        class_validator_1.IsOptional(),
        class_validator_1.IsDateString()
    ], CreateOrderDto.prototype, "date");
    __decorate([
        class_validator_1.IsOptional(),
        class_validator_1.IsDateString()
    ], CreateOrderDto.prototype, "time");
    __decorate([
        class_validator_1.IsOptional(),
        class_validator_1.IsEnum(client_1.OrderStatus)
    ], CreateOrderDto.prototype, "status");
    return CreateOrderDto;
}());
exports.CreateOrderDto = CreateOrderDto;
