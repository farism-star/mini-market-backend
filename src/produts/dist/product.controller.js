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
exports.ProductController = void 0;
var common_1 = require("@nestjs/common");
var passport_1 = require("@nestjs/passport");
var roles_gaurd_1 = require("../auth/roles.gaurd");
var Role_decorator_1 = require("../auth/Role.decorator");
var roles_enum_1 = require("../auth/roles.enum");
var platform_express_1 = require("@nestjs/platform-express");
var multer_config_1 = require("../upload/multer.config");
var ProductController = /** @class */ (function () {
    function ProductController(productService) {
        this.productService = productService;
    }
    ProductController.prototype.create = function (files, dto, req) {
        console.log("This is The Images For Products images", files);
        var ownerId = req.user.id;
        var imageUrls = (files === null || files === void 0 ? void 0 : files.map(function (file) { return "/uploads/" + file.filename; })) || [];
        return this.productService.create(ownerId, dto, imageUrls);
    };
    ProductController.prototype.findAll = function (req, query) {
        return this.productService.findAll(req.user, query);
    };
    ProductController.prototype.findMyProducts = function (req) {
        return this.productService.findByOwner(req.user.id);
    };
    ProductController.prototype.findOne = function (id) {
        return this.productService.findOne(id);
    };
    ProductController.prototype.update = function (id, files, dto, req) {
        var user = req.user;
        var imageUrls = (files === null || files === void 0 ? void 0 : files.map(function (file) { return "/uploads/" + file.filename; })) || [];
        return this.productService.update(id, dto, user, imageUrls);
    };
    ProductController.prototype.remove = function (id, req) {
        var user = req.user;
        return this.productService.remove(id, user);
    };
    __decorate([
        Role_decorator_1.Roles(roles_enum_1.Role.OWNER),
        common_1.Post(),
        common_1.UseInterceptors(platform_express_1.FilesInterceptor('images', 10, multer_config_1.multerConfig)) // ✅ رفع 10 صور كحد أقصى
        ,
        __param(0, common_1.UploadedFiles()),
        __param(1, common_1.Body()),
        __param(2, common_1.Req())
    ], ProductController.prototype, "create");
    __decorate([
        Role_decorator_1.Roles(roles_enum_1.Role.CLIENT, roles_enum_1.Role.OWNER),
        common_1.Get(),
        __param(0, common_1.Req()), __param(1, common_1.Query())
    ], ProductController.prototype, "findAll");
    __decorate([
        Role_decorator_1.Roles(roles_enum_1.Role.OWNER),
        common_1.Get('owner/me'),
        __param(0, common_1.Req())
    ], ProductController.prototype, "findMyProducts");
    __decorate([
        Role_decorator_1.Roles(roles_enum_1.Role.CLIENT, roles_enum_1.Role.OWNER),
        common_1.Get(':id'),
        __param(0, common_1.Param('id'))
    ], ProductController.prototype, "findOne");
    __decorate([
        Role_decorator_1.Roles(roles_enum_1.Role.OWNER),
        common_1.Patch(':id'),
        common_1.UseInterceptors(platform_express_1.FilesInterceptor('images', 10, multer_config_1.multerConfig)) // ✅ رفع 10 صور كحد أقصى
        ,
        __param(0, common_1.Param('id')),
        __param(1, common_1.UploadedFiles()),
        __param(2, common_1.Body()),
        __param(3, common_1.Req())
    ], ProductController.prototype, "update");
    __decorate([
        Role_decorator_1.Roles(roles_enum_1.Role.OWNER),
        common_1.Delete(':id'),
        __param(0, common_1.Param('id')), __param(1, common_1.Req())
    ], ProductController.prototype, "remove");
    ProductController = __decorate([
        common_1.Controller({
            path: 'products',
            version: '1'
        }),
        common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_gaurd_1.RolesGuard)
    ], ProductController);
    return ProductController;
}());
exports.ProductController = ProductController;
