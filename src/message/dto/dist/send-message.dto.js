"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
exports.SendMessageDto = exports.MessageType = void 0;
var class_validator_1 = require("class-validator");
var MessageType;
(function (MessageType) {
    MessageType["TEXT"] = "TEXT";
    MessageType["IMAGE"] = "IMAGE";
    MessageType["VOICE"] = "VOICE";
})(MessageType = exports.MessageType || (exports.MessageType = {}));
var SendMessageDto = /** @class */ (function () {
    function SendMessageDto() {
    }
    __decorate([
        class_validator_1.IsString()
    ], SendMessageDto.prototype, "conversationId");
    __decorate([
        class_validator_1.IsString()
    ], SendMessageDto.prototype, "senderId");
    __decorate([
        class_validator_1.IsEnum(MessageType)
    ], SendMessageDto.prototype, "type");
    __decorate([
        class_validator_1.IsOptional(),
        class_validator_1.IsString()
    ], SendMessageDto.prototype, "text");
    __decorate([
        class_validator_1.IsOptional(),
        class_validator_1.IsString()
    ], SendMessageDto.prototype, "image");
    __decorate([
        class_validator_1.IsOptional(),
        class_validator_1.IsString()
    ], SendMessageDto.prototype, "voice");
    __decorate([
        class_validator_1.IsOptional(),
        class_validator_1.IsBoolean()
    ], SendMessageDto.prototype, "isRead");
    return SendMessageDto;
}());
exports.SendMessageDto = SendMessageDto;
