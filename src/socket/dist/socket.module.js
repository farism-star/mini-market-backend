"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
exports.SocketModule = void 0;
var common_1 = require("@nestjs/common");
var socket_gateway_1 = require("./socket.gateway");
var prisma_service_1 = require("src/prisma/prisma.service");
var jwt_1 = require("@nestjs/jwt");
var SocketModule = /** @class */ (function () {
    function SocketModule() {
    }
    SocketModule = __decorate([
        common_1.Module({
            imports: [jwt_1.JwtModule.register({ secret: process.env.JWT_SECRET })],
            providers: [socket_gateway_1.SocketGateway, prisma_service_1.PrismaService],
            exports: []
        })
    ], SocketModule);
    return SocketModule;
}());
exports.SocketModule = SocketModule;
