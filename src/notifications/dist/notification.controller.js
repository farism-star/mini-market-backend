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
exports.NotificationController = void 0;
var common_1 = require("@nestjs/common");
var passport_1 = require("@nestjs/passport");
var roles_gaurd_1 = require("src/auth/roles.gaurd");
var Role_decorator_1 = require("src/auth/Role.decorator");
var roles_enum_1 = require("src/auth/roles.enum");
var NotificationController = /** @class */ (function () {
    function NotificationController(service) {
        this.service = service;
    }
    NotificationController.prototype.create = function (dto) {
        return this.service.create(dto);
    };
    NotificationController.prototype.update = function (id, body) {
        return this.service.update(id, body);
    };
    NotificationController.prototype.getUserNotifications = function (req) {
        var userId = req.user.sub;
        return this.service.getUserNotifications(userId);
    };
    NotificationController.prototype.markAsRead = function (id) {
        return this.service.markAsRead(id);
    };
    NotificationController.prototype.markAll = function (req) {
        var userId = req.user.sub;
        return this.service.markAllAsRead(userId);
    };
    NotificationController.prototype["delete"] = function (id) {
        return this.service["delete"](id);
    };
    __decorate([
        Role_decorator_1.Roles(roles_enum_1.Role.OWNER, roles_enum_1.Role.CLIENT),
        common_1.Post(),
        __param(0, common_1.Body())
    ], NotificationController.prototype, "create");
    __decorate([
        Role_decorator_1.Roles(roles_enum_1.Role.OWNER, roles_enum_1.Role.CLIENT),
        common_1.Patch(':id'),
        __param(0, common_1.Param('id')), __param(1, common_1.Body('body'))
    ], NotificationController.prototype, "update");
    __decorate([
        Role_decorator_1.Roles(roles_enum_1.Role.OWNER, roles_enum_1.Role.CLIENT),
        common_1.Get(),
        __param(0, common_1.Req())
    ], NotificationController.prototype, "getUserNotifications");
    __decorate([
        Role_decorator_1.Roles(roles_enum_1.Role.OWNER, roles_enum_1.Role.CLIENT),
        common_1.Patch('read/:id'),
        __param(0, common_1.Param('id'))
    ], NotificationController.prototype, "markAsRead");
    __decorate([
        Role_decorator_1.Roles(roles_enum_1.Role.OWNER, roles_enum_1.Role.CLIENT),
        common_1.Patch('read-all'),
        __param(0, common_1.Req())
    ], NotificationController.prototype, "markAll");
    __decorate([
        Role_decorator_1.Roles(roles_enum_1.Role.OWNER, roles_enum_1.Role.CLIENT),
        common_1.Delete(':id'),
        __param(0, common_1.Param('id'))
    ], NotificationController.prototype, "delete");
    NotificationController = __decorate([
        common_1.Controller({
            path: 'notifications',
            version: '1'
        }),
        common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_gaurd_1.RolesGuard)
    ], NotificationController);
    return NotificationController;
}());
exports.NotificationController = NotificationController;
