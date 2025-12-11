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
exports.AuthService = void 0;
// auth.service.ts
var common_1 = require("@nestjs/common");
var crypto_1 = require("crypto");
var bcrypt = require("bcrypt");
var distance_1 = require("src/helpers/distance");
var AuthService = /** @class */ (function () {
    function AuthService(prisma, jwtService, cloudinary, mailService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
        this.cloudinary = cloudinary;
        this.mailService = mailService;
    }
    AuthService.prototype.register = function (dto, imageUrl) {
        return __awaiter(this, void 0, void 0, function () {
            var email, phone, name, type, zone, district, address, operations, hours, location, marketName, categoryIds, existingUser, user, market, marketCategories;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        email = dto.email, phone = dto.phone, name = dto.name, type = dto.type, zone = dto.zone, district = dto.district, address = dto.address, operations = dto.operations, hours = dto.hours, location = dto.location, marketName = dto.marketName, categoryIds = dto.categoryIds;
                        return [4 /*yield*/, this.prisma.user.findFirst({
                                where: { OR: [{ email: email }, { phone: phone }] }
                            })];
                    case 1:
                        existingUser = _a.sent();
                        if (existingUser) {
                            throw new common_1.ConflictException('User already exists with this email or phone');
                        }
                        return [4 /*yield*/, this.prisma.user.create({
                                data: {
                                    name: name,
                                    email: email !== null && email !== void 0 ? email : null,
                                    phone: phone,
                                    type: type,
                                    image: imageUrl,
                                    phoneVerified: false,
                                    location: type !== 'OWNER' ? (location !== null && location !== void 0 ? location : []) : [],
                                    addresses: {
                                        create: {
                                            type: 'HOME',
                                            fullAddress: address !== null && address !== void 0 ? address : '',
                                            isSelected: true
                                        }
                                    }
                                },
                                include: { addresses: true }
                            })];
                    case 2:
                        user = _a.sent();
                        market = null;
                        if (!(type === 'OWNER')) return [3 /*break*/, 5];
                        return [4 /*yield*/, this.prisma.market.create({
                                data: {
                                    nameAr: marketName !== null && marketName !== void 0 ? marketName : name + "'s Market",
                                    ownerId: user.id,
                                    zone: zone !== null && zone !== void 0 ? zone : '',
                                    district: district !== null && district !== void 0 ? district : '',
                                    address: address !== null && address !== void 0 ? address : '',
                                    operations: operations !== null && operations !== void 0 ? operations : [],
                                    hours: hours !== null && hours !== void 0 ? hours : [],
                                    location: location !== null && location !== void 0 ? location : []
                                }
                            })];
                    case 3:
                        market = _a.sent();
                        if (!(Array.isArray(dto.categoryIds) && dto.categoryIds.length > 0)) return [3 /*break*/, 5];
                        marketCategories = dto.categoryIds.map(function (catId) { return ({
                            marketId: market.id,
                            categoryId: catId
                        }); });
                        return [4 /*yield*/, this.prisma.marketCategory.createMany({ data: marketCategories })];
                    case 4:
                        _a.sent();
                        _a.label = 5;
                    case 5: 
                    // إرسال OTP (مثال)
                    return [4 /*yield*/, this.sendOtp({ email: email, phone: phone })];
                    case 6:
                        // إرسال OTP (مثال)
                        _a.sent();
                        return [2 /*return*/, { message: 'User registered successfully', user: user, market: market }];
                }
            });
        });
    };
    AuthService.prototype.checkOwnerApproved = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            var user;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.prisma.user.findUnique({
                            where: { id: userId },
                            select: { isAproved: true, isFeesRequired: true, name: true, id: true }
                        })];
                    case 1:
                        user = _a.sent();
                        if (!user) {
                            throw new common_1.NotFoundException('User not found');
                        }
                        return [2 /*return*/, {
                                message: "Owner approval status loaded",
                                isApproved: user.isAproved,
                                isFeesRequired: user.isFeesRequired
                            }];
                }
            });
        });
    };
    AuthService.prototype.checkOwnerFees = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            var user, market, limitFees, currentFees, feePerOrder, totalDue, messageEn, messageAr;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.prisma.user.findUnique({
                            where: { id: userId },
                            select: { name: true, id: true }
                        })];
                    case 1:
                        user = _a.sent();
                        if (!user)
                            throw new common_1.NotFoundException('User not found');
                        return [4 /*yield*/, this.prisma.market.findUnique({
                                where: { ownerId: userId },
                                select: {
                                    id: true,
                                    nameAr: true,
                                    nameEn: true,
                                    limitFees: true,
                                    currentFees: true,
                                    feePerOrder: true
                                }
                            })];
                    case 2:
                        market = _a.sent();
                        if (!market)
                            throw new common_1.NotFoundException('Market not found');
                        limitFees = market.limitFees || 0;
                        currentFees = market.currentFees || 0;
                        feePerOrder = market.feePerOrder || 0;
                        totalDue = limitFees - currentFees;
                        messageEn = '';
                        messageAr = '';
                        if (totalDue > 0) {
                            messageEn = "\u26A0\uFE0F Attention! You have pending fees that must be paid before opening your market.\nLimit Fees: " + limitFees.toFixed(2) + "\nCurrent Fees Paid: " + currentFees.toFixed(2) + "\nFee Per Order: " + feePerOrder.toFixed(2) + "\nAmount Due: " + totalDue.toFixed(2);
                            messageAr = "\u26A0\uFE0F \u062A\u0646\u0628\u064A\u0647! \u0644\u062F\u064A\u0643 \u0645\u0633\u062A\u062D\u0642\u0627\u062A \u0644\u0645 \u064A\u062A\u0645 \u062F\u0641\u0639\u0647\u0627 \u0628\u0639\u062F\u060C \u064A\u062C\u0628 \u062F\u0641\u0639\u0647\u0627 \u0642\u0628\u0644 \u0641\u062A\u062D \u0627\u0644\u0633\u0648\u0642.\n\u0627\u0644\u062D\u062F \u0627\u0644\u0623\u0642\u0635\u0649 \u0644\u0644\u0631\u0633\u0648\u0645: " + limitFees.toFixed(2) + "\n\u0627\u0644\u0645\u0633\u062A\u062D\u0642 \u0627\u0644\u0645\u062F\u0641\u0648\u0639: " + currentFees.toFixed(2) + "\n\u0627\u0644\u0631\u0633\u0648\u0645 \u0644\u0643\u0644 \u0637\u0644\u0628: " + feePerOrder.toFixed(2) + "\n\u0627\u0644\u0645\u0628\u0644\u063A \u0627\u0644\u0645\u0633\u062A\u062D\u0642: " + totalDue.toFixed(2);
                        }
                        else {
                            messageEn = "\u2705 Your market is in good standing. No pending fees.";
                            messageAr = "\uD83D\uDC4D \u0633\u0648\u0642\u0643 \u062C\u0627\u0647\u0632 \u0644\u0644\u0639\u0645\u0644\u060C \u0644\u0627 \u062A\u0648\u062C\u062F \u0645\u0633\u062A\u062D\u0642\u0627\u062A \u0645\u062A\u0628\u0642\u064A\u0629.";
                        }
                        return [2 /*return*/, {
                                market: market,
                                fees: {
                                    limitFees: limitFees,
                                    currentFees: currentFees,
                                    feePerOrder: feePerOrder,
                                    totalDue: totalDue
                                },
                                messageEn: messageEn,
                                messageAr: messageAr
                            }];
                }
            });
        });
    };
    AuthService.prototype.addAdmin = function (dto) {
        return __awaiter(this, void 0, void 0, function () {
            var email, name, password, existingAdmin, existingUser, hashedPassword, admin, admin_token;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        email = dto.email, name = dto.name, password = dto.password;
                        if (!email || !password) {
                            throw new common_1.BadRequestException('Email and password are required');
                        }
                        return [4 /*yield*/, this.prisma.userDashboard.findFirst({
                                where: { type: 'ADMIN' }
                            })];
                    case 1:
                        existingAdmin = _a.sent();
                        if (existingAdmin) {
                            throw new common_1.ConflictException('Admin already exists');
                        }
                        return [4 /*yield*/, this.prisma.userDashboard.findFirst({
                                where: { email: email }
                            })];
                    case 2:
                        existingUser = _a.sent();
                        if (existingUser) {
                            throw new common_1.ConflictException('Email or phone already in use');
                        }
                        return [4 /*yield*/, bcrypt.hash(password, 10)];
                    case 3:
                        hashedPassword = _a.sent();
                        return [4 /*yield*/, this.prisma.userDashboard.create({
                                data: {
                                    name: name,
                                    email: email,
                                    password: hashedPassword,
                                    type: 'ADMIN'
                                }
                            })];
                    case 4:
                        admin = _a.sent();
                        admin_token = this.jwtService.sign({ sub: admin.id, type: admin.type });
                        return [2 /*return*/, { message: 'Admin created successfully', admin: admin, admin_token: admin_token }];
                }
            });
        });
    };
    AuthService.prototype.adminLogin = function (authDto) {
        return __awaiter(this, void 0, void 0, function () {
            var email, phone, password, admin, isPasswordValid, admin_token;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        email = authDto.email, phone = authDto.phone, password = authDto.password;
                        if (!email && !phone)
                            throw new common_1.BadRequestException('Email or phone is required');
                        return [4 /*yield*/, this.prisma.userDashboard.findFirst({
                                where: { email: email, type: 'ADMIN' }
                            })];
                    case 1:
                        admin = _a.sent();
                        if (!admin)
                            throw new common_1.UnauthorizedException('Admin not found');
                        return [4 /*yield*/, bcrypt.compare(password, admin.password)];
                    case 2:
                        isPasswordValid = _a.sent();
                        if (!isPasswordValid)
                            throw new common_1.UnauthorizedException('Invalid credentials');
                        admin_token = this.jwtService.sign({ sub: admin.id, type: admin.type });
                        return [2 /*return*/, { admin_token: admin_token, admin: admin }];
                }
            });
        });
    };
    // جلب كل الـ Clients
    AuthService.prototype.getAllClients = function () {
        return __awaiter(this, void 0, void 0, function () {
            var clients;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.prisma.user.findMany({
                            where: { type: 'CLIENT' },
                            include: { addresses: true, market: true }
                        })];
                    case 1:
                        clients = _a.sent();
                        return [2 /*return*/, clients];
                }
            });
        });
    };
    // جلب كل الـ Owners
    AuthService.prototype.getAllOwners = function () {
        return __awaiter(this, void 0, void 0, function () {
            var owners;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.prisma.user.findMany({
                            where: { type: 'OWNER' },
                            include: { addresses: true, market: true }
                        })];
                    case 1:
                        owners = _a.sent();
                        return [2 /*return*/, owners];
                }
            });
        });
    };
    // auth.service.ts
    AuthService.prototype.getMarkets = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.prisma.market.findMany({
                        include: {
                            owner: true,
                            products: true
                        }
                    })];
            });
        });
    };
    AuthService.prototype.getDashboardData = function (userId, type, categoryId) {
        return __awaiter(this, void 0, void 0, function () {
            var conversations, formattedConversation, lastConversation, otherUserId, otherUser, lastMsg, lastProducts, categories, user, userLocation, markets, marketsWithDistance, sortedMarkets, filteredMarkets;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(type === 'OWNER')) return [3 /*break*/, 5];
                        return [4 /*yield*/, this.prisma.conversation.findMany({
                                where: { users: { has: userId } },
                                include: {
                                    messages: { orderBy: { createdAt: 'desc' }, take: 1 },
                                    _count: {
                                        select: {
                                            messages: { where: { senderId: { not: userId }, isRead: false } }
                                        }
                                    }
                                },
                                orderBy: { updatedAt: 'desc' },
                                take: 1
                            })];
                    case 1:
                        conversations = _a.sent();
                        formattedConversation = null;
                        if (!(conversations.length > 0)) return [3 /*break*/, 3];
                        lastConversation = conversations[0];
                        otherUserId = lastConversation.users.find(function (uid) { return uid !== userId; });
                        return [4 /*yield*/, this.prisma.user.findUnique({
                                where: { id: otherUserId },
                                select: { id: true, name: true, image: true }
                            })];
                    case 2:
                        otherUser = _a.sent();
                        lastMsg = lastConversation.messages[0];
                        formattedConversation = {
                            id: lastConversation.id,
                            user: otherUser,
                            lastMessage: lastMsg
                                ? {
                                    id: lastMsg.id,
                                    type: lastMsg.type,
                                    senderId: lastMsg.senderId,
                                    text: lastMsg.text,
                                    image: lastMsg.imageUrl,
                                    voice: lastMsg.voice,
                                    createdAt: lastMsg.createdAt
                                }
                                : null,
                            unreadMessages: lastConversation._count.messages
                        };
                        _a.label = 3;
                    case 3: return [4 /*yield*/, this.prisma.product.findMany({
                            orderBy: { createdAt: 'desc' },
                            take: 5,
                            include: { market: true }
                        })];
                    case 4:
                        lastProducts = _a.sent();
                        return [2 /*return*/, { lastConversation: formattedConversation, lastProducts: lastProducts }];
                    case 5: return [4 /*yield*/, this.prisma.category.findMany()];
                    case 6:
                        categories = _a.sent();
                        return [4 /*yield*/, this.prisma.user.findUnique({
                                where: { id: userId },
                                select: { location: true }
                            })];
                    case 7:
                        user = _a.sent();
                        userLocation = user === null || user === void 0 ? void 0 : user.location;
                        return [4 /*yield*/, this.prisma.market.findMany({
                                where: categoryId
                                    ? {
                                        categories: {
                                            some: {
                                                categoryId: categoryId
                                            }
                                        }
                                    }
                                    : undefined,
                                select: {
                                    id: true,
                                    nameAr: true,
                                    nameEn: true,
                                    descriptionAr: true,
                                    descriptionEn: true,
                                    ownerId: true,
                                    zone: true,
                                    district: true,
                                    address: true,
                                    operations: true,
                                    hours: true,
                                    image: true,
                                    commissionFee: true,
                                    location: true,
                                    rate: true,
                                    isOpen: true,
                                    from: true,
                                    to: true,
                                    createdAt: true,
                                    updatedAt: true
                                }
                            })];
                    case 8:
                        markets = _a.sent();
                        // لو المستخدم ليه location
                        if (userLocation) {
                            marketsWithDistance = markets.map(function (m) {
                                var _a;
                                var distanceInKm = null;
                                if (((_a = m.location) === null || _a === void 0 ? void 0 : _a.length) === 2) {
                                    distanceInKm = distance_1.getDistance(userLocation[0], userLocation[1], m.location[0], m.location[1]);
                                }
                                return __assign(__assign({}, m), { distanceInKm: distanceInKm });
                            });
                            sortedMarkets = marketsWithDistance.sort(function (a, b) { var _a, _b; return ((_a = a.distanceInKm) !== null && _a !== void 0 ? _a : Infinity) - ((_b = b.distanceInKm) !== null && _b !== void 0 ? _b : Infinity); });
                            filteredMarkets = sortedMarkets.filter(function (m) { return m.distanceInKm !== null && m.distanceInKm <= 30; });
                            return [2 /*return*/, { categories: categories, markets: filteredMarkets }];
                        }
                        return [2 /*return*/, { categories: categories, markets: markets }];
                }
            });
        });
    };
    AuthService.prototype.login = function (authDto) {
        return __awaiter(this, void 0, void 0, function () {
            var email, phone, user;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        email = authDto.email, phone = authDto.phone;
                        if (!email && !phone) {
                            throw new common_1.BadRequestException('Email or phone is required');
                        }
                        return [4 /*yield*/, this.prisma.user.findFirst({
                                where: { OR: [{ email: email }, { phone: phone }] },
                                include: { market: true, addresses: true }
                            })];
                    case 1:
                        user = _a.sent();
                        if (!user) {
                            throw new common_1.UnauthorizedException('User not found');
                        }
                        return [4 /*yield*/, this.sendOtp({ email: user.email, phone: user.phone })];
                    case 2:
                        _a.sent();
                        return [2 /*return*/, { message: 'OTP sent', user: user }];
                }
            });
        });
    };
    AuthService.prototype.sendOtp = function (authDto) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var identifier, otpCode, expiresAt, user;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        identifier = (_a = authDto.phone) !== null && _a !== void 0 ? _a : authDto.email;
                        if (!identifier) {
                            throw new common_1.BadRequestException('Phone or email is required');
                        }
                        otpCode = crypto_1.randomInt(10000, 99999).toString();
                        expiresAt = new Date(Date.now() + 5 * 60 * 1000);
                        return [4 /*yield*/, this.prisma.user.findFirst({
                                where: { OR: [{ phone: authDto.phone }, { email: authDto.email }] }
                            })];
                    case 1:
                        user = _b.sent();
                        if (!user) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.prisma.otp.deleteMany({ where: { userId: user.id } })];
                    case 2:
                        _b.sent();
                        _b.label = 3;
                    case 3: return [4 /*yield*/, this.prisma.otp.create({
                            data: { code: otpCode, identifier: identifier, userId: user ? user.id : null, expiresAt: expiresAt }
                        })];
                    case 4:
                        _b.sent();
                        if (!user || !user.email) {
                            throw new common_1.NotFoundException("You Don't Have Email To Send OTP!");
                        }
                        // await this.mailService.sendOtpMail(user.email, otpCode)
                        console.log(otpCode);
                        return [2 /*return*/, { message: 'OTP sent successfully' }];
                }
            });
        });
    };
    AuthService.prototype.verifyOtp = function (dto) {
        var _a, _b, _c;
        return __awaiter(this, void 0, void 0, function () {
            var identifier, otpRecord, user, token;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        identifier = (_a = dto.phone) !== null && _a !== void 0 ? _a : dto.email;
                        if (!identifier) {
                            throw new common_1.BadRequestException('Phone or email is required');
                        }
                        return [4 /*yield*/, this.prisma.otp.findFirst({
                                where: { identifier: identifier },
                                orderBy: { createdAt: 'desc' }
                            })];
                    case 1:
                        otpRecord = _d.sent();
                        if (!otpRecord) {
                            throw new common_1.UnauthorizedException('OTP not found');
                        }
                        if (!(new Date() > otpRecord.expiresAt)) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.prisma.otp["delete"]({ where: { id: otpRecord.id } })];
                    case 2:
                        _d.sent();
                        throw new common_1.UnauthorizedException('OTP expired');
                    case 3:
                        if (otpRecord.code !== dto.otp) {
                            throw new common_1.UnauthorizedException('Invalid OTP');
                        }
                        return [4 /*yield*/, this.prisma.otp["delete"]({ where: { id: otpRecord.id } })];
                    case 4:
                        _d.sent();
                        return [4 /*yield*/, this.prisma.user.findFirst({
                                where: { OR: [{ phone: (_b = dto.phone) !== null && _b !== void 0 ? _b : null }, { email: (_c = dto.email) !== null && _c !== void 0 ? _c : null }] },
                                include: { market: true, addresses: true }
                            })];
                    case 5:
                        user = _d.sent();
                        if (!user) {
                            throw new common_1.UnauthorizedException('User not found');
                        }
                        return [4 /*yield*/, this.prisma.user.update({
                                where: { id: user.id },
                                data: { phoneVerified: true }
                            })];
                    case 6:
                        _d.sent();
                        token = this.jwtService.sign({ sub: user.id, type: user.type });
                        return [2 /*return*/, { token: token, user: user }];
                }
            });
        });
    };
    AuthService.prototype.updateUser = function (userId, dto, userImage, marketImage) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r;
        return __awaiter(this, void 0, void 0, function () {
            var user, existingPhone, existingEmail, finalUserImage, finalMarketImage;
            return __generator(this, function (_s) {
                switch (_s.label) {
                    case 0: return [4 /*yield*/, this.prisma.user.findUnique({
                            where: { id: userId },
                            include: { market: true, addresses: true }
                        })];
                    case 1:
                        user = _s.sent();
                        if (!user)
                            throw new common_1.NotFoundException('User not found');
                        if (!(dto.phone && dto.phone !== user.phone)) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.prisma.user.findFirst({
                                where: { phone: dto.phone }
                            })];
                    case 2:
                        existingPhone = _s.sent();
                        if (existingPhone) {
                            throw new common_1.BadRequestException('Phone number is already in use by another user.');
                        }
                        _s.label = 3;
                    case 3:
                        if (!(dto.email && dto.email !== user.email)) return [3 /*break*/, 5];
                        return [4 /*yield*/, this.prisma.user.findFirst({
                                where: { email: dto.email }
                            })];
                    case 4:
                        existingEmail = _s.sent();
                        if (existingEmail) {
                            throw new common_1.BadRequestException('Email is already in use by another user.');
                        }
                        _s.label = 5;
                    case 5:
                        finalUserImage = user.image;
                        if (userImage)
                            finalUserImage = userImage;
                        return [4 /*yield*/, this.prisma.user.update({
                                where: { id: userId },
                                data: {
                                    name: (_a = dto.name) !== null && _a !== void 0 ? _a : user.name,
                                    email: (_b = dto.email) !== null && _b !== void 0 ? _b : user.email,
                                    isAproved: (_c = dto.isAproved) !== null && _c !== void 0 ? _c : false,
                                    phone: (_d = dto.phone) !== null && _d !== void 0 ? _d : user.phone,
                                    image: finalUserImage
                                }
                            })];
                    case 6:
                        _s.sent();
                        if (!(user.type === 'OWNER' && user.market)) return [3 /*break*/, 8];
                        finalMarketImage = user.market.image;
                        if (marketImage)
                            finalMarketImage = marketImage;
                        return [4 /*yield*/, this.prisma.market.update({
                                where: { id: user.market.id },
                                data: {
                                    nameAr: (_f = (_e = dto.market) === null || _e === void 0 ? void 0 : _e.name) !== null && _f !== void 0 ? _f : user.market.nameAr,
                                    zone: (_h = (_g = dto.market) === null || _g === void 0 ? void 0 : _g.zone) !== null && _h !== void 0 ? _h : user.market.zone,
                                    district: (_k = (_j = dto.market) === null || _j === void 0 ? void 0 : _j.district) !== null && _k !== void 0 ? _k : user.market.district,
                                    address: (_m = (_l = dto.market) === null || _l === void 0 ? void 0 : _l.address) !== null && _m !== void 0 ? _m : user.market.address,
                                    operations: (_p = (_o = dto.market) === null || _o === void 0 ? void 0 : _o.operations) !== null && _p !== void 0 ? _p : user.market.operations,
                                    hours: (_r = (_q = dto.market) === null || _q === void 0 ? void 0 : _q.hours) !== null && _r !== void 0 ? _r : user.market.hours,
                                    image: finalMarketImage
                                }
                            })];
                    case 7:
                        _s.sent();
                        _s.label = 8;
                    case 8: return [2 /*return*/, this.prisma.user.findUnique({
                            where: { id: userId },
                            include: { market: true, addresses: true }
                        })];
                }
            });
        });
    };
    AuthService.prototype.createAddress = function (userId, dto) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function () {
            var address;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        if (!dto.fullAddress) {
                            throw new common_1.BadRequestException('fullAddress is required');
                        }
                        if (!dto.isSelected) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.prisma.address.updateMany({
                                where: { userId: userId },
                                data: { isSelected: false }
                            })];
                    case 1:
                        _c.sent();
                        _c.label = 2;
                    case 2: return [4 /*yield*/, this.prisma.address.create({
                            data: {
                                type: (_a = dto.type) !== null && _a !== void 0 ? _a : 'HOME',
                                fullAddress: dto.fullAddress,
                                isSelected: (_b = dto.isSelected) !== null && _b !== void 0 ? _b : false,
                                userId: userId
                            }
                        })];
                    case 3:
                        address = _c.sent();
                        return [2 /*return*/, { message: 'Address added', address: address }];
                }
            });
        });
    };
    AuthService.prototype.updateAddress = function (addressId, dto) {
        var _a, _b, _c;
        return __awaiter(this, void 0, void 0, function () {
            var address, updated;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0: return [4 /*yield*/, this.prisma.address.findUnique({ where: { id: addressId } })];
                    case 1:
                        address = _d.sent();
                        if (!address)
                            throw new common_1.NotFoundException('Address not found');
                        if (!dto.isSelected) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.prisma.address.updateMany({
                                where: { userId: address.userId },
                                data: { isSelected: false }
                            })];
                    case 2:
                        _d.sent();
                        _d.label = 3;
                    case 3: return [4 /*yield*/, this.prisma.address.update({
                            where: { id: addressId },
                            data: {
                                type: (_a = dto.type) !== null && _a !== void 0 ? _a : address.type,
                                fullAddress: (_b = dto.fullAddress) !== null && _b !== void 0 ? _b : address.fullAddress,
                                isSelected: (_c = dto.isSelected) !== null && _c !== void 0 ? _c : address.isSelected
                            }
                        })];
                    case 4:
                        updated = _d.sent();
                        return [2 /*return*/, { message: 'Address updated', updated: updated }];
                }
            });
        });
    };
    AuthService.prototype.deleteAddress = function (addressId) {
        return __awaiter(this, void 0, void 0, function () {
            var address;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.prisma.address.findUnique({ where: { id: addressId } })];
                    case 1:
                        address = _a.sent();
                        if (!address)
                            throw new common_1.NotFoundException('Address not found');
                        return [4 /*yield*/, this.prisma.address["delete"]({ where: { id: addressId } })];
                    case 2:
                        _a.sent();
                        return [2 /*return*/, { message: 'Address deleted' }];
                }
            });
        });
    };
    AuthService.prototype.getUserAddresses = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.prisma.address.findMany({
                            where: { userId: userId },
                            orderBy: { createdAt: 'desc' }
                        })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    AuthService.prototype.deleteAllData = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.prisma.order.deleteMany({})];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.prisma.notification.deleteMany({})];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, this.prisma.message.deleteMany({})];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, this.prisma.otp.deleteMany({})];
                    case 4:
                        _a.sent();
                        return [4 /*yield*/, this.prisma.product.deleteMany({})];
                    case 5:
                        _a.sent();
                        return [4 /*yield*/, this.prisma.marketCategory.deleteMany({})];
                    case 6:
                        _a.sent();
                        return [4 /*yield*/, this.prisma.market.deleteMany({})];
                    case 7:
                        _a.sent();
                        return [4 /*yield*/, this.prisma.address.deleteMany({})];
                    case 8:
                        _a.sent();
                        return [4 /*yield*/, this.prisma.user.deleteMany({})];
                    case 9:
                        _a.sent();
                        return [2 /*return*/, { message: 'All user data has been deleted successfully.' }];
                }
            });
        });
    };
    AuthService.prototype.deleteUser = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            var user;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.prisma.user.findUnique({
                            where: { id: userId },
                            include: { market: true }
                        })];
                    case 1:
                        user = _a.sent();
                        if (!user)
                            throw new common_1.NotFoundException('User not found');
                        return [4 /*yield*/, this.prisma.$transaction(function (prisma) { return __awaiter(_this, void 0, void 0, function () {
                                var marketId;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: 
                                        // حذف الرسائل والإشعارات والـ OTP الخاصة بالمستخدم
                                        return [4 /*yield*/, prisma.message.deleteMany({ where: { senderId: userId } })];
                                        case 1:
                                            // حذف الرسائل والإشعارات والـ OTP الخاصة بالمستخدم
                                            _a.sent();
                                            return [4 /*yield*/, prisma.notification.deleteMany({ where: { userId: userId } })];
                                        case 2:
                                            _a.sent();
                                            return [4 /*yield*/, prisma.otp.deleteMany({ where: { userId: userId } })];
                                        case 3:
                                            _a.sent();
                                            // حذف العناوين
                                            return [4 /*yield*/, prisma.address.deleteMany({ where: { userId: userId } })];
                                        case 4:
                                            // حذف العناوين
                                            _a.sent();
                                            if (!(user.type === 'OWNER' && user.market)) return [3 /*break*/, 8];
                                            marketId = user.market.id;
                                            return [4 /*yield*/, prisma.order.deleteMany({ where: { marketId: marketId } })];
                                        case 5:
                                            _a.sent();
                                            return [4 /*yield*/, prisma.product.deleteMany({ where: { marketId: marketId } })];
                                        case 6:
                                            _a.sent();
                                            return [4 /*yield*/, prisma.market["delete"]({ where: { id: marketId } })];
                                        case 7:
                                            _a.sent();
                                            _a.label = 8;
                                        case 8: 
                                        // حذف المستخدم نفسه
                                        return [4 /*yield*/, prisma.user["delete"]({ where: { id: userId } })];
                                        case 9:
                                            // حذف المستخدم نفسه
                                            _a.sent();
                                            return [2 /*return*/, { message: "User " + user.name + " has been deleted successfully." }];
                                    }
                                });
                            }); })];
                    case 2: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    AuthService = __decorate([
        common_1.Injectable()
    ], AuthService);
    return AuthService;
}());
exports.AuthService = AuthService;
