import { formatDate, getDate, getFullYear, getMonth, addZero, isValidDateFormat, validateDate, createDate } from '../utils/dateUtils'
import EventEmitter, { EventEmitterCallback } from './EventEmitter'

type DatePickerMode = 'day' | 'month' | 'year'
type DatePickerType = 'datePicker' | 'rangePicker'
type DatePickerDayRenderType = 'fill' | 'space'

type DaysStateTypes = 'prev' | 'next' | 'current'
type DatePickerState = 'loading' | 'rendered' | 'selecting'
type DatePickerMonthState = 'current' | 'next'

interface Month {
  name: string;
  numberOfDays: number;
}

interface MonthsProps {
  1: Month;
  2: Month;
  3: Month;
  4: Month;
  5: Month;
  6: Month;
  7: Month;
  8: Month;
  9: Month;
  10: Month;
  11: Month;
  12: Month;
}

interface LocaleProps {
  months: MonthsProps;
}

type DateFormatterFn = (date: string) => string

type MonthListObject = Month & { monthNumber: number }
type MonthListMap = [string, Month]

type DatePickerLocale = (year: number) => LocaleProps

interface CustomDatePickerOptions {
  locale: DatePickerLocale;
  date?: string;
  dateFormatter?: DateFormatterFn;
  weekOffset?: number;
  dayRenderType?: DatePickerDayRenderType;
  datePickerAutoRow?: boolean;
  datePickerMaxRow?: number;
  delayTimeout?: number;
  twoSide?: boolean;
  normalized?: boolean;
  type?: DatePickerType;
  endDate?: string;
}

interface Days {
  day: number;
  state: DaysStateTypes;
  date: string;
}

enum DatePickerEvents {
  changeDate = 'change-date',
  changeMode = 'change-mode',
  calculateDays = 'calculate-days',
  changeOpen = 'change-open',
  changeState = 'change-state',
}

class CustomDatePicker {
  private _state: DatePickerState = 'loading'
  private _locale: DatePickerLocale;
  private _events = new EventEmitter()
  private _selectedDate: string
  private _renderedDate: string
  private _selectedEndDate?: string
  private _hoveredDate?: string

  private _days: Array<Days>
  private _monthOfsetIndex: Array<number> = [0, 0]
  private _weekOffset = 0

  private _dayRenderType: DatePickerDayRenderType
  private _datePickerMaxRow: number
  private _datePickerAutoRow: boolean
  private _delayTimeout: number

  private _twoSide: boolean
  private _normalized: boolean
  private _monthStep: number
  private _datePickerType: DatePickerType

  private _dateFormatter: (date: string) => string;

  public open = false
  public mode: DatePickerMode = 'day'
  public isLoading = false;

  constructor(props: CustomDatePickerOptions) {
    const selectedDate = formatDate(createDate(props.date))
    const twoSide = props.twoSide ?? false
    const normalized = props.normalized ?? (twoSide ? true : false)
    const datePickerType = props.type ?? 'datePicker'
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
    this._datePickerType = datePickerType

    this._selectedDate = props.date ? selectedDate : ''
    this._selectedEndDate = datePickerType === 'rangePicker' ? (props.endDate ? formatDate(createDate(props.endDate)) : '') : ''
    this._renderedDate = this._calculateRenderedDate(selectedDate, normalized, twoSide, dateFormatter)

    this._days = this._calculateDays()

    this._events.subscribe(DatePickerEvents.calculateDays, this._calculateDaysListener)
    this._events.subscribe(DatePickerEvents.changeOpen, this._changeOpenListener)
    this._events.subscribe(DatePickerEvents.changeMode, this._changeViewListener)
    this._events.subscribe(DatePickerEvents.changeState, this._changeStateListener)

    this._state = 'rendered'
  }

  public onChageDate = (cb: EventEmitterCallback) => this._events.subscribe(DatePickerEvents.changeDate, cb)

  private _tiggerUpdate = (eventName: DatePickerEvents) => {
    if (this._selectedDate) {
      const sDate = createDate(this._selectedDate)
      sDate.setMilliseconds(createDate().getMilliseconds())

      this._events.emit(eventName, sDate)
    } else this._events.emit(eventName, createDate())
  }

