const datePattern = /^\d{4}-[01]\d-[0-3]\d$/

export const validateDate = (date: string) => {
  if (!date.match(datePattern) && date) {
    throw new Error('Invalid Date Format, only YYYY-MM-DD date format is allowed.')
  }
}

export const isValidDateFormat = (date: any): boolean => Boolean(typeof date === 'string' && date.match(datePattern) && !isNaN(new Date(date).getTime()))

export const formatDate = (date?: Date) => {
  if (!date) return ''

  const isoDate = date.toISOString()

  return isoDate.slice(0, isoDate.indexOf('T'))
}

export const getFullYear = (date: string): number => {
  validateDate(date)

  return Number(date.slice(0, 4))
}

export const getMonth = (date: string): number => {
  validateDate(date)

  return Number(date.slice(date.indexOf('-') + 1, date.lastIndexOf('-')))
}

export const getDate = (date: string): number => {
  validateDate(date)

  return Number(date.slice(date.lastIndexOf('-') + 1))
}

export const addZero = (number: number): string => number < 10 ? (`0${number}`) : number.toString()

// create date base on timezone
export const createDate = (date?: string) => {
  date && validateDate(date)

  const newDate = new Date(date || new Date())
  return new Date(new Date(newDate.getTime() - newDate.getTimezoneOffset() * 60000).toISOString())
}