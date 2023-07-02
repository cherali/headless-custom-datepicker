"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDate = exports.addZero = exports.getDate = exports.getMonth = exports.getFullYear = exports.formatDate = exports.isValidDateFormat = exports.validateDate = void 0;
var datePattern = /^\d{4}-[01]\d-[0-3]\d$/;
var validateDate = function (date) {
    if (!date.match(datePattern) && date) {
        throw new Error('Invalid Date Format, only YYYY-MM-DD date format is allowed.');
    }
};
exports.validateDate = validateDate;
var isValidDateFormat = function (date) { return Boolean(typeof date === 'string' && date.match(datePattern) && !isNaN(new Date(date).getTime())); };
exports.isValidDateFormat = isValidDateFormat;
var formatDate = function (date) {
    if (!date)
        return '';
    var isoDate = date.toISOString();
    return isoDate.slice(0, isoDate.indexOf('T'));
};
exports.formatDate = formatDate;
var getFullYear = function (date) {
    (0, exports.validateDate)(date);
    return Number(date.slice(0, 4));
};
exports.getFullYear = getFullYear;
var getMonth = function (date) {
    (0, exports.validateDate)(date);
    return Number(date.slice(date.indexOf('-') + 1, date.lastIndexOf('-')));
};
exports.getMonth = getMonth;
var getDate = function (date) {
    (0, exports.validateDate)(date);
    return Number(date.slice(date.lastIndexOf('-') + 1));
};
exports.getDate = getDate;
var addZero = function (number) { return number < 10 ? ("0".concat(number)) : number.toString(); };
exports.addZero = addZero;
// create date base on timezone
var createDate = function (date) {
    date && (0, exports.validateDate)(date);
    var newDate = new Date(date || new Date());
    return new Date(new Date(newDate.getTime() - newDate.getTimezoneOffset() * 60000).toISOString());
};
exports.createDate = createDate;
//# sourceMappingURL=dateUtils.js.map