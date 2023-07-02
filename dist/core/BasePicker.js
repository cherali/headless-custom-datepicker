import { formatDate, getDate, getFullYear, getMonth, addZero, validateDate, createDate } from '../utils/dateUtils';
import EventEmitter from './EventEmitter';
import { PickerEvents } from './types';
class BasePicker {
    constructor(props) {
        this._state = 'loading';
        this._events = new EventEmitter();
        this._monthOfsetIndex = [0, 0];
        this._open = false;
        this._mode = 'day';
        this._isLoading = false;
        this.onChageDate = (cb) => this._events.subscribe(PickerEvents.changeDate, cb);
        this._tiggerUpdate = (eventName) => {
            if (this._selectedDate) {
                const sDate = createDate(this._selectedDate);
                sDate.setMilliseconds(createDate().getMilliseconds());
                this._events.emit(eventName, sDate);
            }
            else
                this._events.emit(eventName, createDate());
        };
        this._calculateDaysListener = () => this._days = this._calculateDays();
        this._changeOpenListener = () => this._tiggerUpdate(PickerEvents.changeDate);
        this._changeViewListener = () => this._tiggerUpdate(PickerEvents.changeDate);
        this._changeStateListener = (state) => {
            this._state = state;
            this._isLoading = state === 'loading';
            this._days = this._calculateDays();
            this._tiggerUpdate(PickerEvents.changeDate);
        };
        this._forceLoadingStart = () => this._delayTimeout > 0 && this._events.emit(PickerEvents.changeState, 'loading');
        this._forceLoadingEnd = () => this._delayTimeout > 0 && setTimeout(() => {
            this._events.emit(PickerEvents.changeState, 'rendered');
        }, this._delayTimeout);
        this._getPastMonth = (month) => {
            let m = month;
            if (month === 1)
                m = 12;
            else
                m -= 1;
            return m;
        };
        this._get2PastMonth = (month) => this._getPastMonth(this._getPastMonth(month));
        this._calculateRenderedDate = (date, isNormalized, twoSide, foramtter, forceUseDate = false) => {
            if (!isNormalized || !twoSide)
                return date;
            const newDate = createDate(forceUseDate ? date : this._renderedDate || date);
            const isPastRenderedMonth = this._days?.find(f => f.date === date)?.state === 'prev';
            const isNextRenderedMonth = this._renderedDate ? this.getDaysArray('next')?.find(f => f.date === date)?.state === 'next' : false;
            const month = getMonth(foramtter(formatDate(newDate)));
            const days = this._getLocale(getFullYear(foramtter(formatDate(newDate)))).months[this._getPastMonth(month)].numberOfDays;
            if (isNextRenderedMonth)
                return date;
            else if (isPastRenderedMonth) {
                const pastDays = this._getLocale(getFullYear(foramtter(formatDate(newDate)))).months[this._get2PastMonth(month)].numberOfDays;
                newDate.setDate(newDate.getDate() - 1 - days - pastDays);
            }
            else if (month % 2 === 0)
                newDate.setDate(newDate.getDate() - 1 - days);
            return formatDate(newDate);
        };
        this._getSelectedDate = () => this._dateFormatter(this._selectedDate);
        this._getRenderedDate = () => this._dateFormatter(this._renderedDate);
        this._calculateMonthOfDate = (date) => (getMonth(date));
        this._nextMonthDate = () => {
            const newDate = createDate(this._renderedDate);
            newDate.setMonth(newDate.getMonth() + 1);
            return this._dateFormatter(formatDate(newDate));
        };
        this._calculateDays = (date, monthIndex = 0) => {
            const cDate = date || this._renderedDate;
            const day = getDate(this._dateFormatter(cDate));
            const dDay = getDate(cDate);
            const difDay = (dDay - day);
            const nDate = createDate(cDate);
            nDate.setDate(difDay + 1);
            const prevDate = createDate(formatDate(nDate));
            const numberOfZeros = nDate.getDay();
            const fullYear = getFullYear(this._dateFormatter(cDate));
            const month = this._calculateMonthOfDate(this._dateFormatter(cDate));
            const arraySize = this._getLocale(fullYear).months[month].numberOfDays;
            const daysArray = Array(arraySize).fill('').map((_, index) => {
                const date = `${nDate.getFullYear()}-${addZero(nDate.getMonth() + 1)}-${addZero(nDate.getDate())}`;
                nDate.setDate(nDate.getDate() + 1);
                return ({ day: index + 1, state: 'current', date });
            });
            if (this._dayRenderType === 'space') {
                this._monthOfsetIndex[monthIndex] = numberOfZeros;
            }
            else if (this._dayRenderType === 'fill') {
                this._monthOfsetIndex[0] = -this._weekOffset;
                this._monthOfsetIndex[1] = -this._weekOffset;
                const startLength = ((numberOfZeros + this._weekOffset) % 7 + this._calculateAutoRowStartLength(daysArray.length));
                const pDate = createDate(formatDate(prevDate));
                pDate.setMonth(pDate.getMonth() - 1);
                const formatedPDate = this._dateFormatter(formatDate(pDate));
                const prevMonthDayNumber = this._getLocale(getFullYear(formatedPDate)).months[getMonth(formatedPDate)].numberOfDays;
                prevDate.setDate(prevDate.getDate() - startLength);
                const start = Array(startLength).fill('').map((_, index) => {
                    const date = `${prevDate.getFullYear()}-${addZero(prevDate.getMonth() + 1)}-${addZero(prevDate.getDate())}`;
                    prevDate.setDate(prevDate.getDate() + 1);
                    return ({ day: (prevMonthDayNumber - startLength + index + 1), state: 'prev', date });
                });
                daysArray.unshift(...start);
                const endLength = this._calculateAutoRowEndLength(daysArray.length);
                const end = Array(endLength).fill('')
                    .map((_, index) => {
                    const date = `${nDate.getFullYear()}-${addZero(nDate.getMonth() + 1)}-${addZero(nDate.getDate())}`;
                    nDate.setDate(nDate.getDate() + 1);
                    return ({ day: index + 1, state: 'next', date });
                });
                daysArray.push(...end);
            }
            else
                throw new Error('can\'t calculate days.');
            return daysArray;
        };
        this._calculateAutoRowEndLength = (length) => {
            let rows = Math.ceil(length / 7);
            const rowsMargin = this._datePickerAutoRow && rows < this._datePickerMaxRow ? this._datePickerMaxRow - rows : 0;
            rows += rowsMargin;
            return this._datePickerAutoRow ? rows * 7 - length : (rows + Math.ceil((this._datePickerMaxRow - rows) / 2)) * 7 - length;
        };
        this._calculateAutoRowStartLength = (length) => !this._datePickerAutoRow ? 0 : Math.floor((this._datePickerMaxRow - Math.ceil(length / 7)) / 2) * 7;
        this._getLocale = (year) => this._locale(year);
        this._forceUpdate = (date) => {
            this._days = this._calculateDays(date);
            this._tiggerUpdate(PickerEvents.changeDate);
        };
        this._getYear = () => getFullYear(this._getSelectedDate());
        this._updateDate = (date) => {
            this._renderedDate = date;
            this._forceUpdate();
        };
        this.getDaysArray = (monthSate = 'current') => {
            if (monthSate === 'current')
                return this._days;
            else if (monthSate === 'next' && !this._twoSide)
                throw new Error('TwoSide flag most be true to get next month days.');
            const nextMonthDate = createDate(this._renderedDate);
            nextMonthDate.setMonth(nextMonthDate.getMonth() + 1);
            return this._calculateDays(formatDate(nextMonthDate), 1);
        };
        this.getMonthList = () => Object.entries(this._getLocale(this._getYear()).months).map(([key, value]) => ({ monthNumber: Number(key), ...value }));
        this.getYearsList = (minimumYear, maximumYear) => {
            if (maximumYear <= minimumYear)
                throw new Error('maximnum year most be greater than minimum year');
            return Array(maximumYear - minimumYear + 1).fill('').map((_, index) => minimumYear + index);
        };
        this.getDate = () => {
            if (!this._selectedDate)
                return '';
            const selectedDate = this._getSelectedDate();
            return `${getFullYear(selectedDate)}-${addZero(getMonth(selectedDate))}-${addZero(getDate(selectedDate))}`;
        };
        this.getSelecteDateUnformated = () => this._selectedDate;
        this.getRenderedDateUnformated = () => this._renderedDate;
        this.getRenderedMonth = () => getMonth(this._getRenderedDate());
        this.getRenderedMonthName = () => this._getLocale(this._getYear()).months[this._calculateMonthOfDate(this._getRenderedDate())].name;
        this.getRenderedYear = () => getFullYear(this._getRenderedDate());
        this.getRenderedNextMonth = () => getMonth(this._nextMonthDate());
        this.getRenderedNextMonthName = () => this._getLocale(getFullYear(this._nextMonthDate())).months[this._calculateMonthOfDate(this._nextMonthDate())].name;
        this.getRenderedNextDateYear = () => getFullYear(this._nextMonthDate());
        this.getDayMonthOffset = (index = 0) => (this._monthOfsetIndex[index] + this._weekOffset) % 7;
        this.changeMonth = (month, forceClosing = true) => {
            const formatedDate = this._dateFormatter(formatDate(createDate(this._renderedDate)));
            const difMonth = month - getMonth(formatedDate);
            const newDate = createDate(this._renderedDate);
            newDate.setMonth(newDate.getMonth() + difMonth);
            this._renderedDate = this._calculateRenderedDate(formatDate(newDate), this._normalized, this._twoSide, this._dateFormatter, true);
            if (forceClosing)
                this._mode = 'day';
            this._forceUpdate();
        };
        this.changeYear = (year, forceClosing = true) => {
            const difYear = getFullYear(this._dateFormatter(this._renderedDate)) - year;
            const newDate = createDate(this._renderedDate);
            newDate.setFullYear(getFullYear(this._renderedDate) - difYear);
            this._renderedDate = formatDate(newDate);
            if (forceClosing)
                this._mode = 'day';
            this._forceUpdate();
        };
        this.handleShowNextMonth = () => {
            const newDate = createDate(this._renderedDate);
            newDate.setMonth(newDate.getMonth() + this._monthStep);
            this._updateDate(formatDate(newDate));
        };
        this.handleShowPrevMonth = () => {
            const newDate = createDate(this._renderedDate);
            newDate.setMonth(newDate.getMonth() - this._monthStep);
            this._updateDate(formatDate(newDate));
        };
        this.handleShowNextYear = () => {
            const newDate = createDate(this._renderedDate);
            newDate.setFullYear(newDate.getFullYear() + 1);
            this._updateDate(formatDate(newDate));
        };
        this.handleShowPrevYear = () => {
            const newDate = createDate(this._renderedDate);
            newDate.setFullYear(newDate.getFullYear() - 1);
            this._updateDate(formatDate(newDate));
        };
        this.goToToday = () => {
            this._open = true;
            this._forceLoadingStart();
            const newDate = formatDate(createDate());
            this._renderedDate = newDate;
            this._selectedDate = newDate;
            this._forceLoadingEnd();
            this._tiggerUpdate(PickerEvents.calculateDays);
            this._tiggerUpdate(PickerEvents.changeDate);
        };
        this.setOpen = (open) => {
            if (this._open !== open) {
                this._open = open;
                this._events.emit(PickerEvents.changeOpen);
            }
        };
        this.setMode = (mode) => {
            if (mode !== this._mode) {
                this._mode = mode;
                this._events.emit(PickerEvents.changeMode);
            }
        };
        this.setDate = (date) => {
            validateDate(date);
            this._selectedDate = date;
            this._forceUpdate();
        };
        this.getMode = () => this._mode;
        this.isOpen = () => this._open;
        this.isLoadingState = () => this._isLoading;
        const selectedDate = formatDate(createDate(props.date));
        const twoSide = props.twoSide ?? false;
        const normalized = twoSide ? true : false;
        const dateFormatter = props?.dateFormatter ?? ((date) => date);
        this._locale = props.locale;
        this._dateFormatter = dateFormatter;
        this._weekOffset = props.weekOffset || 0;
        this._dayRenderType = props.dayRenderType || 'space';
        this._datePickerMaxRow = props.datePickerMaxRow || 6;
        this._datePickerAutoRow = props.datePickerAutoRow ?? false;
        this._delayTimeout = props.delayTimeout ?? 150;
        this._twoSide = twoSide;
        this._normalized = normalized;
        this._monthStep = twoSide ? normalized ? 2 : 1 : 1;
        this._selectedDate = props.date ? selectedDate : '';
        this._renderedDate = this._calculateRenderedDate(selectedDate, normalized, twoSide, dateFormatter);
        this._days = this._calculateDays();
        this._events.subscribe(PickerEvents.calculateDays, this._calculateDaysListener);
        this._events.subscribe(PickerEvents.changeOpen, this._changeOpenListener);
        this._events.subscribe(PickerEvents.changeMode, this._changeViewListener);
        this._events.subscribe(PickerEvents.changeState, this._changeStateListener);
        this._state = 'rendered';
    }
    // getters
    get mode() {
        return this._mode;
    }
    get isLoading() {
        return this._isLoading;
    }
    get open() {
        return this._open;
    }
}
export { BasePicker };
//# sourceMappingURL=BasePicker.js.map