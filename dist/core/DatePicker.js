import { createDate, isValidDateFormat } from '../utils/dateUtils';
import { BasePicker } from './BasePicker';
import { PickerEvents } from './types';
class DatePicker extends BasePicker {
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
                this._selectedDate = date;
                let updateDate = date;
                if (this._normalized) {
                    const renderedDate = this._calculateRenderedDate(date, this._normalized, this._twoSide, this._dateFormatter);
                    updateDate = renderedDate;
                }
                this._renderedDate = updateDate;
                this._days = this._calculateDays(updateDate);
                this._events.emit(PickerEvents.changeDate, createDate(updateDate));
                if (!isCurrent && this._dayRenderType === 'fill') {
                    this._updateChangeDay(date);
                }
            }
        };
        this.isSelectedDay = (date) => this._selectedDate === date;
        this._updateChangeDay = (date) => {
            this._isLoading = false;
            this._selectedDate = date;
            this._tiggerUpdate(PickerEvents.calculateDays);
        };
    }
}
export { DatePicker };
//# sourceMappingURL=DatePicker.js.map