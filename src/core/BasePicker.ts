import { formatDate, getDate, getFullYear, getMonth, addZero, validateDate, createDate } from '../utils/dateUtils'
import EventEmitter, { EventEmitterCallback } from './EventEmitter'
import {
  DateFormatterFn,
  PickerState,
  PickerLocale,
  Days,
  PickerDayRenderType,
  PickerMode,
  PickerEvents,
  MonthsProps,
  PickerMonthState,
  MonthListObject,
  MonthListMap,
  DaysStateTypes
} from './types'


interface BasePickerOptions {
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

abstract class BasePicker {
  protected _state: PickerState = 'loading'
  protected _locale: PickerLocale
  protected _events = new EventEmitter()
  protected _selectedDate: string
  protected _renderedDate: string

  protected _days: Array<Days>
  protected _monthOffsetIndex: Array<number> = [0, 0]
  protected _weekOffset: number

  protected _dayRenderType: PickerDayRenderType
  protected _datePickerMaxRow: number
  protected _datePickerAutoRow: boolean
  protected _delayTimeout: number

  protected _twoSide: boolean
  protected _normalized: boolean
  protected _monthStep: number

  protected _dateFormatter: (date: string) => string

  protected _open = false
  protected _mode: PickerMode = 'day'
  protected _isLoading = false;

  constructor(props: BasePickerOptions) {
    const selectedDate = formatDate(createDate(props.date))
    const twoSide = props.twoSide ?? false
    const normalized = twoSide ? true : false
    const dateFormatter = props?.dateFormatter ?? ((date) => date)

    this._locale = props.locale
    this._dateFormatter = dateFormatter

    this._weekOffset = props.weekOffset || 0

    this._dayRenderType = props.dayRenderType || 'space'
    this._datePickerMaxRow = props.datePickerMaxRow || 6
    this._datePickerAutoRow = props.datePickerAutoRow ?? false
    this._delayTimeout = props.delayTimeout ?? 150

    this._twoSide = twoSide
    this._normalized = normalized
    this._monthStep = twoSide ? normalized ? 2 : 1 : 1

    this._selectedDate = props.date ? selectedDate : ''
    this._renderedDate = this._calculateRenderedDate(selectedDate, normalized, twoSide, dateFormatter)

    this._days = this._calculateDays()

    this._events.subscribe(PickerEvents.calculateDays, this._calculateDaysListener)
    this._events.subscribe(PickerEvents.changeOpen, this._changeOpenListener)
    this._events.subscribe(PickerEvents.changeMode, this._changeViewListener)
    this._events.subscribe(PickerEvents.changeState, this._changeStateListener)

    this._state = 'rendered'
  }

  // getters
  public get mode() {
    return this._mode
  }

  public get isLoading() {
    return this._isLoading
  }

  public get open() {
    return this._open
  }

  public onChangeDate = (cb: EventEmitterCallback) => this._events.subscribe(PickerEvents.changeDate, cb)

  protected _triggerUpdate = (eventName: PickerEvents) => {
    if (this._selectedDate) {
      const sDate = createDate(this._selectedDate)
      sDate.setMilliseconds(createDate().getMilliseconds())

      this._events.emit(eventName, sDate)
    } else this._events.emit(eventName, createDate())
  }

  private _calculateDaysListener = () => this._days = this._calculateDays()
  private _changeOpenListener = () => this._triggerUpdate(PickerEvents.changeDate)
  private _changeViewListener = () => this._triggerUpdate(PickerEvents.changeDate)
  private _changeStateListener = (state: PickerState) => {
    this._state = state
    this._isLoading = state === 'loading'

    this._days = this._calculateDays()
    this._triggerUpdate(PickerEvents.changeDate)
  }

  protected _forceLoadingStart = () => this._delayTimeout > 0 && this._events.emit(PickerEvents.changeState, 'loading')

  protected _forceLoadingEnd = () => this._delayTimeout > 0 && setTimeout(() => {
    this._events.emit(PickerEvents.changeState, 'rendered')
  }, this._delayTimeout)

  protected _getPastMonth = (month: number) => {
    let m = month

    if (month === 1) m = 12
    else m -= 1

    return m
  }

  protected _get2PastMonth = (month: number) => this._getPastMonth(this._getPastMonth(month))

  protected _calculateRenderedDate = (date: string, isNormalized: boolean, twoSide: boolean, foramtter: DateFormatterFn, forceUseDate = false) => {
    if (!isNormalized || !twoSide) return date

    const newDate = createDate(forceUseDate ? date : this._renderedDate || date)

    const isPastRenderedMonth = this._days?.find(f => f.date === date)?.state === 'prev'
    const isNextRenderedMonth = this._renderedDate ? this.getDaysArray('next')?.find(f => f.date === date)?.state === 'next' : false

    const month = getMonth(foramtter(formatDate(newDate)))
    const days = this._getLocale(getFullYear(foramtter(formatDate(newDate)))).months[this._getPastMonth(month) as keyof MonthsProps].numberOfDays

    if (isNextRenderedMonth) return date
    else if (isPastRenderedMonth) {
      const pastDays = this._getLocale(getFullYear(foramtter(formatDate(newDate)))).months[this._get2PastMonth(month) as keyof MonthsProps].numberOfDays
      newDate.setDate(newDate.getDate() - 1 - days - pastDays)
    } else if (month % 2 === 0) newDate.setDate(newDate.getDate() - 1 - days)

    return formatDate(newDate)
  }

