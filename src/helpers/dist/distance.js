"use strict";
exports.__esModule = true;
exports.getDistance = void 0;
function getDistance(lat1, lon1, lat2, lon2) {
    var toRad = function (value) { return (value * Math.PI) / 180; };
    var R = 6371; // نصف قطر الأرض بالكيلومتر
    var dLat = toRad(lat2 - lat1);
    var dLon = toRad(lon2 - lon1);
    var a = Math.pow(Math.sin(dLat / 2), 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.pow(Math.sin(dLon / 2), 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // المسافة بالكيلومتر
}
exports.getDistance = getDistance;
