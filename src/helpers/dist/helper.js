"use strict";
exports.__esModule = true;
exports.buildOrderBanarMessage = exports.formatDateToReadable = exports.formatTimeToAMPM = void 0;
function formatTimeToAMPM(time) {
    var date = new Date(time);
    return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: 'numeric',
        hour12: true,
        timeZone: 'Asia/Riyadh'
    });
}
exports.formatTimeToAMPM = formatTimeToAMPM;
function formatDateToReadable(dateInput) {
    var date = new Date(dateInput);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        timeZone: 'Asia/Riyadh'
    });
}
exports.formatDateToReadable = formatDateToReadable;
function buildOrderBanarMessage(order) {
    var _a, _b, _c, _d, _e;
    return "\uD83D\uDCE6 *New Order Created!*\n\n\uD83C\uDD94 *Order ID:* " + order.orderId + "\n\uD83C\uDFEA *Market:* " + ((_b = (_a = order.market) === null || _a === void 0 ? void 0 : _a.name) !== null && _b !== void 0 ? _b : "Unknown") + "\n\uD83D\uDC64 *Client:* " + ((_d = (_c = order.client) === null || _c === void 0 ? void 0 : _c.name) !== null && _d !== void 0 ? _d : "Unknown") + "\n\n\uD83D\uDCCD *Delivery Address:* " + ((_e = order.deliveryAddress) !== null && _e !== void 0 ? _e : "Not provided") + "\n\uD83D\uDD52 *Time:* " + (order.time ? formatTimeToAMPM(order.time) : "N/A") + "\n\uD83D\uDCC5 *Date:* " + (order.date ? formatDateToReadable(order.date) : "N/A") + "\n\n\u26A1 *Status:* " + order.status + "\n";
}
exports.buildOrderBanarMessage = buildOrderBanarMessage;