  protected _getSelectedDate = () => this._dateFormatter(this._selectedDate)
  protected _getRenderedDate = () => this._dateFormatter(this._renderedDate)

  protected _calculateMonthOfDate = <T>(date: string): T => (getMonth(date)) as T

  protected _nextMonthDate = () => {
    const newDate = createDate(this._renderedDate)
    newDate.setMonth(newDate.getMonth() + 1)

    return this._dateFormatter(formatDate(newDate))
  }

  protected _calculateDays = (date?: string, monthIndex = 0): Array<Days> => {
    const cDate = date || this._renderedDate

    const day = getDate(this._dateFormatter(cDate))
    const dDay = getDate(cDate)
    const difDay = (dDay - day)

    const nDate = createDate(cDate)
    nDate.setDate(difDay + 1)

    const prevDate = createDate(formatDate(nDate))

    const numberOfZeros = nDate.getDay()

    const fullYear = getFullYear(this._dateFormatter(cDate))
    const month = this._calculateMonthOfDate<keyof MonthsProps>(this._dateFormatter(cDate))

    const arraySize = this._getLocale(fullYear).months[month].numberOfDays

    const daysArray: Array<Days> = Array(arraySize).fill('').map((_, index) => {
      const date = `${nDate.getFullYear()}-${addZero(nDate.getMonth() + 1)}-${addZero(nDate.getDate())}`
      nDate.setDate(nDate.getDate() + 1)
      return ({ day: index + 1, state: 'current', date })
    })


    if (this._dayRenderType === 'space') {
      this._monthOffsetIndex[monthIndex] = numberOfZeros
    } else if (this._dayRenderType === 'fill') {

      this._monthOffsetIndex[0] = -this._weekOffset
      this._monthOffsetIndex[1] = -this._weekOffset

      const startLength = ((numberOfZeros + this._weekOffset) % 7 + this._calculateAutoRowStartLength(daysArray.length))
      const pDate = createDate(formatDate(prevDate))
      pDate.setMonth(pDate.getMonth() - 1)

      const formatedPDate = this._dateFormatter(formatDate(pDate))

      const prevMonthDayNumber = this._getLocale(getFullYear(formatedPDate)).months[getMonth(formatedPDate) as keyof MonthsProps].numberOfDays

      prevDate.setDate(prevDate.getDate() - startLength)

      const start: Array<Days> = Array(startLength).fill('').map((_, index) => {
        const date = `${prevDate.getFullYear()}-${addZero(prevDate.getMonth() + 1)}-${addZero(prevDate.getDate())}`
        prevDate.setDate(prevDate.getDate() + 1)

        return ({ day: (prevMonthDayNumber - startLength + index + 1), state: 'prev', date })
      })

      daysArray.unshift(...start)

      const endLength = this._calculateAutoRowEndLength(daysArray.length)
      const end: Array<Days> = Array(endLength).fill('')
        .map((_, index) => {
          const date = `${nDate.getFullYear()}-${addZero(nDate.getMonth() + 1)}-${addZero(nDate.getDate())}`
          nDate.setDate(nDate.getDate() + 1)
          return ({ day: index + 1, state: 'next', date })
        })

      daysArray.push(...end)

    } else throw new Error('can\'t calculate days.')

    return daysArray
  }

  protected _calculateAutoRowEndLength = (length: number) => {
    let rows = Math.ceil(length / 7)

    const rowsMargin = this._datePickerAutoRow && rows < this._datePickerMaxRow ? this._datePickerMaxRow - rows : 0
    rows += rowsMargin

    return this._datePickerAutoRow ? rows * 7 - length : (rows + Math.ceil((this._datePickerMaxRow - rows) / 2)) * 7 - length
  }

  protected _calculateAutoRowStartLength = (length: number) =>
    !this._datePickerAutoRow ? 0 : Math.floor((this._datePickerMaxRow - Math.ceil(length / 7)) / 2) * 7

  protected _getLocale = (year: number) => this._locale(year)

  protected _forceUpdate = (date?: string) => {
    this._days = this._calculateDays(date)
    this._triggerUpdate(PickerEvents.changeDate)
  }


  protected _getYear = () => getFullYear(this._getSelectedDate())

  protected _updateDate = (date: string) => {
    this._renderedDate = date

    this._forceUpdate()
  }

