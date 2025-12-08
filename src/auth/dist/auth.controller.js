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
exports.AuthController = void 0;
// auth.controller.ts
var common_1 = require("@nestjs/common");
var passport_1 = require("@nestjs/passport");
var roles_gaurd_1 = require("./roles.gaurd");
var Role_decorator_1 = require("./Role.decorator");
var roles_enum_1 = require("./roles.enum");
var platform_express_1 = require("@nestjs/platform-express");
var multer_config_1 = require("../upload/multer.config");
var AuthController = /** @class */ (function () {
    function AuthController(authService) {
        this.authService = authService;
    }
    AuthController.prototype.register = function (file, dto) {
        return __awaiter(this, void 0, void 0, function () {
            var imageUrl;
            return __generator(this, function (_a) {
                imageUrl = file ? "/uploads/" + file.originalname : null;
                return [2 /*return*/, this.authService.register(dto, imageUrl)];
            });
        });
    };
    AuthController.prototype.login = function (authDto) {
        return this.authService.login(authDto);
    };
    AuthController.prototype.verifyOtp = function (dto) {
        return this.authService.verifyOtp(dto);
    };
    AuthController.prototype.deleteAllData = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.authService.deleteAllData()];
            });
        });
    };
    AuthController.prototype.getProfile = function (req) {
        return req.user;
    };
    AuthController.prototype.updateUser = function (files, dto, req) {
        return __awaiter(this, void 0, void 0, function () {
            var userId, userImage, marketImage;
            return __generator(this, function (_a) {
                userId = req.user.id;
                userImage = null;
                marketImage = null;
                // Loop files
                files.forEach(function (file) {
                    if (file.fieldname === 'image') {
                        userImage = "/uploads/" + file.filename;
                    }
                    if (file.fieldname === 'marketImage') {
                        marketImage = "/uploads/" + file.filename;
                    }
                });
                return [2 /*return*/, this.authService.updateUser(userId, dto, userImage, marketImage)];
            });
        });
    };
    AuthController.prototype.createAddress = function (userId, dto) {
        return this.authService.createAddress(userId, dto);
    };
    AuthController.prototype.updateAddress = function (addressId, dto) {
        return this.authService.updateAddress(addressId, dto);
    };
    AuthController.prototype.deleteAddress = function (addressId) {
        return this.authService.deleteAddress(addressId);
    };
    AuthController.prototype.getUserAddresses = function (userId) {
        return this.authService.getUserAddresses(userId);
    };
    AuthController.prototype.adminLogin = function (authDto) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.authService.adminLogin(authDto)];
            });
        });
    };
    AuthController.prototype.addAdmin = function (dto, req) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.authService.addAdmin(dto)];
            });
        });
    };
    __decorate([
        common_1.Post('register'),
        common_1.UseInterceptors(platform_express_1.FileInterceptor('image', multer_config_1.multerConfig)),
        __param(0, common_1.UploadedFile()),
        __param(1, common_1.Body())
    ], AuthController.prototype, "register");
    __decorate([
        common_1.Post('login'),
        __param(0, common_1.Body())
    ], AuthController.prototype, "login");
    __decorate([
        common_1.Post('verify-otp'),
        __param(0, common_1.Body())
    ], AuthController.prototype, "verifyOtp");
    __decorate([
        common_1.Delete('delete-all-data')
    ], AuthController.prototype, "deleteAllData");
    __decorate([
        common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_gaurd_1.RolesGuard),
        Role_decorator_1.Roles(roles_enum_1.Role.CLIENT, roles_enum_1.Role.OWNER),
        common_1.Post('me'),
        __param(0, common_1.Req())
    ], AuthController.prototype, "getProfile");
    __decorate([
        common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_gaurd_1.RolesGuard),
        Role_decorator_1.Roles(roles_enum_1.Role.CLIENT, roles_enum_1.Role.OWNER),
        common_1.Patch('update'),
        common_1.UseInterceptors(platform_express_1.AnyFilesInterceptor(multer_config_1.multerConfig)),
        __param(0, common_1.UploadedFiles()),
        __param(1, common_1.Body()),
        __param(2, common_1.Req())
    ], AuthController.prototype, "updateUser");
    __decorate([
        common_1.Post('address/user/:userId'),
        __param(0, common_1.Param('userId')), __param(1, common_1.Body())
    ], AuthController.prototype, "createAddress");
    __decorate([
        common_1.Patch('address/update/:addressId'),
        __param(0, common_1.Param('addressId')), __param(1, common_1.Body())
    ], AuthController.prototype, "updateAddress");
    __decorate([
        common_1.Delete('address/delete/:addressId'),
        __param(0, common_1.Param('addressId'))
    ], AuthController.prototype, "deleteAddress");
    __decorate([
        common_1.Get('address/user/:userId'),
        __param(0, common_1.Param('userId'))
    ], AuthController.prototype, "getUserAddresses");
    __decorate([
        common_1.Post('admin/login'),
        __param(0, common_1.Body())
    ], AuthController.prototype, "adminLogin");
    __decorate([
        common_1.Post('add-admin'),
        __param(0, common_1.Body()), __param(1, common_1.Req())
    ], AuthController.prototype, "addAdmin");
    AuthController = __decorate([
        common_1.Controller({
            path: 'auth',
            version: '1'
        })
    ], AuthController);
    return AuthController;
}());
exports.AuthController = AuthController;
