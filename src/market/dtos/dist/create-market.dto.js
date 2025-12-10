"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
exports.CreateMarketDto = void 0;
var class_validator_1 = require("class-validator");
var CreateMarketDto = /** @class */ (function () {
    function CreateMarketDto() {
    }
    __decorate([
        class_validator_1.IsOptional(),
        class_validator_1.IsString()
    ], CreateMarketDto.prototype, "nameAr");
    __decorate([
        class_validator_1.IsOptional(),
        class_validator_1.IsString()
    ], CreateMarketDto.prototype, "nameEn");
    __decorate([
        class_validator_1.IsOptional(),
        class_validator_1.IsString()
    ], CreateMarketDto.prototype, "descriptionAr");
    __decorate([
        class_validator_1.IsOptional(),
        class_validator_1.IsString()
    ], CreateMarketDto.prototype, "descriptionEn");
    __decorate([
        class_validator_1.IsString()
    ], CreateMarketDto.prototype, "ownerId");
    __decorate([
        class_validator_1.IsOptional(),
        class_validator_1.IsString()
    ], CreateMarketDto.prototype, "zone");
    __decorate([
        class_validator_1.IsOptional(),
        class_validator_1.IsString()
    ], CreateMarketDto.prototype, "district");
    __decorate([
        class_validator_1.IsOptional(),
        class_validator_1.IsString()
    ], CreateMarketDto.prototype, "address");
    __decorate([
        class_validator_1.IsOptional(),
        class_validator_1.IsArray()
    ], CreateMarketDto.prototype, "operations");
    __decorate([
        class_validator_1.IsOptional(),
        class_validator_1.IsArray()
    ], CreateMarketDto.prototype, "hours");
    __decorate([
        class_validator_1.IsOptional(),
        class_validator_1.IsNumber()
    ], CreateMarketDto.prototype, "commissionFee");
    __decorate([
        class_validator_1.IsOptional(),
        class_validator_1.IsArray()
    ], CreateMarketDto.prototype, "location");
    __decorate([
        class_validator_1.IsOptional(),
        class_validator_1.IsArray()
    ], CreateMarketDto.prototype, "categoryIds");
    return CreateMarketDto;
}());
exports.CreateMarketDto = CreateMarketDto;
