import { addZero, createDate, formatDate, getDate, getFullYear, getMonth, isValidDateFormat, validateDate } from '../utils/dateUtils';
import { BasePicker } from './BasePicker'
import { DateFormatterFn, PickerDayRenderType, PickerEvents, PickerLocale, DaysStateTypes } from './types'

interface RangePickerOptions {
  locale: PickerLocale;
  date?: string;
  dateFormatter?: DateFormatterFn;
  weekOffset?: number;
  dayRenderType?: PickerDayRenderType;
  datePickerAutoRow?: boolean;
  datePickerMaxRow?: number;
  delayTimeout?: number;
  twoSide?: boolean;
  normalized?: boolean;
  endDate?: string;
}

class RangePicker extends BasePicker {
  private _selectedEndDate?: string;
  private _hoveredDate?: string

  constructor(props: RangePickerOptions) {
    super(props)

    this._selectedEndDate = props.endDate ? formatDate(createDate(props.endDate)) : ''
  }

  public changeDay = (date: string, state: DaysStateTypes) => {
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

      const pickerState = this._state

      if (this._selectedDate && this._selectedEndDate) {
        this._selectedEndDate = undefined
        this._hoveredDate = undefined
      }

      if (pickerState === 'rendered' || createDate(this._selectedDate).getTime() > createDate(date).getTime()) {
        this._selectedDate = date
        this._state = 'selecting'

      } else if (pickerState === 'selecting') {
        this._selectedEndDate = date
        this._state = 'rendered'
      }

      let updateDate = date

      if (this._normalized) {
        const renderedDate = this._calculateRenderedDate(date, this._normalized, this._twoSide, this._dateFormatter)
        updateDate = renderedDate
      }

      this._renderedDate = updateDate

      this._days = this._calculateDays(updateDate)
      this._events.emit(PickerEvents.changeDate, createDate(updateDate))

      if (!isCurrent && this._dayRenderType === 'fill') {
        if (this._selectedDate && !this._selectedEndDate) {
          this._selectedEndDate = date
        }
        this._updateChangeDay(date)
      }
    }
  }

  public isSelectedDay = (date: string) => this._selectedDate === date || this._selectedEndDate === date
  public getSelectedEndDate = () => this._selectedEndDate && this._dateFormatter(this._selectedEndDate)

  public getSelectedEndDateUnformatted = () => this._selectedEndDate

  private _updateChangeDay = (date: string) => {
    this._isLoading = false

    if (!this._selectedDate) {
      this._selectedDate = date
      this._state = 'selecting'
    } else if (this._selectedDate) {
      this._selectedEndDate = date
      this._state = 'rendered'
    }

    this._triggerUpdate(PickerEvents.calculateDays)
  }

  public getEndDate = () => {
    if (!this._selectedEndDate) return ''
    const selectedDate = this._dateFormatter(this._selectedEndDate)
    return `${getFullYear(selectedDate)}-${addZero(getMonth(selectedDate))}-${addZero(getDate(selectedDate))}`
  }

  public goToToday = () => {
    this._open = true
    this._forceLoadingStart()

    const newDate = formatDate(createDate())

    this._renderedDate = newDate
    this._selectedDate = newDate
    this._selectedEndDate = ''
    this._hoveredDate = ''

    this._forceLoadingEnd()
    this._triggerUpdate(PickerEvents.calculateDays)
    this._triggerUpdate(PickerEvents.changeDate)
  }

  public onCellHover = (date: string) => {
    if (this._state === 'selecting') {
      this._hoveredDate = date

      if (this._selectedDate) {
        if (this._selectedEndDate) {
          this._hoveredDate = undefined
          this._state = 'rendered'
        }

        this._triggerUpdate(PickerEvents.changeDate)
      }
    }
  }

  public isDateInRange = (date: string, includeStart = false, includeEnd = true) => {
    const startDate = createDate(this._selectedDate).getTime()
    const endDate = createDate(this._hoveredDate || this._selectedEndDate || this._selectedDate).getTime()

    const dateTime = createDate(date).getTime()

    const startCondition = includeStart ? dateTime >= startDate : dateTime > startDate
    const endCondition = includeEnd ? dateTime <= endDate : dateTime < endDate

    if (this._state === 'selecting' || this._state === 'rendered') return startCondition && endCondition

    return false
  }

  public isSelecting = () => this._state === 'selecting'
  public isStartDate = (date: string) => this._selectedDate === date
  public isEndDate = (date: string) => this._hoveredDate === date

  public setRenderedDate = (date: string) => {
    validateDate(date)

    this._renderedDate = this._calculateRenderedDate(date, this._normalized, this._twoSide, this._dateFormatter, true)
    this._forceUpdate()
  }

  public setEndDate = (date: string) => {
    validateDate(date)

    this._selectedEndDate = date
    this._forceUpdate()
  }

}

export {
  RangePicker
}