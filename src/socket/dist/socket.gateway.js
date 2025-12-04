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
exports.SocketGateway = void 0;
var websockets_1 = require("@nestjs/websockets");
var send_message_dto_1 = require("../message/dto/send-message.dto");
var fs_1 = require("fs");
var SocketGateway = /** @class */ (function () {
    function SocketGateway(prisma, jwt) {
        this.prisma = prisma;
        this.jwt = jwt;
    }
    SocketGateway.prototype.handleConnection = function (client) {
        return __awaiter(this, void 0, void 0, function () {
            var token, payload, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        token = client.handshake.auth.token;
                        if (!token)
                            return [2 /*return*/, client.disconnect()];
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.jwt.verifyAsync(token, {
                                secret: process.env.JWT_SECRET
                            })];
                    case 2:
                        payload = _b.sent();
                        client.data.userId = payload.sub || payload.id;
                        client.emit('connected', { status: 'success', userId: client.data.userId });
                        return [3 /*break*/, 4];
                    case 3:
                        _a = _b.sent();
                        client.emit('error', { message: 'Invalid authentication token' });
                        client.disconnect();
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    SocketGateway.prototype.handleDisconnect = function (client) {
        console.log("\uD83D\uDD34 Client disconnected: " + client.id);
    };
    SocketGateway.prototype.joinConversation = function (data, client) {
        return __awaiter(this, void 0, void 0, function () {
            var room;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        room = "room_" + data.conversationId;
                        return [4 /*yield*/, client.join(room)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, { status: 'joined', room: room }];
                }
            });
        });
    };
    SocketGateway.prototype.sendMessage = function (data, client) {
        return __awaiter(this, void 0, void 0, function () {
            var imageUrl, voiceUrl, folder, matches, ext, fileName, filePath, base64Data, folder, matches, ext, fileName, filePath, base64Data, message, room, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        imageUrl = null;
                        voiceUrl = null;
                        // حفظ الصورة لو موجودة
                        if (data.type === send_message_dto_1.MessageType.IMAGE && data.image) {
                            folder = '/uploads/chat-images';
                            if (!fs_1.existsSync(folder))
                                fs_1.mkdirSync(folder, { recursive: true });
                            matches = data.image.match(/^data:(image\/\w+);base64,/);
                            ext = matches ? '.' + matches[1].split('/')[1] : '.png';
                            fileName = Date.now() + "-" + Math.round(Math.random() * 1e9) + ext;
                            filePath = folder + "/" + fileName;
                            base64Data = data.image.replace(/^data:image\/\w+;base64,/, '');
                            fs_1.writeFileSync(filePath, Buffer.from(base64Data, 'base64'));
                            imageUrl = filePath;
                        }
                        // حفظ الصوت لو موجود
                        if (data.type === send_message_dto_1.MessageType.VOICE && data.voice) {
                            folder = '/uploads/chat-voices';
                            if (!fs_1.existsSync(folder))
                                fs_1.mkdirSync(folder, { recursive: true });
                            matches = data.voice.match(/^data:audio\/(\w+);base64,/);
                            ext = matches ? '.' + matches[1] : '.mp3';
                            fileName = Date.now() + "-" + Math.round(Math.random() * 1e9) + ext;
                            filePath = folder + "/" + fileName;
                            base64Data = data.voice.replace(/^data:audio\/\w+;base64,/, '');
                            fs_1.writeFileSync(filePath, Buffer.from(base64Data, 'base64'));
                            voiceUrl = filePath; // ممكن بعدين تعدل للـ URL للفرونت
                        }
                        return [4 /*yield*/, this.prisma.message.create({
                                data: {
                                    conversationId: data.conversationId,
                                    senderId: data.senderId,
                                    text: data.text || null,
                                    imageUrl: imageUrl,
                                    voice: voiceUrl,
                                    isRead: false,
                                    type: data.type
                                }
                            })];
                    case 1:
                        message = _a.sent();
                        room = "room_" + data.conversationId;
                        this.server.to(room).emit('newMessage', message);
                        return [2 /*return*/, { status: 'sent', message: message }];
                    case 2:
                        error_1 = _a.sent();
                        return [2 /*return*/, { status: 'error', message: error_1.message }];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    __decorate([
        websockets_1.WebSocketServer()
    ], SocketGateway.prototype, "server");
    __decorate([
        websockets_1.SubscribeMessage('joinConversation'),
        __param(0, websockets_1.MessageBody()),
        __param(1, websockets_1.ConnectedSocket())
    ], SocketGateway.prototype, "joinConversation");
    __decorate([
        websockets_1.SubscribeMessage('sendMessage'),
        __param(0, websockets_1.MessageBody()),
        __param(1, websockets_1.ConnectedSocket())
    ], SocketGateway.prototype, "sendMessage");
    SocketGateway = __decorate([
        websockets_1.WebSocketGateway({
            cors: {
                origin: '*',
                credentials: true
            },
            transports: ['websocket', 'polling']
        })
    ], SocketGateway);
    return SocketGateway;
}());
exports.SocketGateway = SocketGateway;
