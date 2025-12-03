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
exports.CategoryController = void 0;
var common_1 = require("@nestjs/common");
var passport_1 = require("@nestjs/passport");
var roles_gaurd_1 = require("../auth/roles.gaurd");
var Role_decorator_1 = require("../auth/Role.decorator");
var roles_enum_1 = require("../auth/roles.enum");
var CategoryController = /** @class */ (function () {
    function CategoryController(categoryService) {
        this.categoryService = categoryService;
    }
    CategoryController.prototype.create = function (dto, req) {
        var user = req.user;
        return this.categoryService.create(dto, user);
    };
    CategoryController.prototype.findAll = function () {
        return this.categoryService.findAll();
    };
    CategoryController.prototype.findOne = function (id) {
        return this.categoryService.findOne(id);
    };
    CategoryController.prototype.update = function (id, dto, req) {
        var user = req.user;
        return this.categoryService.update(id, dto, user);
    };
    CategoryController.prototype.remove = function (id, req) {
        return this.categoryService.remove(id, req.user);
    };
    __decorate([
        Role_decorator_1.Roles(roles_enum_1.Role.OWNER),
        common_1.Post(),
        __param(0, common_1.Body()), __param(1, common_1.Req())
    ], CategoryController.prototype, "create");
    __decorate([
        Role_decorator_1.Roles(roles_enum_1.Role.CLIENT, roles_enum_1.Role.OWNER),
        common_1.Get()
    ], CategoryController.prototype, "findAll");
    __decorate([
        Role_decorator_1.Roles(roles_enum_1.Role.CLIENT, roles_enum_1.Role.OWNER),
        common_1.Get(':id'),
        __param(0, common_1.Param('id'))
    ], CategoryController.prototype, "findOne");
    __decorate([
        Role_decorator_1.Roles(roles_enum_1.Role.OWNER),
        common_1.Patch(':id'),
        __param(0, common_1.Param('id')), __param(1, common_1.Body()), __param(2, common_1.Req())
    ], CategoryController.prototype, "update");
    __decorate([
        Role_decorator_1.Roles(roles_enum_1.Role.OWNER),
        common_1.Delete(':id'),
        __param(0, common_1.Param('id')), __param(1, common_1.Req())
    ], CategoryController.prototype, "remove");
    CategoryController = __decorate([
        common_1.Controller({
            path: 'categories',
            version: '1'
        }),
        common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_gaurd_1.RolesGuard)
    ], CategoryController);
    return CategoryController;
}());
exports.CategoryController = CategoryController;
