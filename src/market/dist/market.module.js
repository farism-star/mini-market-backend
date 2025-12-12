"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
exports.MarketModule = void 0;
var common_1 = require("@nestjs/common");
var market_controller_1 = require("./market.controller");
var market_service_1 = require("./market.service");
var prisma_service_1 = require("../prisma/prisma.service");
var MarketModule = /** @class */ (function () {
    function MarketModule() {
    }
    MarketModule = __decorate([
        common_1.Module({
            controllers: [market_controller_1.MarketController],
            providers: [market_service_1.MarketService, prisma_service_1.PrismaService]
        })
    ], MarketModule);
    return MarketModule;
}());
exports.MarketModule = MarketModule;
