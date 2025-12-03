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
exports.OrdersService = void 0;
var common_1 = require("@nestjs/common");
var helper_1 = require("../helpers/helper");
var OrdersService = /** @class */ (function () {
    function OrdersService(prisma, notification) {
        this.prisma = prisma;
        this.notification = notification;
    }
    OrdersService.prototype.create = function (createDto, user) {
        var _a, _b, _c, _d;
        return __awaiter(this, void 0, void 0, function () {
            var data, order, conversation, err_1;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        _e.trys.push([0, 10, , 11]);
                        data = __assign({}, createDto);
                        if (user && user.type === 'CLIENT') {
                            data.clientId = user.id;
                        }
                        if (!data.orderId) {
                            data.orderId = "ORD-" + Date.now();
                        }
                        return [4 /*yield*/, this.prisma.order.create({
                                data: data,
                                include: { market: true, client: true }
                            })];
                    case 1:
                        order = _e.sent();
                        if (!((_a = order.market) === null || _a === void 0 ? void 0 : _a.ownerId)) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.notification.create({
                                userId: order.market.ownerId,
                                body: "New order (" + order.orderId + ") from " + ((_c = (_b = order.client) === null || _b === void 0 ? void 0 : _b.name) !== null && _c !== void 0 ? _c : 'a customer')
                            })];
                    case 2:
                        _e.sent();
                        _e.label = 3;
                    case 3:
                        if (!order.clientId) return [3 /*break*/, 5];
                        return [4 /*yield*/, this.notification.create({
                                userId: order.clientId,
                                body: "Your order (" + order.orderId + ") has been created successfully"
                            })];
                    case 4:
                        _e.sent();
                        _e.label = 5;
                    case 5: return [4 /*yield*/, this.prisma.conversation.findFirst({
                            where: {
                                AND: [
                                    { users: { has: order.clientId } },
                                    { users: { has: (_d = order.market) === null || _d === void 0 ? void 0 : _d.ownerId } },
                                ]
                            }
                        })];
                    case 6:
                        conversation = _e.sent();
                        if (!!conversation) return [3 /*break*/, 8];
                        return [4 /*yield*/, this.prisma.conversation.create({
                                data: {
                                    users: [order.clientId, order.market.ownerId]
                                }
                            })];
                    case 7:
                        conversation = _e.sent();
                        _e.label = 8;
                    case 8: 
                    // إنشاء BANAR message باستخدام الدالة من الـ helper
                    return [4 /*yield*/, this.prisma.message.create({
                            data: {
                                conversationId: conversation.id,
                                senderId: order.market.ownerId,
                                type: 'BANAR',
                                text: helper_1.buildOrderBanarMessage(order)
                            }
                        })];
                    case 9:
                        // إنشاء BANAR message باستخدام الدالة من الـ helper
                        _e.sent();
                        return [2 /*return*/, __assign(__assign({}, order), { time: order.time ? helper_1.formatTimeToAMPM(order.time) : null })];
                    case 10:
                        err_1 = _e.sent();
                        throw new common_1.BadRequestException((err_1 === null || err_1 === void 0 ? void 0 : err_1.message) || 'Failed to create order');
                    case 11: return [2 /*return*/];
                }
            });
        });
    };
    OrdersService.prototype.findAll = function (user) {
        return __awaiter(this, void 0, void 0, function () {
            var orders;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!user)
                            return [2 /*return*/, []];
                        orders = [];
                        if (!(user.type === 'CLIENT')) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.prisma.order.findMany({
                                where: { clientId: user.id },
                                include: { market: true, client: true },
                                orderBy: { createdAt: 'desc' }
                            })];
                    case 1:
                        orders = _a.sent();
                        return [3 /*break*/, 6];
                    case 2:
                        if (!(user.type === 'OWNER')) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.prisma.order.findMany({
                                where: { market: { ownerId: user.id } },
                                include: { market: true, client: true },
                                orderBy: { createdAt: 'desc' }
                            })];
                    case 3:
                        orders = _a.sent();
                        return [3 /*break*/, 6];
                    case 4: return [4 /*yield*/, this.prisma.order.findMany({
                            include: { market: true, client: true },
                            orderBy: { createdAt: 'desc' }
                        })];
                    case 5:
                        orders = _a.sent();
                        _a.label = 6;
                    case 6: return [2 /*return*/, orders.map(function (order) { return (__assign(__assign({}, order), { time: order.time ? helper_1.formatTimeToAMPM(order.time) : null })); })];
                }
            });
        });
    };
    OrdersService.prototype.findOne = function (id, user) {
        return __awaiter(this, void 0, void 0, function () {
            var order;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.prisma.order.findUnique({
                            where: { id: id },
                            include: { market: true, client: true }
                        })];
                    case 1:
                        order = _a.sent();
                        if (!order)
                            throw new common_1.NotFoundException('Order not found');
                        if (!user)
                            throw new common_1.ForbiddenException('Unauthorized');
                        if (user.type === 'CLIENT' && order.clientId !== user.id) {
                            throw new common_1.ForbiddenException('You can only view your own orders');
                        }
                        if (user.type === 'OWNER') {
                            if (!order.market || order.market.ownerId !== user.id) {
                                throw new common_1.ForbiddenException('You can only view orders for your market');
                            }
                        }
                        return [2 /*return*/, __assign(__assign({}, order), { time: order.time ? helper_1.formatTimeToAMPM(order.time) : null })];
                }
            });
        });
    };
    OrdersService.prototype.update = function (id, dto, user) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var order, updated, err_2;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.prisma.order.findUnique({
                            where: { id: id },
                            include: { market: true, client: true }
                        })];
                    case 1:
                        order = _b.sent();
                        if (!order)
                            throw new common_1.NotFoundException('Order not found');
                        if (!user)
                            throw new common_1.ForbiddenException('Unauthorized');
                        if (user.type !== 'OWNER' || ((_a = order.market) === null || _a === void 0 ? void 0 : _a.ownerId) !== user.id) {
                            throw new common_1.ForbiddenException('Only the owner of the market can modify this order');
                        }
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 6, , 7]);
                        return [4 /*yield*/, this.prisma.order.update({
                                where: { id: id },
                                data: dto,
                                include: { market: true, client: true }
                            })];
                    case 3:
                        updated = _b.sent();
                        if (!updated.clientId) return [3 /*break*/, 5];
                        return [4 /*yield*/, this.notification.create({
                                userId: updated.clientId,
                                body: "Your order (" + updated.orderId + ") status is now: " + updated.status
                            })];
                    case 4:
                        _b.sent();
                        _b.label = 5;
                    case 5: return [2 /*return*/, __assign(__assign({}, updated), { time: updated.time ? helper_1.formatTimeToAMPM(updated.time) : null })];
                    case 6:
                        err_2 = _b.sent();
                        throw new common_1.BadRequestException((err_2 === null || err_2 === void 0 ? void 0 : err_2.message) || 'Failed to update order');
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    OrdersService.prototype.remove = function (id, user) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var order, err_3;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.prisma.order.findUnique({
                            where: { id: id },
                            include: { market: true, client: true }
                        })];
                    case 1:
                        order = _b.sent();
                        if (!order)
                            throw new common_1.NotFoundException('Order not found');
                        if (!user)
                            throw new common_1.ForbiddenException('Unauthorized');
                        if (user.type !== 'OWNER' || ((_a = order.market) === null || _a === void 0 ? void 0 : _a.ownerId) !== user.id) {
                            throw new common_1.ForbiddenException('Only the owner can delete this order');
                        }
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 6, , 7]);
                        return [4 /*yield*/, this.prisma.order["delete"]({ where: { id: id } })];
                    case 3:
                        _b.sent();
                        if (!order.clientId) return [3 /*break*/, 5];
                        return [4 /*yield*/, this.notification.create({
                                userId: order.clientId,
                                body: "Your order (" + order.orderId + ") was deleted by the market owner"
                            })];
                    case 4:
                        _b.sent();
                        _b.label = 5;
                    case 5: return [2 /*return*/, { success: true }];
                    case 6:
                        err_3 = _b.sent();
                        throw new common_1.BadRequestException((err_3 === null || err_3 === void 0 ? void 0 : err_3.message) || 'Failed to delete order');
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    OrdersService.prototype.removeAll = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.prisma.order.deleteMany({})];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    OrdersService = __decorate([
        common_1.Injectable()
    ], OrdersService);
    return OrdersService;
}());
exports.OrdersService = OrdersService;