  private _calculateDaysListener = () => this._days = this._calculateDays()
  private _changeOpenListener = () => this._tiggerUpdate(DatePickerEvents.changeDate)
  private _changeViewListener = () => this._tiggerUpdate(DatePickerEvents.changeDate)
  private _changeStateListener = (state: DatePickerState) => {
    this._state = state
    this.isLoading = state === 'loading'

    this._days = this._calculateDays()
    this._tiggerUpdate(DatePickerEvents.changeDate)
  }

  private _forceLoadingStart = () => this._delayTimeout > 0 && this._events.emit(DatePickerEvents.changeState, 'loading')

  private _forceLoadingEnd = () => this._delayTimeout > 0 && setTimeout(() => {
    this._events.emit(DatePickerEvents.changeState, 'rendered')
  }, this._delayTimeout)

  private _getPastMonth = (month: number) => {
    let m = month

    if (month === 1) m = 12
    else m -= 1

    return m
  }

  private _get2PastMonth = (month: number) => this._getPastMonth(this._getPastMonth(month))

  private _calculateRenderedDate = (date: string, isNormalized: boolean, twoSide: boolean, foramtter: DateFormatterFn, forceUseDate = false) => {
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

  private _getSelectedDate = () => this._dateFormatter(this._selectedDate)
  private _getRenderedDate = () => this._dateFormatter(this._renderedDate)

  private _calculateMonthOfDate = <T>(date: string): T => (getMonth(date)) as T

  private _nextMonthDate = () => {
    const newDate = createDate(this._renderedDate)
    newDate.setMonth(newDate.getMonth() + 1)

    return this._dateFormatter(formatDate(newDate))
  }

  private _calculateDays = (date?: string, monthIndex = 0): Array<Days> => {
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
      this._monthOfsetIndex[monthIndex] = numberOfZeros
    } else if (this._dayRenderType === 'fill') {

      this._monthOfsetIndex[0] = -this._weekOffset
      this._monthOfsetIndex[1] = -this._weekOffset

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

  private _calculateAutoRowEndLength = (length: number) => {
    let rows = Math.ceil(length / 7)

    const rowsMargin = this._datePickerAutoRow && rows < this._datePickerMaxRow ? this._datePickerMaxRow - rows : 0
    rows += rowsMargin

    return this._datePickerAutoRow ? rows * 7 - length : (rows + Math.ceil((this._datePickerMaxRow - rows) / 2)) * 7 - length
  }

  private _calculateAutoRowStartLength = (length: number) =>
    !this._datePickerAutoRow ? 0 : Math.floor((this._datePickerMaxRow - Math.ceil(length / 7)) / 2) * 7

  private _getLocale = (year: number) => this._locale(year)

  private _forceUpdate = (date?: string) => {
    this._days = this._calculateDays(date)
    this._tiggerUpdate(DatePickerEvents.changeDate)
  }

  private _updateChangeDay = (date: string) => {
    this.isLoading = false

    if (!this._selectedDate) {
      this._selectedDate = date
      this._state = 'selecting'
    } else if (this._selectedDate) {
      this._selectedEndDate = date
      this._state = 'rendered'
    }

    this._tiggerUpdate(DatePickerEvents.calculateDays)
  }

  private _getYear = () => getFullYear(this._getSelectedDate())

  private _updateDate = (date: string) => {
    this._renderedDate = date

    this._forceUpdate()
  }

  public getDaysArray = (monthSate: DatePickerMonthState = 'current') => {
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

  public getEndDate = () => {
    if (!this._selectedEndDate) return ''
    const selectedDate = this._dateFormatter(this._selectedEndDate)
    return `${getFullYear(selectedDate)}-${addZero(getMonth(selectedDate))}-${addZero(getDate(selectedDate))}`
  }

  public isSelectedDay = (date: string) => this._selectedDate === date || this._selectedEndDate === date
  public getSelectedEndDate = () => this._selectedEndDate && this._dateFormatter(this._selectedEndDate)


  public getSelecteDateUnformated = () => this._selectedDate
  public getSelecteEndDateUnformated = () => this._selectedEndDate
  public getRenderedDateUnformated = () => this._renderedDate

  public getRenderedMonth = () => getMonth(this._getRenderedDate())
  public getRenderedMonthName = () => this._getLocale(this._getYear()).months[this._calculateMonthOfDate<keyof MonthsProps>(this._getRenderedDate())].name
  public getRenderedYear = () => getFullYear(this._getRenderedDate())

  public getRenderedNextMonth = () => getMonth(this._nextMonthDate())
  public getRenderedNextMonthName = () => this._getLocale(getFullYear(this._nextMonthDate())).months[this._calculateMonthOfDate<keyof MonthsProps>(this._nextMonthDate())].name
  public getRenderedNextDateYear = () => getFullYear(this._nextMonthDate())

  public getDayMonthOffset = (index: 0 | 1 = 0) => (this._monthOfsetIndex[index] + this._weekOffset) % 7

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

      // #Range Picker
      if (this._datePickerType === 'rangePicker') {
        const state = this._state

        if (this._selectedDate && this._selectedEndDate) {
          this._selectedEndDate = undefined
          this._hoveredDate = undefined
        }

        if (state === 'rendered' || createDate(this._selectedDate).getTime() > createDate(date).getTime()) {
          this._selectedDate = date
          this._state = 'selecting'

        } else if (state === 'selecting') {
          this._selectedEndDate = date
          this._state = 'rendered'
        }
      } else {
        this._selectedEndDate = undefined
        this._selectedDate = date
      }

      let updateDate = date

      if (this._normalized) {
        const renderedDate = this._calculateRenderedDate(date, this._normalized, this._twoSide, this._dateFormatter)
        updateDate = renderedDate
      }

      this._renderedDate = updateDate

      this._days = this._calculateDays(updateDate)
      this._events.emit(DatePickerEvents.changeDate, createDate(updateDate))

      if (!isCurrent && this._dayRenderType === 'fill') {
        if (this._selectedDate && !this._selectedEndDate && this._datePickerType === 'rangePicker') {
          this._selectedEndDate = date
        }
        this._updateChangeDay(date)
      }
    }
  }

  public changeMonth = (month: number, forceClosing = true) => {
    const formatedDate = this._dateFormatter(formatDate(createDate(this._renderedDate)))
    const difMonth = month - getMonth(formatedDate)

    const newDate = createDate(this._renderedDate)
    newDate.setMonth(newDate.getMonth() + difMonth)

    this._renderedDate = this._calculateRenderedDate(formatDate(newDate), this._normalized, this._twoSide, this._dateFormatter, true)

    if (forceClosing) this.mode = 'day'

    this._forceUpdate()
  }

  public changeYear = (year: number, forceClosing = true) => {
    const difYear = getFullYear(this._dateFormatter(this._renderedDate)) - year

    const newDate = createDate(this._renderedDate)
    newDate.setFullYear(getFullYear(this._renderedDate) - difYear)

    this._renderedDate = formatDate(newDate)

    if (forceClosing) this.mode = 'day'

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
    this.open = true
    this._forceLoadingStart()

    const newDate = formatDate(createDate())

    this._renderedDate = newDate
    this._selectedDate = newDate
    this._selectedEndDate = ''
    this._hoveredDate = ''

    this._forceLoadingEnd()
    this._tiggerUpdate(DatePickerEvents.calculateDays)
    this._tiggerUpdate(DatePickerEvents.changeDate)
  }

  public setOpen = (open: boolean) => {
    if (this.open !== open) {
      this.open = open

      this._events.emit(DatePickerEvents.changeOpen)
    }
  }

  public setMode = (mode: DatePickerMode) => {
    if (mode !== this.mode) {
      this.mode = mode

      this._events.emit(DatePickerEvents.changeMode)
    }
  }

  public onCellHover = (date: string) => {
    if (this._datePickerType === 'rangePicker' && this._state === 'selecting') {
      this._hoveredDate = date

      if (this._selectedDate) {
        if (this._selectedEndDate) {
          this._hoveredDate = undefined
          this._state = 'rendered'
        }

        this._tiggerUpdate(DatePickerEvents.changeDate)
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

  public setDate = (date: string) => {
    validateDate(date)

    this._selectedDate = date
    this._forceUpdate()
  }

  public setEndDate = (date: string) => {
    validateDate(date)

    this._selectedEndDate = date
    this._forceUpdate()
  }

  public getMode = () => this.mode
  public isOpen = () => this.open
  public isLoadingState = () => this.isLoading;
}

export {
  CustomDatePicker
}

export type {
  DatePickerLocale
}