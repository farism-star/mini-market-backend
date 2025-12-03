"use strict";
exports.__esModule = true;
exports.formatTimeToAMPM = void 0;
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
