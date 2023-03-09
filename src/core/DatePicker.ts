import { createDate, isValidDateFormat } from '../utils/dateUtils';
import { BasePicker } from './BasePicker'
import { DateFormatterFn, PickerDayRenderType, PickerEvents, PickerLocale, DaysStateTypes } from './types'

interface DatePickerOptions {
  locale: PickerLocale;
  date?: string;
  dateFormatter?: DateFormatterFn;
  weekOffset?: number;
  dayRenderType?: PickerDayRenderType;
  datePickerAutoRow?: boolean;
  datePickerMaxRow?: number;
  delayTimeout?: number;
  twoSide?: boolean;
}

class DatePicker extends BasePicker {
  constructor(props: DatePickerOptions) {
    super(props)
  }

  public changeDay = (date: string, state: DaysStateTypes): void => {
    if (isValidDateFormat(date)) {
      let isCurrent = state === 'current'

      if (this._twoSide && this._dayRenderType === 'fill' && this._normalized) {
        const current = this._days.find(f => f.date === date)
        const next = this.getDaysArray('next').find(f => f.date === date)
        isCurrent = Boolean(current?.state === 'current' || current?.state === 'next') || Boolean(next?.state === 'current' || next?.state === 'prev')
      }

      if (this._dayRenderType === 'fill' && !isCurrent) {
        this._forceLoadingStart()
      }

      this._selectedDate = date

      let updateDate = date

      if (this._normalized) {
        const renderedDate = this._calculateRenderedDate(date, this._normalized, this._twoSide, this._dateFormatter)
        updateDate = renderedDate
      }

      this._renderedDate = updateDate

      this._days = this._calculateDays(updateDate)
      this._events.emit(PickerEvents.changeDate, createDate(updateDate))

      if (!isCurrent && this._dayRenderType === 'fill') {
        this._updateChangeDay(date)
      }
    }
  }

  public isSelectedDay = (date: string) => this._selectedDate === date


  private _updateChangeDay = (date: string) => {
    this.isLoading = false
    this._selectedDate = date

    this._tiggerUpdate(PickerEvents.calculateDays)
  }

}

export {
  DatePicker
}