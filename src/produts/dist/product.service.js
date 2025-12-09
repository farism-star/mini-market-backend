"use strict";
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
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
exports.ProductService = void 0;
var common_1 = require("@nestjs/common");
var ProductService = /** @class */ (function () {
    function ProductService(prisma) {
        this.prisma = prisma;
    }
    ProductService.prototype.create = function (ownerId, dto, imageUrls) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function () {
            var user, Market, err_1;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.prisma.user.findUnique({
                                where: { id: ownerId }
                            })];
                    case 1:
                        user = _c.sent();
                        if (!user || user.type !== 'OWNER') {
                            throw new common_1.UnauthorizedException('Only OWNER can create products');
                        }
                        return [4 /*yield*/, this.prisma.market.findFirst({
                                where: { ownerId: user.id }
                            })];
                    case 2:
                        Market = _c.sent();
                        if (!Market) {
                            throw new common_1.BadRequestException('Owner has no market yet');
                        }
                        // 3) Create Product with uploaded images
                        return [2 /*return*/, this.prisma.product.create({
                                data: {
                                    titleAr: dto.titleAr,
                                    titleEn: dto.titleEn,
                                    descreptionAr: (_a = dto.descreptionAr) !== null && _a !== void 0 ? _a : "",
                                    descriptionEn: (_b = dto.descriptionEn) !== null && _b !== void 0 ? _b : "",
                                    price: dto.price,
                                    images: imageUrls,
                                    categoryId: dto.categoryId,
                                    marketId: Market.id
                                }
                            })];
                    case 3:
                        err_1 = _c.sent();
                        console.log(err_1);
                        throw new common_1.InternalServerErrorException(err_1.message || 'Failed to create product');
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    ProductService.prototype.findAll = function (user, query) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, page, _b, limit, _c, search, categoryId, categoryName, skip, take, existeUser, filters, market, total, data;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _a = query.page, page = _a === void 0 ? 1 : _a, _b = query.limit, limit = _b === void 0 ? 10 : _b, _c = query.search, search = _c === void 0 ? '' : _c, categoryId = query.categoryId, categoryName = query.categoryName;
                        skip = (page - 1) * limit;
                        take = Number(limit);
                        return [4 /*yield*/, this.prisma.user.findFirst({
                                where: { id: user.id }
                            })];
                    case 1:
                        existeUser = _d.sent();
                        if (!existeUser) {
                            throw new common_1.UnauthorizedException('User not found');
                        }
                        filters = {};
                        if (!(user.type === 'OWNER')) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.prisma.market.findFirst({
                                where: { ownerId: existeUser.id }
                            })];
                    case 2:
                        market = _d.sent();
                        filters.marketId = market === null || market === void 0 ? void 0 : market.id;
                        _d.label = 3;
                    case 3:
                        // فلترة حسب Category ID
                        if (categoryId) {
                            filters.categoryId = categoryId;
                        }
                        // فلترة حسب Category Name
                        if (categoryName) {
                            filters.category = {
                                nameAr: { contains: categoryName, mode: 'insensitive' }
                            };
                        }
                        // البحث (search)
                        if (search) {
                            filters.OR = [
                                { titleAr: { contains: search, mode: 'insensitive' } },
                                { titleEn: { contains: search, mode: 'insensitive' } },
                            ];
                        }
                        return [4 /*yield*/, this.prisma.product.count({
                                where: filters
                            })];
                    case 4:
                        total = _d.sent();
                        return [4 /*yield*/, this.prisma.product.findMany({
                                where: filters,
                                include: {
                                    category: true,
                                    market: true
                                },
                                orderBy: { titleAr: 'asc' },
                                skip: skip,
                                take: take
                            })];
                    case 5:
                        data = _d.sent();
                        return [2 /*return*/, {
                                pagination: {
                                    page: Number(page),
                                    limit: Number(limit),
                                    total: total,
                                    totalPages: Math.ceil(total / limit)
                                },
                                data: data
                            }];
                }
            });
        });
    };
    ProductService.prototype.findByOwner = function (ownerId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.prisma.product.findMany({
                            where: { marketId: ownerId },
                            include: {
                                category: true
                            }
                        })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    ProductService.prototype.findOne = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var product;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.prisma.product.findUnique({
                            where: { id: id },
                            include: {
                                category: true,
                                market: true
                            }
                        })];
                    case 1:
                        product = _a.sent();
                        if (!product) {
                            throw new common_1.NotFoundException('Product not found');
                        }
                        return [2 /*return*/, product];
                }
            });
        });
    };
    ProductService.prototype.update = function (id, dto, user, imageUrls) {
        var _a, _b, _c, _d;
        return __awaiter(this, void 0, void 0, function () {
            var product, updatedImages, err_2;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        _e.trys.push([0, 3, , 4]);
                        if (user.type !== 'OWNER') {
                            throw new common_1.UnauthorizedException('Only OWNER can update products');
                        }
                        return [4 /*yield*/, this.prisma.product.findUnique({ where: { id: id } })];
                    case 1:
                        product = _e.sent();
                        if (!product) {
                            throw new common_1.NotFoundException('Product not found');
                        }
                        updatedImages = imageUrls.length > 0
                            ? __spreadArrays(product.images, imageUrls) : product.images;
                        return [4 /*yield*/, this.prisma.product.update({
                                where: { id: id },
                                data: {
                                    titleAr: (_a = dto.titleAr) !== null && _a !== void 0 ? _a : product.titleAr,
                                    titleEn: (_b = dto.titleEn) !== null && _b !== void 0 ? _b : product.titleEn,
                                    price: (_c = dto.price) !== null && _c !== void 0 ? _c : product.price,
                                    images: updatedImages,
                                    categoryId: (_d = dto.categoryId) !== null && _d !== void 0 ? _d : product.categoryId
                                }
                            })];
                    case 2: return [2 /*return*/, _e.sent()];
                    case 3:
                        err_2 = _e.sent();
                        throw new common_1.InternalServerErrorException(err_2.message || 'Failed to update product');
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    ProductService.prototype.remove = function (id, user) {
        return __awaiter(this, void 0, void 0, function () {
            var product, err_3;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        if (user.type !== 'OWNER') {
                            throw new common_1.UnauthorizedException('Only OWNER can delete products');
                        }
                        return [4 /*yield*/, this.prisma.product.findUnique({ where: { id: id } })];
                    case 1:
                        product = _a.sent();
                        if (!product) {
                            throw new common_1.NotFoundException('Product not found');
                        }
                        return [4 /*yield*/, this.prisma.$transaction(function (tx) { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, tx.product["delete"]({
                                                where: { id: id }
                                            })];
                                        case 1:
                                            _a.sent();
                                            return [2 /*return*/, { message: 'Product deleted successfully' }];
                                    }
                                });
                            }); })];
                    case 2: return [2 /*return*/, _a.sent()];
                    case 3:
                        err_3 = _a.sent();
                        throw new common_1.InternalServerErrorException(err_3.message || 'Failed to delete product');
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    ProductService = __decorate([
        common_1.Injectable()
    ], ProductService);
    return ProductService;
}());
exports.ProductService = ProductService;
