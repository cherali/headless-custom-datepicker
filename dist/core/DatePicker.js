"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatePicker = void 0;
var dateUtils_1 = require("../utils/dateUtils");
var BasePicker_1 = require("./BasePicker");
var types_1 = require("./types");
var DatePicker = /** @class */ (function (_super) {
    __extends(DatePicker, _super);
    function DatePicker(props) {
        var _this = _super.call(this, props) || this;
        _this.changeDay = function (date, state) {
            if ((0, dateUtils_1.isValidDateFormat)(date)) {
                var isCurrent = state === 'current';
                if (_this._twoSide && _this._dayRenderType === 'fill' && _this._normalized) {
                    var current = _this._days.find(function (f) { return f.date === date; });
                    var next = _this.getDaysArray('next').find(function (f) { return f.date === date; });
                    isCurrent = Boolean((current === null || current === void 0 ? void 0 : current.state) === 'current' || (current === null || current === void 0 ? void 0 : current.state) === 'next') || Boolean((next === null || next === void 0 ? void 0 : next.state) === 'current' || (next === null || next === void 0 ? void 0 : next.state) === 'prev');
                }
                if (_this._dayRenderType === 'fill' && !isCurrent) {
                    _this._forceLoadingStart();
                }
                _this._selectedDate = date;
                var updateDate = date;
                if (_this._normalized) {
                    var renderedDate = _this._calculateRenderedDate(date, _this._normalized, _this._twoSide, _this._dateFormatter);
                    updateDate = renderedDate;
                }
                _this._renderedDate = updateDate;
                _this._days = _this._calculateDays(updateDate);
                _this._events.emit(types_1.PickerEvents.changeDate, (0, dateUtils_1.createDate)(updateDate));
                if (!isCurrent && _this._dayRenderType === 'fill') {
                    _this._updateChangeDay(date);
                }
            }
        };
        _this.isSelectedDay = function (date) { return _this._selectedDate === date; };
        _this._updateChangeDay = function (date) {
            _this._isLoading = false;
            _this._selectedDate = date;
            _this._triggerUpdate(types_1.PickerEvents.calculateDays);
        };
        return _this;
    }
    return DatePicker;
}(BasePicker_1.BasePicker));
exports.DatePicker = DatePicker;
//# sourceMappingURL=DatePicker.js.map