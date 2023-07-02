import { addZero, createDate, formatDate, getDate, getFullYear, getMonth, isValidDateFormat, validateDate } from '../utils/dateUtils';
import { BasePicker } from './BasePicker';
import { PickerEvents } from './types';
class RangePicker extends BasePicker {
    constructor(props) {
        super(props);
        this.changeDay = (date, state) => {
            if (isValidDateFormat(date)) {
                let isCurrent = state === 'current';
                if (this._twoSide && this._dayRenderType === 'fill' && this._normalized) {
                    const current = this._days.find(f => f.date === date);
                    const next = this.getDaysArray('next').find(f => f.date === date);
                    isCurrent = Boolean(current?.state === 'current' || current?.state === 'next') || Boolean(next?.state === 'current' || next?.state === 'prev');
                }
                if (this._dayRenderType === 'fill' && !isCurrent) {
                    this._forceLoadingStart();
                }
                const pickerState = this._state;
                if (this._selectedDate && this._selectedEndDate) {
                    this._selectedEndDate = undefined;
                    this._hoveredDate = undefined;
                }
                if (pickerState === 'rendered' || createDate(this._selectedDate).getTime() > createDate(date).getTime()) {
                    this._selectedDate = date;
                    this._state = 'selecting';
                }
                else if (pickerState === 'selecting') {
                    this._selectedEndDate = date;
                    this._state = 'rendered';
                }
                let updateDate = date;
                if (this._normalized) {
                    const renderedDate = this._calculateRenderedDate(date, this._normalized, this._twoSide, this._dateFormatter);
                    updateDate = renderedDate;
                }
                this._renderedDate = updateDate;
                this._days = this._calculateDays(updateDate);
                this._events.emit(PickerEvents.changeDate, createDate(updateDate));
                if (!isCurrent && this._dayRenderType === 'fill') {
                    if (this._selectedDate && !this._selectedEndDate) {
                        this._selectedEndDate = date;
                    }
                    this._updateChangeDay(date);
                }
            }
        };
        this.isSelectedDay = (date) => this._selectedDate === date || this._selectedEndDate === date;
        this.getSelectedEndDate = () => this._selectedEndDate && this._dateFormatter(this._selectedEndDate);
        this.getSelecteEndDateUnformated = () => this._selectedEndDate;
        this._updateChangeDay = (date) => {
            this._isLoading = false;
            if (!this._selectedDate) {
                this._selectedDate = date;
                this._state = 'selecting';
            }
            else if (this._selectedDate) {
                this._selectedEndDate = date;
                this._state = 'rendered';
            }
            this._tiggerUpdate(PickerEvents.calculateDays);
        };
        this.getEndDate = () => {
            if (!this._selectedEndDate)
                return '';
            const selectedDate = this._dateFormatter(this._selectedEndDate);
            return `${getFullYear(selectedDate)}-${addZero(getMonth(selectedDate))}-${addZero(getDate(selectedDate))}`;
        };
        this.goToToday = () => {
            this._open = true;
            this._forceLoadingStart();
            const newDate = formatDate(createDate());
            this._renderedDate = newDate;
            this._selectedDate = newDate;
            this._selectedEndDate = '';
            this._hoveredDate = '';
            this._forceLoadingEnd();
            this._tiggerUpdate(PickerEvents.calculateDays);
            this._tiggerUpdate(PickerEvents.changeDate);
        };
        this.onCellHover = (date) => {
            if (this._state === 'selecting') {
                this._hoveredDate = date;
                if (this._selectedDate) {
                    if (this._selectedEndDate) {
                        this._hoveredDate = undefined;
                        this._state = 'rendered';
                    }
                    this._tiggerUpdate(PickerEvents.changeDate);
                }
            }
        };
        this.isDateInRange = (date, includeStart = false, includeEnd = true) => {
            const startDate = createDate(this._selectedDate).getTime();
            const endDate = createDate(this._hoveredDate || this._selectedEndDate || this._selectedDate).getTime();
            const dateTime = createDate(date).getTime();
            const startCondition = includeStart ? dateTime >= startDate : dateTime > startDate;
            const endCondition = includeEnd ? dateTime <= endDate : dateTime < endDate;
            if (this._state === 'selecting' || this._state === 'rendered')
                return startCondition && endCondition;
            return false;
        };
        this.isSelecting = () => this._state === 'selecting';
        this.isStartDate = (date) => this._selectedDate === date;
        this.isEndDate = (date) => this._hoveredDate === date;
        this.setRenderedDate = (date) => {
            validateDate(date);
            this._renderedDate = this._calculateRenderedDate(date, this._normalized, this._twoSide, this._dateFormatter, true);
            this._forceUpdate();
        };
        this.setEndDate = (date) => {
            validateDate(date);
            this._selectedEndDate = date;
            this._forceUpdate();
        };
        this._selectedEndDate = props.endDate ? formatDate(createDate(props.endDate)) : '';
    }
}
export { RangePicker };
//# sourceMappingURL=RangePicker.js.map