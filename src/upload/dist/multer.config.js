"use strict";
exports.__esModule = true;
exports.multerVoiceChatOptions = exports.multerImageChatOptions = exports.multerConfig = void 0;
var multer_1 = require("multer");
var path_1 = require("path");
var fs_1 = require("fs");
exports.multerConfig = {
    storage: multer_1.diskStorage({
        destination: './uploads',
        filename: function (req, file, cb) {
            var uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
            var ext = path_1.extname(file.originalname);
            cb(null, uniqueSuffix + ext);
        }
    })
};
exports.multerImageChatOptions = {
    storage: multer_1.diskStorage({
        destination: function (req, file, cb) {
            var uploadPath = './uploads/chat-images';
            if (!fs_1.existsSync(uploadPath))
                fs_1.mkdirSync(uploadPath, { recursive: true });
            cb(null, uploadPath);
        },
        filename: function (req, file, cb) {
            var unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
            cb(null, "" + unique + path_1.extname(file.originalname));
        }
    })
};
exports.multerVoiceChatOptions = {
    storage: multer_1.diskStorage({
        destination: function (req, file, cb) {
            var uploadPath = './uploads/chat-voices';
            if (!fs_1.existsSync(uploadPath))
                fs_1.mkdirSync(uploadPath, { recursive: true });
            cb(null, uploadPath);
        },
        filename: function (req, file, cb) {
            var unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
            cb(null, "" + unique + path_1.extname(file.originalname));
        }
    })
};
