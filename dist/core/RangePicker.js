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
exports.RangePicker = void 0;
var dateUtils_1 = require("../utils/dateUtils");
var BasePicker_1 = require("./BasePicker");
var types_1 = require("./types");
var RangePicker = /** @class */ (function (_super) {
    __extends(RangePicker, _super);
    function RangePicker(props) {
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
                var pickerState = _this._state;
                if (_this._selectedDate && _this._selectedEndDate) {
                    _this._selectedEndDate = undefined;
                    _this._hoveredDate = undefined;
                }
                if (pickerState === 'rendered' || (0, dateUtils_1.createDate)(_this._selectedDate).getTime() > (0, dateUtils_1.createDate)(date).getTime()) {
                    _this._selectedDate = date;
                    _this._state = 'selecting';
                }
                else if (pickerState === 'selecting') {
                    _this._selectedEndDate = date;
                    _this._state = 'rendered';
                }
                var updateDate = date;
                if (_this._normalized) {
                    var renderedDate = _this._calculateRenderedDate(date, _this._normalized, _this._twoSide, _this._dateFormatter);
                    updateDate = renderedDate;
                }
                _this._renderedDate = updateDate;
                _this._days = _this._calculateDays(updateDate);
                _this._events.emit(types_1.PickerEvents.changeDate, (0, dateUtils_1.createDate)(updateDate));
                if (!isCurrent && _this._dayRenderType === 'fill') {
                    if (_this._selectedDate && !_this._selectedEndDate) {
                        _this._selectedEndDate = date;
                    }
                    _this._updateChangeDay(date);
                }
            }
        };
        _this.isSelectedDay = function (date) { return _this._selectedDate === date || _this._selectedEndDate === date; };
        _this.getSelectedEndDate = function () { return _this._selectedEndDate && _this._dateFormatter(_this._selectedEndDate); };
        _this.getSelectedEndDateUnformatted = function () { return _this._selectedEndDate; };
        _this._updateChangeDay = function (date) {
            _this._isLoading = false;
            if (!_this._selectedDate) {
                _this._selectedDate = date;
                _this._state = 'selecting';
            }
            else if (_this._selectedDate) {
                _this._selectedEndDate = date;
                _this._state = 'rendered';
            }
            _this._triggerUpdate(types_1.PickerEvents.calculateDays);
        };
        _this.getEndDate = function () {
            if (!_this._selectedEndDate)
                return '';
            var selectedDate = _this._dateFormatter(_this._selectedEndDate);
            return "".concat((0, dateUtils_1.getFullYear)(selectedDate), "-").concat((0, dateUtils_1.addZero)((0, dateUtils_1.getMonth)(selectedDate)), "-").concat((0, dateUtils_1.addZero)((0, dateUtils_1.getDate)(selectedDate)));
        };
        _this.goToToday = function () {
            _this._open = true;
            _this._forceLoadingStart();
            var newDate = (0, dateUtils_1.formatDate)((0, dateUtils_1.createDate)());
            _this._renderedDate = newDate;
            _this._selectedDate = newDate;
            _this._selectedEndDate = '';
            _this._hoveredDate = '';
            _this._forceLoadingEnd();
            _this._triggerUpdate(types_1.PickerEvents.calculateDays);
            _this._triggerUpdate(types_1.PickerEvents.changeDate);
        };
        _this.onCellHover = function (date) {
            if (_this._state === 'selecting') {
                _this._hoveredDate = date;
                if (_this._selectedDate) {
                    if (_this._selectedEndDate) {
                        _this._hoveredDate = undefined;
                        _this._state = 'rendered';
                    }
                    _this._triggerUpdate(types_1.PickerEvents.changeDate);
                }
            }
        };
        _this.isDateInRange = function (date, includeStart, includeEnd) {
            if (includeStart === void 0) { includeStart = false; }
            if (includeEnd === void 0) { includeEnd = true; }
            var startDate = (0, dateUtils_1.createDate)(_this._selectedDate).getTime();
            var endDate = (0, dateUtils_1.createDate)(_this._hoveredDate || _this._selectedEndDate || _this._selectedDate).getTime();
            var dateTime = (0, dateUtils_1.createDate)(date).getTime();
            var startCondition = includeStart ? dateTime >= startDate : dateTime > startDate;
            var endCondition = includeEnd ? dateTime <= endDate : dateTime < endDate;
            if (_this._state === 'selecting' || _this._state === 'rendered')
                return startCondition && endCondition;
            return false;
        };
        _this.isSelecting = function () { return _this._state === 'selecting'; };
        _this.isStartDate = function (date) { return _this._selectedDate === date; };
        _this.isEndDate = function (date) { return _this._hoveredDate === date; };
        _this.setRenderedDate = function (date) {
            (0, dateUtils_1.validateDate)(date);
            _this._renderedDate = _this._calculateRenderedDate(date, _this._normalized, _this._twoSide, _this._dateFormatter, true);
            _this._forceUpdate();
        };
        _this.setEndDate = function (date) {
            (0, dateUtils_1.validateDate)(date);
            _this._selectedEndDate = date;
            _this._forceUpdate();
        };
        _this._selectedEndDate = props.endDate ? (0, dateUtils_1.formatDate)((0, dateUtils_1.createDate)(props.endDate)) : '';
        return _this;
    }
    return RangePicker;
}(BasePicker_1.BasePicker));
exports.RangePicker = RangePicker;
//# sourceMappingURL=RangePicker.js.map