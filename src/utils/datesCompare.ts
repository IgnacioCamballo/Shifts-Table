
import { dateFromSavedData } from '@/utils/savedTimes'

export function GetBreakTime({ breakEntry, breakExit }: {
  breakEntry: Date,
  breakExit: Date
}) {
  let breakMinutes = 0
  let breakHours = 0

  const difMonth = breakExit.getMonth() !== breakEntry.getMonth()
  const daysInMonth = new Date(breakEntry.getFullYear(), breakEntry.getMonth() + 1, 0).getDate();
  const dayDiference = breakExit!.getDate() - breakEntry!.getDate()

  if (breakExit.getMinutes() < breakEntry.getMinutes()) {
    breakMinutes += (breakExit.getMinutes() + (60 - breakEntry.getMinutes()))
    breakHours -= 1
  } else {
    breakMinutes += (breakExit.getMinutes() - breakEntry.getMinutes())
  }

  if (dayDiference === 0) {
    breakHours += (breakExit.getHours() - breakEntry.getHours())
  } else {
    const hours = (
      (24 - breakEntry.getHours())
      + breakExit.getHours()
      + (difMonth ? 24 * ((daysInMonth - breakEntry.getDate()) + (breakExit.getDate() - 1)) : 24 * (dayDiference - 1))
    )
    breakHours += hours
  }

  return { breakMinutes, breakHours }
}

export function getWorkedTime({ entry, exit, breakEntry, breakExit }: {
  entry: Date,
  exit: Date,
  breakEntry: Date | null,
  breakExit: Date | null
}) {
  let workedHours = 0
  let workedMinutes = 0
  let hoursBreak = 0
  let minutesBreak = 0

  const difMonth = exit.getMonth() !== entry.getMonth()
  const daysInMonth = new Date(entry.getFullYear(), entry.getMonth() + 1, 0).getDate();
  const dayDiference = exit.getDate() - entry.getDate()

  if(breakEntry && breakExit) {
    const {breakHours, breakMinutes} = GetBreakTime({ breakEntry, breakExit })
    hoursBreak += breakHours
    minutesBreak += breakMinutes
  }

  if(exit.getMinutes() < entry.getMinutes()) {
    workedMinutes += (exit.getMinutes() + (60 - entry.getMinutes()))
    workedHours -= 1
  } else {
    workedMinutes += (exit.getMinutes() - entry.getMinutes())
  }
  
  if(breakEntry && breakExit) {
    const dif =  workedMinutes - minutesBreak 
    if(dif >= 0) {
      workedMinutes = dif
    } else { 
      workedMinutes = (60 + dif)
      workedHours -= 1
    }
  }

  if (dayDiference === 0) {
    workedHours += (exit.getHours() - entry.getHours() - hoursBreak)
  } else {
    const hours = (
      workedHours 
      +(24 - entry.getHours()) 
      + exit.getHours()
      - hoursBreak
      + (difMonth ? 24 * ((daysInMonth - entry.getDate()) + (exit.getDate() - 1)) : 24 * (dayDiference - 1))
    )
    workedHours = hours
  }

  return { workedHours, workedMinutes }
}

export function isSameDay({day1, day2} : {day1: Date | undefined | null, day2: Date | undefined | null}) {
  if (!day1 || !day2) {return false}

  const d1 = new Date(day1)
  const d2 = new Date(day2)
  if(
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  ) {return true} else {return false}
}

export function isSameDayHourMinute({day1, day2} : {day1: Date, day2: Date}) {
  const d1 = new Date(day1)
  const d2 = new Date(day2)
  if(
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate() &&
    d1.getHours() === d2.getHours() &&
    d1.getMinutes() === d2.getMinutes()
  ) {return true} else {return false}
}

//max default times the user can save for each field (entry, exit, break start, break end)
export const MAX_DEFAULT_TIMES = 6

/**
 * Minutes since midnight of a date, used to compare clock times ignoring the day.
 * @param date date to read the clock time from
 */
export function minutesOfDay(date: Date) {
  return date.getHours() * 60 + date.getMinutes()
}

