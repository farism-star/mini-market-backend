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
    MarketService.prototype.createMarket = function (dto) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
        return __awaiter(this, void 0, void 0, function () {
            var owner, market, marketCategories;
            return __generator(this, function (_m) {
                switch (_m.label) {
                    case 0: return [4 /*yield*/, this.prisma.user.findUnique({ where: { id: dto.ownerId } })];
                    case 1:
                        owner = _m.sent();
                        if (!owner)
                            throw new common_1.NotFoundException("Owner not found");
                        return [4 /*yield*/, this.prisma.market.create({
                                data: {
                                    nameAr: (_a = dto.nameAr) !== null && _a !== void 0 ? _a : "",
                                    nameEn: (_b = dto.nameEn) !== null && _b !== void 0 ? _b : "",
                                    descriptionAr: (_c = dto.descriptionAr) !== null && _c !== void 0 ? _c : "",
                                    descriptionEn: (_d = dto.descriptionEn) !== null && _d !== void 0 ? _d : "",
                                    ownerId: dto.ownerId,
                                    zone: (_e = dto.zone) !== null && _e !== void 0 ? _e : "",
                                    district: (_f = dto.district) !== null && _f !== void 0 ? _f : "",
                                    address: (_g = dto.address) !== null && _g !== void 0 ? _g : "",
                                    operations: (_h = dto.operations) !== null && _h !== void 0 ? _h : [],
                                    hours: (_j = dto.hours) !== null && _j !== void 0 ? _j : [],
                                    commissionFee: (_k = dto.commissionFee) !== null && _k !== void 0 ? _k : 5,
                                    location: (_l = dto.location) !== null && _l !== void 0 ? _l : []
                                }
                            })];
                    case 2:
                        market = _m.sent();
                        if (!(Array.isArray(dto.categoryIds) && dto.categoryIds.length > 0)) return [3 /*break*/, 4];
                        marketCategories = dto.categoryIds.map(function (catId) { return ({
                            marketId: market.id,
                            categoryId: catId
                        }); });
                        return [4 /*yield*/, this.prisma.marketCategory.createMany({ data: marketCategories })];
                    case 3:
                        _m.sent();
                        _m.label = 4;
                    case 4: return [2 /*return*/, { message: "Market created", market: market }];
                }
            });
        });
    };
    MarketService.prototype.getMyMarket = function (userId, userType, userLocation) {
        return __awaiter(this, void 0, void 0, function () {
            var market, markets;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(userType === "OWNER")) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.prisma.market.findUnique({
                                where: { ownerId: userId },
                                include: {
                                    categories: { include: { category: true } },
                                    products: true
                                }
                            })];
                    case 1:
                        market = _a.sent();
                        if (!market)
                            throw new common_1.NotFoundException("No market found for this user");
                        return [2 /*return*/, { message: "Market loaded successfully", market: market }];
                    case 2: return [4 /*yield*/, this.prisma.market.findMany({
                            include: {
                                owner: true,
                                categories: { include: { category: true } },
                                products: true
                            }
                        })];
                    case 3:
                        markets = _a.sent();
                        if (!markets || markets.length === 0)
                            throw new common_1.NotFoundException("No markets found");
                        if (userLocation) {
                            markets.forEach(function (m) {
                                var _a;
                                if (((_a = m.location) === null || _a === void 0 ? void 0 : _a.length) === 2) {
                                    m["distanceInKm"] = distance_1.getDistance(userLocation[0], userLocation[1], m.location[0], m.location[1]);
                                }
                                else {
                                    m["distanceInKm"] = null;
                                }
                            });
                            markets.sort(function (a, b) { return (a["distanceInKm"] || Infinity) - (b["distanceInKm"] || Infinity); });
                        }
                        return [2 /*return*/, { message: "Markets for client loaded successfully", markets: markets }];
                }
            });
        });
    };
    MarketService.prototype.getMarketById = function (marketId) {
        return __awaiter(this, void 0, void 0, function () {
            var market;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.prisma.market.findUnique({
                            where: { id: marketId },
                            include: { owner: true, products: true }
                        })];
                    case 1:
                        market = _a.sent();
                        if (!market)
                            throw new common_1.NotFoundException("Market not found");
                        return [2 /*return*/, { message: "Market details loaded successfully", market: market }];
                }
            });
        });
    };
    MarketService.prototype.updateMyMarket = function (userId, userType, dto) {
        return __awaiter(this, void 0, void 0, function () {
            var market, dataToUpdate, updated, marketCategories, err_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (userType !== "OWNER")
                            throw new common_1.ForbiddenException("Only owners can update markets");
                        return [4 /*yield*/, this.prisma.market.findUnique({ where: { ownerId: userId } })];
                    case 1:
                        market = _a.sent();
                        if (!market)
                            throw new common_1.NotFoundException("Market not found");
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 7, , 8]);
                        dataToUpdate = __assign({}, dto);
                        if (dto.from)
                            dataToUpdate.from = new Date(dto.from);
                        if (dto.to)
                            dataToUpdate.to = new Date(dto.to);
                        return [4 /*yield*/, this.prisma.market.update({
                                where: { id: market.id },
                                data: dataToUpdate
                            })];
                    case 3:
                        updated = _a.sent();
                        if (!(dto.categoryIds && Array.isArray(dto.categoryIds))) return [3 /*break*/, 6];
                        // احذف القديم
                        return [4 /*yield*/, this.prisma.marketCategory.deleteMany({ where: { marketId: market.id } })];
                    case 4:
                        // احذف القديم
                        _a.sent();
                        marketCategories = dto.categoryIds.map(function (catId) { return ({
                            marketId: market.id,
                            categoryId: catId
                        }); });
                        return [4 /*yield*/, this.prisma.marketCategory.createMany({ data: marketCategories })];
                    case 5:
                        _a.sent();
                        _a.label = 6;
                    case 6: return [2 /*return*/, { message: "Market updated successfully", market: updated }];
                    case 7:
                        err_1 = _a.sent();
                        throw new common_1.BadRequestException((err_1 === null || err_1 === void 0 ? void 0 : err_1.message) || "Failed to update market");
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    MarketService.prototype.updateMarketByAdmin = function (marketId, dto) {
        return __awaiter(this, void 0, void 0, function () {
            var market, dataToUpdate, updated, marketCategories, err_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.prisma.market.findUnique({ where: { id: marketId } })];
                    case 1:
                        market = _a.sent();
                        if (!market)
                            throw new common_1.NotFoundException("Market not found");
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 7, , 8]);
                        dataToUpdate = __assign({}, dto);
                        if (dto.from)
                            dataToUpdate.from = new Date(dto.from);
                        if (dto.to)
                            dataToUpdate.to = new Date(dto.to);
                        return [4 /*yield*/, this.prisma.market.update({
                                where: { id: marketId },
                                data: dataToUpdate
                            })];
                    case 3:
                        updated = _a.sent();
                        if (!(dto.categoryIds && Array.isArray(dto.categoryIds))) return [3 /*break*/, 6];
                        return [4 /*yield*/, this.prisma.marketCategory.deleteMany({ where: { marketId: marketId } })];
                    case 4:
                        _a.sent();
                        marketCategories = dto.categoryIds.map(function (catId) { return ({
                            marketId: marketId,
                            categoryId: catId
                        }); });
                        return [4 /*yield*/, this.prisma.marketCategory.createMany({ data: marketCategories })];
                    case 5:
                        _a.sent();
                        _a.label = 6;
                    case 6: return [2 /*return*/, { message: "Market updated successfully by Admin", market: updated }];
                    case 7:
                        err_2 = _a.sent();
                        throw new common_1.BadRequestException((err_2 === null || err_2 === void 0 ? void 0 : err_2.message) || "Failed to update market");
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    MarketService.prototype.deleteMarketByAdmin = function (marketId) {
        return __awaiter(this, void 0, void 0, function () {
            var market, deletedMarket;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.prisma.market.findUnique({ where: { id: marketId } })];
                    case 1:
                        market = _a.sent();
                        if (!market)
                            throw new common_1.NotFoundException("Market not found");
                        // يجب حذف السجلات المرتبطة (MarketCategory) أولاً
                        return [4 /*yield*/, this.prisma.marketCategory.deleteMany({ where: { marketId: marketId } })];
                    case 2:
                        // يجب حذف السجلات المرتبطة (MarketCategory) أولاً
                        _a.sent();
                        return [4 /*yield*/, this.prisma.market["delete"]({
                                where: { id: marketId }
                            })];
                    case 3:
                        deletedMarket = _a.sent();
                        return [2 /*return*/, { message: "Market deleted successfully by Admin", market: deletedMarket }];
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