  public getDaysArray = (monthSate: PickerMonthState = 'current') => {
    if (monthSate === 'current') return this._days
    else if (monthSate === 'next' && !this._twoSide) throw new Error('TwoSide flag most be true to get next month days.')

    const nextMonthDate = createDate(this._renderedDate)
    nextMonthDate.setMonth(nextMonthDate.getMonth() + 1)

    return this._calculateDays(formatDate(nextMonthDate), 1)
  }

  public getMonthList = () => Object.entries(this._getLocale(this._getYear()).months).map<MonthListObject>(([key, value]: MonthListMap) => ({ monthNumber: Number(key), ...value }))

  public getYearsList = (minimumYear: number, maximumYear: number): Array<number> => {
    if (maximumYear <= minimumYear) throw new Error('maximnum year most be greater than minimum year')

    return Array(maximumYear - minimumYear + 1).fill('').map((_, index) => minimumYear + index)
  }

  public getDate = () => {
    if (!this._selectedDate) return ''
    const selectedDate = this._getSelectedDate()
    return `${getFullYear(selectedDate)}-${addZero(getMonth(selectedDate))}-${addZero(getDate(selectedDate))}`
  }


  public getSelectedDateUnformatted = () => this._selectedDate
  public getRenderedDateUnformatted = () => this._renderedDate

  public getRenderedMonth = () => getMonth(this._getRenderedDate())
  public getRenderedMonthName = () => this._getLocale(this._getYear()).months[this._calculateMonthOfDate<keyof MonthsProps>(this._getRenderedDate())].name
  public getRenderedYear = () => getFullYear(this._getRenderedDate())

  public getRenderedNextMonth = () => getMonth(this._nextMonthDate())
  public getRenderedNextMonthName = () => this._getLocale(getFullYear(this._nextMonthDate())).months[this._calculateMonthOfDate<keyof MonthsProps>(this._nextMonthDate())].name
  public getRenderedNextDateYear = () => getFullYear(this._nextMonthDate())

  public getDayMonthOffset = (index: 0 | 1 = 0) => (this._monthOffsetIndex[index] + this._weekOffset) % 7

  public changeMonth = (month: number, forceClosing = true) => {
    const formatedDate = this._dateFormatter(formatDate(createDate(this._renderedDate)))
    const difMonth = month - getMonth(formatedDate)

    const newDate = createDate(this._renderedDate)
    newDate.setMonth(newDate.getMonth() + difMonth)

    this._renderedDate = this._calculateRenderedDate(formatDate(newDate), this._normalized, this._twoSide, this._dateFormatter, true)

    if (forceClosing) this._mode = 'day'

    this._forceUpdate()
  }

  public changeYear = (year: number, forceClosing = true) => {
    const difYear = getFullYear(this._dateFormatter(this._renderedDate)) - year

    const newDate = createDate(this._renderedDate)
    newDate.setFullYear(getFullYear(this._renderedDate) - difYear)

    this._renderedDate = formatDate(newDate)

    if (forceClosing) this._mode = 'day'

    this._forceUpdate()
  }

  public handleShowNextMonth = () => {
    const newDate = createDate(this._renderedDate)
    newDate.setMonth(newDate.getMonth() + this._monthStep)

    this._updateDate(formatDate(newDate))
  }

  public handleShowPrevMonth = () => {
    const newDate = createDate(this._renderedDate)
    newDate.setMonth(newDate.getMonth() - this._monthStep)

    this._updateDate(formatDate(newDate))
  }

  public handleShowNextYear = () => {
    const newDate = createDate(this._renderedDate)
    newDate.setFullYear(newDate.getFullYear() + 1)

    this._updateDate(formatDate(newDate))
  }

  public handleShowPrevYear = () => {
    const newDate = createDate(this._renderedDate)
    newDate.setFullYear(newDate.getFullYear() - 1)

    this._updateDate(formatDate(newDate))
  }

  public goToToday = () => {
    this._open = true
    this._forceLoadingStart()

    const newDate = formatDate(createDate())

    this._renderedDate = newDate
    this._selectedDate = newDate

    this._forceLoadingEnd()
    this._triggerUpdate(PickerEvents.calculateDays)
    this._triggerUpdate(PickerEvents.changeDate)
  }

  public setOpen = (open: boolean) => {
    if (this._open !== open) {
      this._open = open

      this._events.emit(PickerEvents.changeOpen)
    }
  }

  public setMode = (mode: PickerMode) => {
    if (mode !== this._mode) {
      this._mode = mode

      this._events.emit(PickerEvents.changeMode)
    }
  }

  public setDate = (date: string) => {
    validateDate(date)

    this._selectedDate = date
    this._forceUpdate()
  }

  public getMode = () => this._mode
  public isOpen = () => this._open
  public isLoadingState = () => this._isLoading

  // abstracts
  public abstract changeDay(date: string, state: DaysStateTypes): void
  public abstract isSelectedDay(date: string): boolean
}

export {
  BasePicker
}

export type {
  PickerLocale as DatePickerLocale
}