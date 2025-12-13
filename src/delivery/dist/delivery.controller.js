"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
exports.__esModule = true;
exports.DeliveryController = void 0;
var common_1 = require("@nestjs/common");
var passport_1 = require("@nestjs/passport");
var roles_gaurd_1 = require("src/auth/roles.gaurd");
var Role_decorator_1 = require("src/auth/Role.decorator");
var roles_enum_1 = require("src/auth/roles.enum");
var platform_express_1 = require("@nestjs/platform-express");
var multer_config_1 = require("../upload/multer.config");
var DeliveryController = /** @class */ (function () {
    function DeliveryController(deliveryService) {
        this.deliveryService = deliveryService;
    }
    // OWNER: Create delivery + upload image
    DeliveryController.prototype.create = function (req, file, dto) {
        var imageUrl = file ? "/uploads/" + file.filename : undefined;
        return this.deliveryService.createDelivery(dto, req.user.id, req.user.type, imageUrl);
    };
    // OWNER: list my deliveries
    DeliveryController.prototype.getMine = function (req) {
        return this.deliveryService.getMyDeliveries(req.user.id, req.user.type);
    };
    // ADMIN: list all deliveries
    DeliveryController.prototype.getAll = function () {
        return this.deliveryService.getAll();
    };
    // Update delivery (ADMIN or OWNER) + optional upload
    DeliveryController.prototype.update = function (id, req, file, dto) {
        var imageUrl = file ? "/uploads/" + file.filename : undefined;
        return this.deliveryService.updateDelivery(id, dto, req.user, imageUrl);
    };
    // Delete delivery
    DeliveryController.prototype["delete"] = function (id, req) {
        return this.deliveryService.deleteDelivery(id, req.user);
    };
    __decorate([
        Role_decorator_1.Roles(roles_enum_1.Role.OWNER, roles_enum_1.Role.ADMIN),
        common_1.Post("create"),
        common_1.UseInterceptors(platform_express_1.FileInterceptor("image", multer_config_1.multerConfig)),
        __param(0, common_1.Req()),
        __param(1, common_1.UploadedFile()),
        __param(2, common_1.Body())
    ], DeliveryController.prototype, "create");
    __decorate([
        Role_decorator_1.Roles(roles_enum_1.Role.OWNER),
        common_1.Get("me"),
        __param(0, common_1.Req())
    ], DeliveryController.prototype, "getMine");
    __decorate([
        Role_decorator_1.Roles(roles_enum_1.Role.ADMIN),
        common_1.Get("all")
    ], DeliveryController.prototype, "getAll");
    __decorate([
        Role_decorator_1.Roles(roles_enum_1.Role.ADMIN, roles_enum_1.Role.OWNER),
        common_1.Patch(":id"),
        common_1.UseInterceptors(platform_express_1.FileInterceptor("image", multer_config_1.multerConfig)),
        __param(0, common_1.Param("id")),
        __param(1, common_1.Req()),
        __param(2, common_1.UploadedFile()),
        __param(3, common_1.Body())
    ], DeliveryController.prototype, "update");
    __decorate([
        Role_decorator_1.Roles(roles_enum_1.Role.ADMIN, roles_enum_1.Role.OWNER),
        common_1.Delete(":id"),
        __param(0, common_1.Param("id")), __param(1, common_1.Req())
    ], DeliveryController.prototype, "delete");
    DeliveryController = __decorate([
        common_1.Controller({
            path: "delivery",
            version: "1"
        }),
        common_1.UseGuards(passport_1.AuthGuard("jwt"), roles_gaurd_1.RolesGuard)
    ], DeliveryController);
    return DeliveryController;
}());
exports.DeliveryController = DeliveryController;
