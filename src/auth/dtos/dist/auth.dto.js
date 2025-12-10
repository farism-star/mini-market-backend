"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
exports.UpdateUserDto = exports.UpdateMarketDto = exports.UpdateAddressDto = exports.VerifyOtpDto = exports.AuthDto = exports.AddressType = exports.UserType = void 0;
// dtos/auth.dto.ts
var class_validator_1 = require("class-validator");
var UserType;
(function (UserType) {
    UserType["OWNER"] = "OWNER";
    UserType["CLIENT"] = "CLIENT";
})(UserType = exports.UserType || (exports.UserType = {}));
var AddressType;
(function (AddressType) {
    AddressType["WORK"] = "WORK";
    AddressType["HOME"] = "HOME";
    AddressType["OTHER"] = "OTHER";
})(AddressType = exports.AddressType || (exports.AddressType = {}));
var AuthDto = /** @class */ (function () {
    function AuthDto() {
    }
    __decorate([
        class_validator_1.IsEnum(UserType)
    ], AuthDto.prototype, "type");
    __decorate([
        class_validator_1.IsNotEmpty(),
        class_validator_1.IsString()
    ], AuthDto.prototype, "name");
    __decorate([
        class_validator_1.IsOptional(),
        class_validator_1.IsString()
    ], AuthDto.prototype, "email");
    __decorate([
        class_validator_1.IsOptional(),
        class_validator_1.IsString()
    ], AuthDto.prototype, "image");
    __decorate([
        class_validator_1.IsOptional(),
        class_validator_1.IsString()
    ], AuthDto.prototype, "password");
    __decorate([
        class_validator_1.IsOptional(),
        class_validator_1.IsString()
    ], AuthDto.prototype, "marketName");
    __decorate([
        class_validator_1.IsNotEmpty(),
        class_validator_1.IsString()
    ], AuthDto.prototype, "phone");
    __decorate([
        class_validator_1.IsOptional(),
        class_validator_1.IsString()
    ], AuthDto.prototype, "zone");
    __decorate([
        class_validator_1.IsOptional(),
        class_validator_1.IsString()
    ], AuthDto.prototype, "district");
    __decorate([
        class_validator_1.IsOptional(),
        class_validator_1.IsString()
    ], AuthDto.prototype, "address");
    __decorate([
        class_validator_1.IsOptional()
    ], AuthDto.prototype, "operations");
    __decorate([
        class_validator_1.IsOptional()
    ], AuthDto.prototype, "hours");
    __decorate([
        class_validator_1.IsOptional(),
        class_validator_1.IsArray()
    ], AuthDto.prototype, "location");
    __decorate([
        class_validator_1.IsOptional(),
        class_validator_1.IsArray(),
        class_validator_1.IsString({ each: true })
    ], AuthDto.prototype, "categoryIds");
    return AuthDto;
}());
exports.AuthDto = AuthDto;
var VerifyOtpDto = /** @class */ (function () {
    function VerifyOtpDto() {
    }
    __decorate([
        class_validator_1.IsNotEmpty(),
        class_validator_1.IsString()
    ], VerifyOtpDto.prototype, "phone");
    __decorate([
        class_validator_1.IsOptional(),
        class_validator_1.IsString()
    ], VerifyOtpDto.prototype, "email");
    __decorate([
        class_validator_1.IsNotEmpty(),
        class_validator_1.IsString(),
        class_validator_1.Length(5, 5)
    ], VerifyOtpDto.prototype, "otp");
    return VerifyOtpDto;
}());
exports.VerifyOtpDto = VerifyOtpDto;
var UpdateAddressDto = /** @class */ (function () {
    function UpdateAddressDto() {
    }
    __decorate([
        class_validator_1.IsOptional(),
        class_validator_1.IsString()
    ], UpdateAddressDto.prototype, "addressId");
    __decorate([
        class_validator_1.IsOptional(),
        class_validator_1.IsEnum(AddressType)
    ], UpdateAddressDto.prototype, "type");
    __decorate([
        class_validator_1.IsOptional(),
        class_validator_1.IsString()
    ], UpdateAddressDto.prototype, "fullAddress");
    __decorate([
        class_validator_1.IsOptional(),
        class_validator_1.IsBoolean()
    ], UpdateAddressDto.prototype, "isSelected");
    return UpdateAddressDto;
}());
exports.UpdateAddressDto = UpdateAddressDto;
var UpdateMarketDto = /** @class */ (function () {
    function UpdateMarketDto() {
    }
    __decorate([
        class_validator_1.IsOptional(),
        class_validator_1.IsString()
    ], UpdateMarketDto.prototype, "name");
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
        class_validator_1.IsOptional()
    ], UpdateMarketDto.prototype, "operations");
    __decorate([
        class_validator_1.IsOptional()
    ], UpdateMarketDto.prototype, "hours");
    __decorate([
        class_validator_1.IsOptional(),
        class_validator_1.IsString()
    ], UpdateMarketDto.prototype, "image");
    return UpdateMarketDto;
}());
exports.UpdateMarketDto = UpdateMarketDto;
var UpdateUserDto = /** @class */ (function () {
    function UpdateUserDto() {
    }
    __decorate([
        class_validator_1.IsOptional(),
        class_validator_1.IsString()
    ], UpdateUserDto.prototype, "name");
    __decorate([
        class_validator_1.IsOptional(),
        class_validator_1.IsString()
    ], UpdateUserDto.prototype, "email");
    __decorate([
        class_validator_1.IsOptional(),
        class_validator_1.IsString()
    ], UpdateUserDto.prototype, "phone");
    __decorate([
        class_validator_1.IsOptional(),
        class_validator_1.IsEnum(UserType)
    ], UpdateUserDto.prototype, "type");
    __decorate([
        class_validator_1.IsOptional(),
        class_validator_1.IsString()
    ], UpdateUserDto.prototype, "image");
    __decorate([
        class_validator_1.IsOptional(),
        class_validator_1.IsBoolean()
    ], UpdateUserDto.prototype, "isAproved");
    __decorate([
        class_validator_1.IsOptional()
    ], UpdateUserDto.prototype, "address");
    __decorate([
        class_validator_1.IsOptional()
    ], UpdateUserDto.prototype, "market");
    return UpdateUserDto;
}());
exports.UpdateUserDto = UpdateUserDto;
