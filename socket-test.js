"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var socket_io_client_1 = require("socket.io-client");
// الاتصال بسيرفر Nest Socket
var socket = (0, socket_io_client_1.io)("http://localhost:3000", {
    transports: ["websocket"], // تأكد يستخدم websocket مباشرة
});
// لما الاتصال ينجح
socket.on("connect", function () {
    console.log("🔥 Connected to Socket Server:", socket.id);
    // ابعت event hello للسيرفر
    socket.emit("hello", "Test message from TS client");
});
// لو السيرفر رد بـ welcome
socket.on("welcome", function (msg) {
    console.log("📩 Server says:", msg);
});
// لو حصل error
socket.on("connect_error", function (err) {
    console.log("❌ Connection Error:", err.message);
});
// لو اتفصل الاتصال
socket.on("disconnect", function () {
    console.log("❌ Disconnected from server");
});
