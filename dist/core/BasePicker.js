"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BasePicker = void 0;
var dateUtils_1 = require("../utils/dateUtils");
var EventEmitter_1 = __importDefault(require("./EventEmitter"));
var types_1 = require("./types");
var BasePicker = /** @class */ (function () {
    function BasePicker(props) {
        var _this = this;
        var _a, _b, _c, _d;
        this._state = 'loading';
        this._events = new EventEmitter_1.default();
        this._monthOffsetIndex = [0, 0];
        this._open = false;
        this._mode = 'day';
        this._isLoading = false;
        this.onChangeDate = function (cb) { return _this._events.subscribe(types_1.PickerEvents.changeDate, cb); };
        this._triggerUpdate = function (eventName) {
            if (_this._selectedDate) {
                var sDate = (0, dateUtils_1.createDate)(_this._selectedDate);
                sDate.setMilliseconds((0, dateUtils_1.createDate)().getMilliseconds());
                _this._events.emit(eventName, sDate);
            }
            else
                _this._events.emit(eventName, (0, dateUtils_1.createDate)());
        };
        this._calculateDaysListener = function () { return _this._days = _this._calculateDays(); };
        this._changeOpenListener = function () { return _this._triggerUpdate(types_1.PickerEvents.changeDate); };
        this._changeViewListener = function () { return _this._triggerUpdate(types_1.PickerEvents.changeDate); };
        this._changeStateListener = function (state) {
            _this._state = state;
            _this._isLoading = state === 'loading';
            _this._days = _this._calculateDays();
            _this._triggerUpdate(types_1.PickerEvents.changeDate);
        };
        this._forceLoadingStart = function () { return _this._delayTimeout > 0 && _this._events.emit(types_1.PickerEvents.changeState, 'loading'); };
        this._forceLoadingEnd = function () { return _this._delayTimeout > 0 && setTimeout(function () {
            _this._events.emit(types_1.PickerEvents.changeState, 'rendered');
        }, _this._delayTimeout); };
        this._getPastMonth = function (month) {
            var m = month;
            if (month === 1)
                m = 12;
            else
                m -= 1;
            return m;
        };
        this._get2PastMonth = function (month) { return _this._getPastMonth(_this._getPastMonth(month)); };
        this._calculateRenderedDate = function (date, isNormalized, twoSide, foramtter, forceUseDate) {
            var _a, _b, _c, _d;
            if (forceUseDate === void 0) { forceUseDate = false; }
            if (!isNormalized || !twoSide)
                return date;
            var newDate = (0, dateUtils_1.createDate)(forceUseDate ? date : _this._renderedDate || date);
            var isPastRenderedMonth = ((_b = (_a = _this._days) === null || _a === void 0 ? void 0 : _a.find(function (f) { return f.date === date; })) === null || _b === void 0 ? void 0 : _b.state) === 'prev';
            var isNextRenderedMonth = _this._renderedDate ? ((_d = (_c = _this.getDaysArray('next')) === null || _c === void 0 ? void 0 : _c.find(function (f) { return f.date === date; })) === null || _d === void 0 ? void 0 : _d.state) === 'next' : false;
            var month = (0, dateUtils_1.getMonth)(foramtter((0, dateUtils_1.formatDate)(newDate)));
            var days = _this._getLocale((0, dateUtils_1.getFullYear)(foramtter((0, dateUtils_1.formatDate)(newDate)))).months[_this._getPastMonth(month)].numberOfDays;
            if (isNextRenderedMonth)
                return date;
            else if (isPastRenderedMonth) {
                var pastDays = _this._getLocale((0, dateUtils_1.getFullYear)(foramtter((0, dateUtils_1.formatDate)(newDate)))).months[_this._get2PastMonth(month)].numberOfDays;
                newDate.setDate(newDate.getDate() - 1 - days - pastDays);
            }
            else if (month % 2 === 0)
                newDate.setDate(newDate.getDate() - 1 - days);
            return (0, dateUtils_1.formatDate)(newDate);
        };
        this._getSelectedDate = function () { return _this._dateFormatter(_this._selectedDate); };
        this._getRenderedDate = function () { return _this._dateFormatter(_this._renderedDate); };
        this._calculateMonthOfDate = function (date) { return ((0, dateUtils_1.getMonth)(date)); };
        this._nextMonthDate = function () {
            var newDate = (0, dateUtils_1.createDate)(_this._renderedDate);
            newDate.setMonth(newDate.getMonth() + 1);
            return _this._dateFormatter((0, dateUtils_1.formatDate)(newDate));
        };
        this._calculateDays = function (date, monthIndex) {
            if (monthIndex === void 0) { monthIndex = 0; }
            var cDate = date || _this._renderedDate;
            var day = (0, dateUtils_1.getDate)(_this._dateFormatter(cDate));
            var dDay = (0, dateUtils_1.getDate)(cDate);
            var difDay = (dDay - day);
            var nDate = (0, dateUtils_1.createDate)(cDate);
            nDate.setDate(difDay + 1);
            var prevDate = (0, dateUtils_1.createDate)((0, dateUtils_1.formatDate)(nDate));
            var numberOfZeros = nDate.getDay();
            var fullYear = (0, dateUtils_1.getFullYear)(_this._dateFormatter(cDate));
            var month = _this._calculateMonthOfDate(_this._dateFormatter(cDate));
            var arraySize = _this._getLocale(fullYear).months[month].numberOfDays;
            var daysArray = Array(arraySize).fill('').map(function (_, index) {
                var date = "".concat(nDate.getFullYear(), "-").concat((0, dateUtils_1.addZero)(nDate.getMonth() + 1), "-").concat((0, dateUtils_1.addZero)(nDate.getDate()));
                nDate.setDate(nDate.getDate() + 1);
                return ({ day: index + 1, state: 'current', date: date });
            });
            if (_this._dayRenderType === 'space') {
                _this._monthOffsetIndex[monthIndex] = numberOfZeros;
            }
            else if (_this._dayRenderType === 'fill') {
                _this._monthOffsetIndex[0] = -_this._weekOffset;
                _this._monthOffsetIndex[1] = -_this._weekOffset;
                var startLength_1 = ((numberOfZeros + _this._weekOffset) % 7 + _this._calculateAutoRowStartLength(daysArray.length));
                var pDate = (0, dateUtils_1.createDate)((0, dateUtils_1.formatDate)(prevDate));
                pDate.setMonth(pDate.getMonth() - 1);
                var formatedPDate = _this._dateFormatter((0, dateUtils_1.formatDate)(pDate));
                var prevMonthDayNumber_1 = _this._getLocale((0, dateUtils_1.getFullYear)(formatedPDate)).months[(0, dateUtils_1.getMonth)(formatedPDate)].numberOfDays;
                prevDate.setDate(prevDate.getDate() - startLength_1);
                var start = Array(startLength_1).fill('').map(function (_, index) {
                    var date = "".concat(prevDate.getFullYear(), "-").concat((0, dateUtils_1.addZero)(prevDate.getMonth() + 1), "-").concat((0, dateUtils_1.addZero)(prevDate.getDate()));
                    prevDate.setDate(prevDate.getDate() + 1);
                    return ({ day: (prevMonthDayNumber_1 - startLength_1 + index + 1), state: 'prev', date: date });
                });
                daysArray.unshift.apply(daysArray, start);
                var endLength = _this._calculateAutoRowEndLength(daysArray.length);
                var end = Array(endLength).fill('')
                    .map(function (_, index) {
                    var date = "".concat(nDate.getFullYear(), "-").concat((0, dateUtils_1.addZero)(nDate.getMonth() + 1), "-").concat((0, dateUtils_1.addZero)(nDate.getDate()));
                    nDate.setDate(nDate.getDate() + 1);
                    return ({ day: index + 1, state: 'next', date: date });
                });
                daysArray.push.apply(daysArray, end);
            }
            else
                throw new Error('can\'t calculate days.');
            return daysArray;
        };
        this._calculateAutoRowEndLength = function (length) {
            var rows = Math.ceil(length / 7);
            var rowsMargin = _this._datePickerAutoRow && rows < _this._datePickerMaxRow ? _this._datePickerMaxRow - rows : 0;
            rows += rowsMargin;
            return _this._datePickerAutoRow ? rows * 7 - length : (rows + Math.ceil((_this._datePickerMaxRow - rows) / 2)) * 7 - length;
        };
        this._calculateAutoRowStartLength = function (length) {
            return !_this._datePickerAutoRow ? 0 : Math.floor((_this._datePickerMaxRow - Math.ceil(length / 7)) / 2) * 7;
        };
        this._getLocale = function (year) { return _this._locale(year); };
        this._forceUpdate = function (date) {
            _this._days = _this._calculateDays(date);
            _this._triggerUpdate(types_1.PickerEvents.changeDate);
        };
        this._getYear = function () { return (0, dateUtils_1.getFullYear)(_this._getSelectedDate()); };
        this._updateDate = function (date) {
            _this._renderedDate = date;
            _this._forceUpdate();
        };
        this.getDaysArray = function (monthSate) {
            if (monthSate === void 0) { monthSate = 'current'; }
            if (monthSate === 'current')
                return _this._days;
            else if (monthSate === 'next' && !_this._twoSide)
                throw new Error('TwoSide flag most be true to get next month days.');
            var nextMonthDate = (0, dateUtils_1.createDate)(_this._renderedDate);
            nextMonthDate.setMonth(nextMonthDate.getMonth() + 1);
            return _this._calculateDays((0, dateUtils_1.formatDate)(nextMonthDate), 1);
        };
        this.getMonthList = function () { return Object.entries(_this._getLocale(_this._getYear()).months).map(function (_a) {
            var key = _a[0], value = _a[1];
            return (__assign({ monthNumber: Number(key) }, value));
        }); };
        this.getYearsList = function (minimumYear, maximumYear) {
            if (maximumYear <= minimumYear)
                throw new Error('maximnum year most be greater than minimum year');
            return Array(maximumYear - minimumYear + 1).fill('').map(function (_, index) { return minimumYear + index; });
        };
        this.getDate = function () {
            if (!_this._selectedDate)
                return '';
            var selectedDate = _this._getSelectedDate();
            return "".concat((0, dateUtils_1.getFullYear)(selectedDate), "-").concat((0, dateUtils_1.addZero)((0, dateUtils_1.getMonth)(selectedDate)), "-").concat((0, dateUtils_1.addZero)((0, dateUtils_1.getDate)(selectedDate)));
        };
        this.getSelectedDateUnformatted = function () { return _this._selectedDate; };
        this.getRenderedDateUnformatted = function () { return _this._renderedDate; };
        this.getRenderedMonth = function () { return (0, dateUtils_1.getMonth)(_this._getRenderedDate()); };
        this.getRenderedMonthName = function () { return _this._getLocale(_this._getYear()).months[_this._calculateMonthOfDate(_this._getRenderedDate())].name; };
        this.getRenderedYear = function () { return (0, dateUtils_1.getFullYear)(_this._getRenderedDate()); };
        this.getRenderedNextMonth = function () { return (0, dateUtils_1.getMonth)(_this._nextMonthDate()); };
        this.getRenderedNextMonthName = function () { return _this._getLocale((0, dateUtils_1.getFullYear)(_this._nextMonthDate())).months[_this._calculateMonthOfDate(_this._nextMonthDate())].name; };
        this.getRenderedNextDateYear = function () { return (0, dateUtils_1.getFullYear)(_this._nextMonthDate()); };
        this.getDayMonthOffset = function (index) {
            if (index === void 0) { index = 0; }
            return (_this._monthOffsetIndex[index] + _this._weekOffset) % 7;
        };
        this.changeMonth = function (month, forceClosing) {
            if (forceClosing === void 0) { forceClosing = true; }
            var formatedDate = _this._dateFormatter((0, dateUtils_1.formatDate)((0, dateUtils_1.createDate)(_this._renderedDate)));
            var difMonth = month - (0, dateUtils_1.getMonth)(formatedDate);
            var newDate = (0, dateUtils_1.createDate)(_this._renderedDate);
            newDate.setMonth(newDate.getMonth() + difMonth);
            _this._renderedDate = _this._calculateRenderedDate((0, dateUtils_1.formatDate)(newDate), _this._normalized, _this._twoSide, _this._dateFormatter, true);
            if (forceClosing)
                _this._mode = 'day';
            _this._forceUpdate();
        };
        this.changeYear = function (year, forceClosing) {
            if (forceClosing === void 0) { forceClosing = true; }
            var difYear = (0, dateUtils_1.getFullYear)(_this._dateFormatter(_this._renderedDate)) - year;
            var newDate = (0, dateUtils_1.createDate)(_this._renderedDate);
            newDate.setFullYear((0, dateUtils_1.getFullYear)(_this._renderedDate) - difYear);
            _this._renderedDate = (0, dateUtils_1.formatDate)(newDate);
            if (forceClosing)
                _this._mode = 'day';
            _this._forceUpdate();
        };
        this.handleShowNextMonth = function () {
            var newDate = (0, dateUtils_1.createDate)(_this._renderedDate);
            newDate.setMonth(newDate.getMonth() + _this._monthStep);
            _this._updateDate((0, dateUtils_1.formatDate)(newDate));
        };
        this.handleShowPrevMonth = function () {
            var newDate = (0, dateUtils_1.createDate)(_this._renderedDate);
            newDate.setMonth(newDate.getMonth() - _this._monthStep);
            _this._updateDate((0, dateUtils_1.formatDate)(newDate));
        };
        this.handleShowNextYear = function () {
            var newDate = (0, dateUtils_1.createDate)(_this._renderedDate);
            newDate.setFullYear(newDate.getFullYear() + 1);
            _this._updateDate((0, dateUtils_1.formatDate)(newDate));
        };
        this.handleShowPrevYear = function () {
            var newDate = (0, dateUtils_1.createDate)(_this._renderedDate);
            newDate.setFullYear(newDate.getFullYear() - 1);
            _this._updateDate((0, dateUtils_1.formatDate)(newDate));
        };
        this.goToToday = function () {
            _this._open = true;
            _this._forceLoadingStart();
            var newDate = (0, dateUtils_1.formatDate)((0, dateUtils_1.createDate)());
            _this._renderedDate = newDate;
            _this._selectedDate = newDate;
            _this._forceLoadingEnd();
            _this._triggerUpdate(types_1.PickerEvents.calculateDays);
            _this._triggerUpdate(types_1.PickerEvents.changeDate);
        };
        this.setOpen = function (open) {
            if (_this._open !== open) {
                _this._open = open;
                _this._events.emit(types_1.PickerEvents.changeOpen);
            }
        };
        this.setMode = function (mode) {
            if (mode !== _this._mode) {
                _this._mode = mode;
                _this._events.emit(types_1.PickerEvents.changeMode);
            }
        };
        this.setDate = function (date) {
            (0, dateUtils_1.validateDate)(date);
            _this._selectedDate = date;
            _this._forceUpdate();
        };
        this.getMode = function () { return _this._mode; };
        this.isOpen = function () { return _this._open; };
        this.isLoadingState = function () { return _this._isLoading; };
        var selectedDate = (0, dateUtils_1.formatDate)((0, dateUtils_1.createDate)(props.date));
        var twoSide = (_a = props.twoSide) !== null && _a !== void 0 ? _a : false;
        var normalized = twoSide ? true : false;
        var dateFormatter = (_b = props === null || props === void 0 ? void 0 : props.dateFormatter) !== null && _b !== void 0 ? _b : (function (date) { return date; });
        this._locale = props.locale;
        this._dateFormatter = dateFormatter;
        this._weekOffset = props.weekOffset || 0;
        this._dayRenderType = props.dayRenderType || 'space';
        this._datePickerMaxRow = props.datePickerMaxRow || 6;
        this._datePickerAutoRow = (_c = props.datePickerAutoRow) !== null && _c !== void 0 ? _c : false;
        this._delayTimeout = (_d = props.delayTimeout) !== null && _d !== void 0 ? _d : 150;
        this._twoSide = twoSide;
        this._normalized = normalized;
        this._monthStep = twoSide ? normalized ? 2 : 1 : 1;
        this._selectedDate = props.date ? selectedDate : '';
        this._renderedDate = this._calculateRenderedDate(selectedDate, normalized, twoSide, dateFormatter);
        this._days = this._calculateDays();
        this._events.subscribe(types_1.PickerEvents.calculateDays, this._calculateDaysListener);
        this._events.subscribe(types_1.PickerEvents.changeOpen, this._changeOpenListener);
        this._events.subscribe(types_1.PickerEvents.changeMode, this._changeViewListener);
        this._events.subscribe(types_1.PickerEvents.changeState, this._changeStateListener);
        this._state = 'rendered';
    }
    Object.defineProperty(BasePicker.prototype, "mode", {
        // getters
        get: function () {
            return this._mode;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(BasePicker.prototype, "isLoading", {
        get: function () {
            return this._isLoading;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(BasePicker.prototype, "open", {
        get: function () {
            return this._open;
        },
        enumerable: false,
        configurable: true
    });
    return BasePicker;
}());
exports.BasePicker = BasePicker;
//# sourceMappingURL=BasePicker.js.map