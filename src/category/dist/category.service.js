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
exports.__esModule = true;
exports.CategoryService = void 0;
var common_1 = require("@nestjs/common");
var fs_1 = require("fs");
var promises_1 = require("fs/promises");
var path_1 = require("path");
var CategoryService = /** @class */ (function () {
    function CategoryService(prisma) {
        this.prisma = prisma;
    }
    // ============================
    // 🔥 Create Category
    // ============================
    CategoryService.prototype.create = function (dto, user, iconUrl) {
        return __awaiter(this, void 0, void 0, function () {
            var market, err_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        if (user.type !== 'OWNER') {
                            throw new common_1.UnauthorizedException('Only OWNER can create categories');
                        }
                        return [4 /*yield*/, this.prisma.market.findUnique({
                                where: { ownerId: user.sub || user.id }
                            })];
                    case 1:
                        market = _a.sent();
                        if (!market) {
                            throw new common_1.NotFoundException('Market not found for this owner');
                        }
                        return [4 /*yield*/, this.prisma.category.create({
                                data: {
                                    nameAr: dto.nameAr,
                                    nameEn: dto.nameEn,
                                    icon: iconUrl,
                                    marketId: market.id
                                }
                            })];
                    case 2: return [2 /*return*/, _a.sent()];
                    case 3:
                        err_1 = _a.sent();
                        console.log(err_1);
                        throw new common_1.InternalServerErrorException(err_1.message || 'Failed to create category');
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    // ============================
    // 🔥 Find All
    // ============================
    CategoryService.prototype.findAll = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.prisma.category.findMany({
                            orderBy: { nameAr: 'asc' },
                            include: {
                                market: {
                                    select: {
                                        id: true,
                                        name: true
                                    }
                                }
                            }
                        })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    // ============================
    // 🔥 Find One
    // ============================
    CategoryService.prototype.findOne = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var category;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.prisma.category.findUnique({
                            where: { id: id },
                            include: {
                                market: {
                                    select: {
                                        id: true,
                                        name: true
                                    }
                                }
                            }
                        })];
                    case 1:
                        category = _a.sent();
                        if (!category) {
                            throw new common_1.NotFoundException('Category not found');
                        }
                        return [2 /*return*/, category];
                }
            });
        });
    };
    // ============================
    // 🔥 Update Category
    // ============================
    CategoryService.prototype.update = function (id, dto, user, iconUrl) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function () {
            var category, oldIconPath, error_1, err_2;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 8, , 9]);
                        if (user.type !== 'OWNER') {
                            throw new common_1.UnauthorizedException('Only OWNER can update categories');
                        }
                        return [4 /*yield*/, this.prisma.category.findUnique({
                                where: { id: id }
                            })];
                    case 1:
                        category = _c.sent();
                        if (!category) {
                            throw new common_1.NotFoundException('Category not found');
                        }
                        if (!(iconUrl && category.icon)) return [3 /*break*/, 6];
                        _c.label = 2;
                    case 2:
                        _c.trys.push([2, 5, , 6]);
                        oldIconPath = path_1.join(process.cwd(), category.icon);
                        if (!fs_1.existsSync(oldIconPath)) return [3 /*break*/, 4];
                        return [4 /*yield*/, promises_1.unlink(oldIconPath)];
                    case 3:
                        _c.sent();
                        console.log('Old icon deleted:', category.icon);
                        _c.label = 4;
                    case 4: return [3 /*break*/, 6];
                    case 5:
                        error_1 = _c.sent();
                        console.log('Failed to delete old icon:', error_1);
                        return [3 /*break*/, 6];
                    case 6: return [4 /*yield*/, this.prisma.category.update({
                            where: { id: id },
                            data: {
                                nameAr: (_a = dto.nameAr) !== null && _a !== void 0 ? _a : category.nameAr,
                                nameEn: (_b = dto.nameEn) !== null && _b !== void 0 ? _b : category.nameEn,
                                icon: iconUrl !== null && iconUrl !== void 0 ? iconUrl : category.icon
                            }
                        })];
                    case 7: return [2 /*return*/, _c.sent()];
                    case 8:
                        err_2 = _c.sent();
                        throw new common_1.InternalServerErrorException(err_2.message || 'Failed to update category');
                    case 9: return [2 /*return*/];
                }
            });
        });
    };
    // ============================
    // 🔥 Delete Category
    // ============================
    CategoryService.prototype.remove = function (id, user) {
        return __awaiter(this, void 0, void 0, function () {
            var category_1, err_3;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        if (user.type !== 'OWNER') {
                            throw new common_1.UnauthorizedException('Only OWNER can delete categories');
                        }
                        return [4 /*yield*/, this.prisma.category.findUnique({
                                where: { id: id }
                            })];
                    case 1:
                        category_1 = _a.sent();
                        if (!category_1) {
                            throw new common_1.NotFoundException('Category not found');
                        }
                        return [4 /*yield*/, this.prisma.$transaction(function (tx) { return __awaiter(_this, void 0, void 0, function () {
                                var iconPath, error_2;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            if (!category_1.icon) return [3 /*break*/, 5];
                                            _a.label = 1;
                                        case 1:
                                            _a.trys.push([1, 4, , 5]);
                                            iconPath = path_1.join(process.cwd(), category_1.icon);
                                            if (!fs_1.existsSync(iconPath)) return [3 /*break*/, 3];
                                            return [4 /*yield*/, promises_1.unlink(iconPath)];
                                        case 2:
                                            _a.sent();
                                            console.log('Category icon deleted:', category_1.icon);
                                            _a.label = 3;
                                        case 3: return [3 /*break*/, 5];
                                        case 4:
                                            error_2 = _a.sent();
                                            console.log('Failed to delete category icon:', error_2);
                                            return [3 /*break*/, 5];
                                        case 5: 
                                        // ✅ مسح الـ category
                                        return [4 /*yield*/, tx.category["delete"]({
                                                where: { id: id }
                                            })];
                                        case 6:
                                            // ✅ مسح الـ category
                                            _a.sent();
                                            return [2 /*return*/, { message: 'Category deleted successfully' }];
                                    }
                                });
                            }); })];
                    case 2: return [2 /*return*/, _a.sent()];
                    case 3:
                        err_3 = _a.sent();
                        throw new common_1.InternalServerErrorException(err_3.message || 'Failed to delete category');
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    CategoryService = __decorate([
        common_1.Injectable()
    ], CategoryService);
    return CategoryService;
}());
exports.CategoryService = CategoryService;