/**
 * Sorts clock times from lowest to highest, drops repeated ones and keeps at most MAX_DEFAULT_TIMES.
 * @param times list of dates, only hours and minutes matter
 */
export function sortedUniqueTimes(times: Date[]) {
  const unique = times.filter((time, index) => times.findIndex(other => minutesOfDay(other) === minutesOfDay(time)) === index)
  return unique.sort((a, b) => minutesOfDay(a) - minutesOfDay(b)).slice(0, MAX_DEFAULT_TIMES)
}

/**
 * Converts a stored default time into the list format. Accounts saved before the list existed
 * keep a single date (or its ISO string), so a single value becomes a list of one.
 * @param value null, a date, an ISO string or a list of them
 * @returns the sorted list, or null when there is no valid time
 */
export function toDefaultTimes(value: unknown, timeFormat?: number) {
  if (value === null || value === undefined) return null

  const list = Array.isArray(value) ? value : [value]
  const dates = list.map(item => dateFromSavedData(item as string | Date, timeFormat)).filter(date => !isNaN(date.getTime()))
  const times = sortedUniqueTimes(dates)

  return times.length > 0 ? times : null
}

/**
 * Parses the four default time fields of a stored or received configInfo, whatever format they have.
 * @param config configInfo as it was stored or received from the server
 */
export function parseConfigTimes(config: { entry?: unknown, exit?: unknown, configBreakEntry?: unknown, configBreakExit?: unknown }, timeFormat?: number) {
  return {
    entry: toDefaultTimes(config.entry, timeFormat),
    exit: toDefaultTimes(config.exit, timeFormat),
    configBreakEntry: toDefaultTimes(config.configBreakEntry, timeFormat),
    configBreakExit: toDefaultTimes(config.configBreakExit, timeFormat)
  }
}

/**
 * Puts the hours and minutes of `time` on the day of `day`.
 */
export function onDay(day: Date, time: Date) {
  return new Date(day.getFullYear(), day.getMonth(), day.getDate(), time.getHours(), time.getMinutes())
}

/**
 * Puts the clock time of `time` on the day of `reference`, and on the next day if that is before `reference`.
 */
export function afterOrSame(reference: Date, time: Date) {
  const sameDay = onDay(reference, time)
  return sameDay < reference ? new Date(sameDay.getFullYear(), sameDay.getMonth(), sameDay.getDate() + 1, sameDay.getHours(), sameDay.getMinutes()) : sameDay
}

/**
 * Rearranges the times of a shift so they are consistent whatever order the user picked them in:
 * the entry always belongs to the shift day, the exit and the break go after the entry (the next day if
 * their clock time is earlier) and a break that ends up outside the shift is removed.
 * @param pressedDate day the shift is being created or edited on
 */
export function normalizeShiftTimes({ pressedDate, entry, exit, breakEntry, breakExit }: {
  pressedDate: Date,
  entry: Date | null,
  exit: Date | null,
  breakEntry: Date | null,
  breakExit: Date | null
}) {
  const normalizedEntry = entry ? onDay(pressedDate, entry) : null
  const normalizedExit = exit && normalizedEntry ? afterOrSame(normalizedEntry, exit) : exit
  let normalizedBreakEntry = breakEntry && normalizedEntry ? afterOrSame(normalizedEntry, breakEntry) : breakEntry
  const breakExitReference = normalizedBreakEntry || normalizedEntry
  let normalizedBreakExit = breakExit && breakExitReference ? afterOrSame(breakExitReference, breakExit) : breakExit

  const breakOutside = normalizedExit && (
    (normalizedBreakEntry && normalizedBreakEntry > normalizedExit) ||
    (normalizedBreakExit && normalizedBreakExit > normalizedExit)
  )
  if (breakOutside) {
    normalizedBreakEntry = null
    normalizedBreakExit = null
  }

  return { entry: normalizedEntry, exit: normalizedExit, breakEntry: normalizedBreakEntry, breakExit: normalizedBreakExit }
}
