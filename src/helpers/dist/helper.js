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
    return "\uD83D\uDCE6 *Order ID:* " + order.orderId + "*\n";
}
exports.buildOrderBanarMessage = buildOrderBanarMessage;
