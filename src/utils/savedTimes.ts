import { ConfigInfo, EmployerProps, ShiftProps } from '@/types'

/**
 * How the times of shifts and default times are saved (phone storage and server):
 * 1 = real moments in time, so the clock time changed when the phone changed time zone
 * 2 = clock time kept as the user wrote it (8:00 is always 8:00, wherever the phone is)
 */
export const CURRENT_TIME_FORMAT = 2

/**
 * Prepares a date to be saved keeping its clock time: 8:00 on screen is saved as ...T08:00:00.000Z.
 * Without this, saving writes the real moment and the hour changes when the phone changes time zone.
 * @param date date as the app shows it (local clock time)
 * @returns a date that is saved with the same hours and minutes the user sees
 */
export function clockTimeForSaving(date: Date) {
  return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes()))
}

/**
 * Reads a date saved with clockTimeForSaving and gives it back with the same clock time, in any time zone.
 * @param value saved text (or date) like 2026-03-10T08:00:00.000Z
 * @returns a local date that shows 8:00
 */
export function clockTimeFromSaved(value: string | Date) {
  const saved = new Date(value)
  return new Date(saved.getUTCFullYear(), saved.getUTCMonth(), saved.getUTCDate(), saved.getUTCHours(), saved.getUTCMinutes())
}

/**
 * Reads a saved date the right way for the format it was saved with.
 * @param value saved text (or date)
 * @param timeFormat format of the saved data, data saved before it existed has none and counts as format 1
 */
export function dateFromSavedData(value: string | Date, timeFormat?: number) {
  return timeFormat === CURRENT_TIME_FORMAT ? clockTimeFromSaved(value) : new Date(value)
}

/**
 * Prepares the shifts to be saved keeping the clock time of every date.
 * @param shifts shifts as the app uses them
 */
export function shiftsForSaving(shifts: ShiftProps[]): ShiftProps[] {
  return shifts.map(shift => ({
    ...shift,
    shiftEntry: clockTimeForSaving(shift.shiftEntry),
    shiftExit: shift.shiftExit ? clockTimeForSaving(shift.shiftExit) : null,
    shiftBreak: shift.shiftBreak ? clockTimeForSaving(shift.shiftBreak) : null,
    shiftBreakEntry: shift.shiftBreakEntry ? clockTimeForSaving(shift.shiftBreakEntry) : null,
    shiftBreakExit: shift.shiftBreakExit ? clockTimeForSaving(shift.shiftBreakExit) : null,
    overtimeEntry: shift.overtimeEntry ? clockTimeForSaving(shift.overtimeEntry) : null,
    overtimeExit: shift.overtimeExit ? clockTimeForSaving(shift.overtimeExit) : null
  }))
}

/**
 * Turns saved shifts (phone storage or server) into the shifts the app uses, with real dates.
 * @param savedShifts shifts as they were saved
 * @param employers employers of the user, used to fill the wage of old shifts that have none
 * @param timeFormat format of the saved data (see CURRENT_TIME_FORMAT)
 */
export function shiftsFromSaved(savedShifts: ShiftProps[], employers: EmployerProps[], timeFormat?: number): ShiftProps[] {
  return savedShifts.map(shift => ({
    key: shift.key,
    employer: shift.employer,
    short: shift.short,
    shiftEntry: dateFromSavedData(shift.shiftEntry, timeFormat),
    shiftExit: shift.shiftExit ? dateFromSavedData(shift.shiftExit, timeFormat) : null,
    shiftBreak: shift.shiftBreak ? dateFromSavedData(shift.shiftBreak, timeFormat) : null,
    shiftBreakEntry: shift.shiftBreakEntry ? dateFromSavedData(shift.shiftBreakEntry, timeFormat) : null,
    shiftBreakExit: shift.shiftBreakExit ? dateFromSavedData(shift.shiftBreakExit, timeFormat) : null,
    overtimeEntry: shift.overtimeEntry ? dateFromSavedData(shift.overtimeEntry, timeFormat) : null,
    overtimeExit: shift.overtimeExit ? dateFromSavedData(shift.overtimeExit, timeFormat) : null,
    overtimeHours: shift.overtimeHours ?? null,
    overtimeMinutes: shift.overtimeMinutes ?? null,
    overtimeRateType: shift.overtimeRateType,
    overtimeRate: shift.overtimeRate,
    workedHours: shift.workedHours,
    workedMinutes: shift.workedMinutes,
    isHourlyRate: shift.isHourlyRate === false ? false : true,
    wage: shift.wage || employers.find(company => company.key === shift.employer)?.wage || 0,
    paid: shift.paid,
    salary: shift.salary,
    note: shift.note,
    color: shift.color
  }))
}

/**
 * Prepares the settings to be saved keeping the clock time of the default times.
 * @param configInfo settings as the app uses them
 */
export function configForSaving(configInfo: ConfigInfo): ConfigInfo {
  const timesForSaving = (times: Date[] | null) => times ? times.map(clockTimeForSaving) : null

  return {
    ...configInfo,
    entry: timesForSaving(configInfo.entry),
    exit: timesForSaving(configInfo.exit),
    configBreakEntry: timesForSaving(configInfo.configBreakEntry),
    configBreakExit: timesForSaving(configInfo.configBreakExit)
  }
}
