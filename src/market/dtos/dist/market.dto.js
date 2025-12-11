"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
exports.UpdateMarketDto = void 0;
var class_validator_1 = require("class-validator");
var UpdateMarketDto = /** @class */ (function () {
    function UpdateMarketDto() {
    }
    __decorate([
        class_validator_1.IsOptional(),
        class_validator_1.IsString()
    ], UpdateMarketDto.prototype, "nameAr");
    __decorate([
        class_validator_1.IsOptional(),
        class_validator_1.IsString()
    ], UpdateMarketDto.prototype, "nameEn");
    __decorate([
        class_validator_1.IsOptional(),
        class_validator_1.IsString()
    ], UpdateMarketDto.prototype, "descriptionAr");
    __decorate([
        class_validator_1.IsOptional(),
        class_validator_1.IsString()
    ], UpdateMarketDto.prototype, "descriptionEn");
    __decorate([
        class_validator_1.IsOptional(),
        class_validator_1.IsString()
    ], UpdateMarketDto.prototype, "zone");
    __decorate([
        class_validator_1.IsOptional(),
        class_validator_1.IsString()
    ], UpdateMarketDto.prototype, "district");
    __decorate([
        class_validator_1.IsOptional(),
        class_validator_1.IsString()
    ], UpdateMarketDto.prototype, "address");
    __decorate([
        class_validator_1.IsOptional(),
        class_validator_1.IsArray()
    ], UpdateMarketDto.prototype, "operations");
    __decorate([
        class_validator_1.IsOptional(),
        class_validator_1.IsArray()
    ], UpdateMarketDto.prototype, "hours");
    __decorate([
        class_validator_1.IsOptional(),
        class_validator_1.IsNumber()
    ], UpdateMarketDto.prototype, "commissionFee");
    __decorate([
        class_validator_1.IsOptional(),
        class_validator_1.IsArray()
    ], UpdateMarketDto.prototype, "location");
    __decorate([
        class_validator_1.IsOptional(),
        class_validator_1.IsNumber()
    ], UpdateMarketDto.prototype, "rate");
    __decorate([
        class_validator_1.IsOptional(),
        class_validator_1.IsBoolean()
    ], UpdateMarketDto.prototype, "isOpen");
    __decorate([
        class_validator_1.IsOptional(),
        class_validator_1.IsDate()
    ], UpdateMarketDto.prototype, "from");
    __decorate([
        class_validator_1.IsOptional(),
        class_validator_1.IsDate()
    ], UpdateMarketDto.prototype, "to");
    __decorate([
        class_validator_1.IsOptional(),
        class_validator_1.IsArray()
    ], UpdateMarketDto.prototype, "categoryIds");
    __decorate([
        class_validator_1.IsOptional(),
        class_validator_1.IsNumber()
    ], UpdateMarketDto.prototype, "limitFees");
    __decorate([
        class_validator_1.IsOptional(),
        class_validator_1.IsNumber()
    ], UpdateMarketDto.prototype, "feePerOrder");
    __decorate([
        class_validator_1.IsOptional(),
        class_validator_1.IsNumber()
    ], UpdateMarketDto.prototype, "currentFees");
    return UpdateMarketDto;
}());
exports.UpdateMarketDto = UpdateMarketDto;
