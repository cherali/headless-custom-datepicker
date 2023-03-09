export type PickerMode = 'day' | 'month' | 'year'
export type PickerDayRenderType = 'fill' | 'space'

export type DaysStateTypes = 'prev' | 'next' | 'current'
export type PickerState = 'loading' | 'rendered' | 'selecting'
export type PickerMonthState = 'current' | 'next'

export interface Month {
  name: string;
  numberOfDays: number;
}

export interface MonthsProps {
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

export interface LocaleProps {
  months: MonthsProps;
}

export type DateFormatterFn = (date: string) => string

export type MonthListObject = Month & { monthNumber: number }
export type MonthListMap = [string, Month]

export type PickerLocale = (year: number) => LocaleProps

export interface Days {
  day: number;
  state: DaysStateTypes;
  date: string;
}

export enum PickerEvents {
  changeDate = 'change-date',
  changeMode = 'change-mode',
  calculateDays = 'calculate-days',
  changeOpen = 'change-open',
  changeState = 'change-state',
}