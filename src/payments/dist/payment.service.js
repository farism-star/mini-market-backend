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
exports.PaymentService = void 0;
var common_1 = require("@nestjs/common");
var axios_1 = require("axios");
var crypto = require("crypto");
var client_1 = require("@prisma/client");
var PaymentService = /** @class */ (function () {
    function PaymentService(prisma) {
        this.prisma = prisma;
        this.CLICKPAY_API_URL = 'https://secure.clickpay.com.sa/payment/request';
        this.CLICKPAY_QUERY_URL = 'https://secure.clickpay.com.sa/payment/query';
        this.PROFILE_ID = process.env.PROFILE_ID;
        if (!process.env.CLICKPAY_SERVER_KEY) {
            throw new Error('CLICKPAY_SERVER_KEY is not defined');
        }
        this.SERVER_KEY = process.env.CLICKPAY_SERVER_KEY;
    }
    PaymentService.prototype.initiatePayment = function (userId, amount) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var user, market, payment, paymentRequest, response, data, error_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.prisma.user.findUnique({
                            where: { id: userId },
                            select: {
                                name: true,
                                email: true,
                                phone: true,
                                isAproved: true,
                                isFeesRequired: true
                            }
                        })];
                    case 1:
                        user = _b.sent();
                        if (!user)
                            throw new common_1.NotFoundException('User not found');
                        return [4 /*yield*/, this.prisma.market.findUnique({
                                where: { ownerId: userId },
                                select: { id: true, nameAr: true, nameEn: true }
                            })];
                    case 2:
                        market = _b.sent();
                        if (!market)
                            throw new common_1.NotFoundException('Market not found');
                        return [4 /*yield*/, this.prisma.payment.create({
                                data: {
                                    user: { connect: { id: userId } },
                                    amount: amount,
                                    method: 'ONLINE',
                                    status: 'PENDING'
                                }
                            })];
                    case 3:
                        payment = _b.sent();
                        paymentRequest = {
                            profile_id: this.PROFILE_ID,
                            tran_type: 'sale',
                            tran_class: 'ecom',
                            cart_id: payment.id,
                            cart_description: "Payment for market " + (market.nameAr || market.nameEn),
                            cart_currency: 'SAR',
                            cart_amount: amount,
                            customer_details: {
                                name: user.name,
                                email: user.email || 'N/A',
                                phone: user.phone || 'N/A',
                                street1: 'N/A',
                                city: 'Riyadh',
                                state: 'Riyadh',
                                country: 'SA',
                                zip: '12345'
                            },
                            hide_shipping: true,
                            framed: false
                        };
                        _b.label = 4;
                    case 4:
                        _b.trys.push([4, 7, , 9]);
                        return [4 /*yield*/, axios_1["default"].post(this.CLICKPAY_API_URL, paymentRequest, {
                                headers: {
                                    Authorization: this.SERVER_KEY,
                                    'Content-Type': 'application/json'
                                }
                            })];
                    case 5:
                        response = _b.sent();
                        data = response.data;
                        if (!data.tran_ref)
                            throw new common_1.BadRequestException('ClickPay failed');
                        return [4 /*yield*/, this.prisma.payment.update({
                                where: { id: payment.id },
                                data: {
                                    clickpayOrderId: data.tran_ref,
                                    clickpayCartId: data.cart_id
                                }
                            })];
                    case 6:
                        _b.sent();
                        return [2 /*return*/, {
                                success: true,
                                paymentId: payment.id,
                                redirectUrl: data.redirect_url,
                                data: data
                            }];
                    case 7:
                        error_1 = _b.sent();
                        return [4 /*yield*/, this.prisma.payment.update({
                                where: { id: payment.id },
                                data: { status: 'FAILED' }
                            })];
                    case 8:
                        _b.sent();
                        throw new common_1.BadRequestException(((_a = error_1.response) === null || _a === void 0 ? void 0 : _a.data) || error_1.message);
                    case 9: return [2 /*return*/];
                }
            });
        });
    };
    PaymentService.prototype.handleCallback = function (payload) {
        return __awaiter(this, void 0, void 0, function () {
            var tran_ref, cart_id, resp_status, resp_code, payment, status;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        tran_ref = payload.tran_ref, cart_id = payload.cart_id, resp_status = payload.resp_status, resp_code = payload.resp_code;
                        if (!this.verifySignature(payload)) {
                            throw new common_1.BadRequestException('Invalid signature');
                        }
                        return [4 /*yield*/, this.prisma.payment.findUnique({
                                where: { id: cart_id }
                            })];
                    case 1:
                        payment = _a.sent();
                        if (!payment)
                            throw new common_1.NotFoundException('Payment not found');
                        status = client_1.PaymentStatus.FAILED;
                        if (resp_status === 'A' && resp_code === '100') {
                            status = client_1.PaymentStatus.SUCCESS;
                        }
                        return [4 /*yield*/, this.prisma.payment.update({
                                where: { id: cart_id },
                                data: {
                                    status: status,
                                    clickpayOrderId: tran_ref,
                                    clickpayResponse: JSON.stringify(payload)
                                }
                            })];
                    case 2:
                        _a.sent();
                        if (!(status === client_1.PaymentStatus.SUCCESS)) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.prisma.user.update({
                                where: { id: payment.userId },
                                data: {
                                    isFeesRequired: false,
                                    isAproved: true
                                }
                            })];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4: return [2 /*return*/, {
                            success: true,
                            status: status,
                            transactionRef: tran_ref
                        }];
                }
            });
        });
    };
    PaymentService.prototype.verifyPaymentStatus = function (tranRef) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var response, result, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, axios_1["default"].post(this.CLICKPAY_QUERY_URL, {
                                profile_id: this.PROFILE_ID,
                                tran_ref: tranRef
                            }, {
                                headers: {
                                    Authorization: this.SERVER_KEY,
                                    'Content-Type': 'application/json'
                                }
                            })];
                    case 1:
                        response = _c.sent();
                        result = (_a = response.data) === null || _a === void 0 ? void 0 : _a.payment_result;
                        if (!result) {
                            return [2 /*return*/, { success: false, status: 'UNKNOWN' }];
                        }
                        if (result.response_status === 'A') {
                            return [2 /*return*/, { success: true, status: 'SUCCESS', data: response.data }];
                        }
                        if (result.response_status === 'P') {
                            return [2 /*return*/, { success: false, status: 'PENDING', data: response.data }];
                        }
                        return [2 /*return*/, { success: false, status: 'FAILED', data: response.data }];
                    case 2:
                        _b = _c.sent();
                        throw new common_1.BadRequestException('Verification failed');
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    PaymentService.prototype.verifySignature = function (data) {
        var tran_ref = data.tran_ref, cart_id = data.cart_id, cart_amount = data.cart_amount, cart_currency = data.cart_currency, signature = data.signature;
        var signatureString = "" + this.SERVER_KEY + tran_ref + cart_id + cart_amount + cart_currency;
        var hash = crypto
            .createHmac('sha256', this.SERVER_KEY)
            .update(signatureString)
            .digest('hex')
            .toUpperCase();
        return hash === signature;
    };
    PaymentService = __decorate([
        common_1.Injectable()
    ], PaymentService);
    return PaymentService;
}());
exports.PaymentService = PaymentService;
