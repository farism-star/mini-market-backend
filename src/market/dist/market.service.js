"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.MarketService = void 0;
var common_1 = require("@nestjs/common");
var distance_1 = require("src/helpers/distance");
var MarketService = /** @class */ (function () {
    function MarketService(prisma) {
        this.prisma = prisma;
    }
    // OWNER: Get only his market
    MarketService.prototype.getMyMarket = function (userId, userType, userLocation) {
        return __awaiter(this, void 0, void 0, function () {
            var market, markets;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(userType === "OWNER")) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.prisma.market.findUnique({
                                where: { ownerId: userId }
                            })];
                    case 1:
                        market = _a.sent();
                        if (!market) {
                            throw new common_1.NotFoundException("No market found for this user");
                        }
                        return [2 /*return*/, { message: "Market loaded successfully", market: market }];
                    case 2: return [4 /*yield*/, this.prisma.market.findMany({
                            include: { owner: true }
                        })];
                    case 3:
                        markets = _a.sent();
                        if (!markets || markets.length === 0) {
                            throw new common_1.NotFoundException("No markets found for you");
                        }
                        // لو المستخدم أرسل location، نرتب الماركت حسب الأقرب
                        if (userLocation) {
                            markets.sort(function (a, b) {
                                var distA = a.location ? distance_1.getDistance(userLocation[0], userLocation[1], a.location[0], a.location[1]) : Infinity;
                                var distB = b.location ? distance_1.getDistance(userLocation[0], userLocation[1], b.location[0], b.location[1]) : Infinity;
                                return distA - distB;
                            });
                        }
                        return [2 /*return*/, { message: "Markets for client loaded successfully", markets: markets }];
                }
            });
        });
    };
    // OWNER: Update only his market
    MarketService.prototype.updateMyMarket = function (userId, userType, dto) {
        return __awaiter(this, void 0, void 0, function () {
            var market, updated, err_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (userType !== "OWNER") {
                            throw new common_1.ForbiddenException("Only owners can update markets");
                        }
                        return [4 /*yield*/, this.prisma.market.findUnique({
                                where: { ownerId: userId }
                            })];
                    case 1:
                        market = _a.sent();
                        if (!market) {
                            throw new common_1.NotFoundException("Market not found");
                        }
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, this.prisma.market.update({
                                where: { id: market.id },
                                data: __assign({}, dto)
                            })];
                    case 3:
                        updated = _a.sent();
                        return [2 /*return*/, {
                                message: "Market updated successfully",
                                market: updated
                            }];
                    case 4:
                        err_1 = _a.sent();
                        throw new common_1.ForbiddenException("Failed to update market");
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    MarketService = __decorate([
        common_1.Injectable()
    ], MarketService);
    return MarketService;
}());
exports.MarketService = MarketService;
