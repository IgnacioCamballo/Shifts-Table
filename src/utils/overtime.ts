import { OvertimeRateType } from '@/types'
import { GetBreakTime } from '@/utils/datesCompare'

//overtime pay used when the employer has none: a percentage of the hourly wage (150 = 1.5 times the wage)
export const DEFAULT_OVERTIME_RATE_TYPE: OvertimeRateType = "percent"
export const DEFAULT_OVERTIME_RATE = 150

/**
 * Time between the start and the end of the overtime.
 * @param overtimeEntry when the overtime starts
 * @param overtimeExit when the overtime ends, it goes after the start (the form keeps it that way)
 * @returns hours and minutes of overtime, or null when one of the two times is missing or the end is before the start
 */
export function getOvertimeTime({ overtimeEntry, overtimeExit }: {
  overtimeEntry: Date | null,
  overtimeExit: Date | null
}) {
  if (!overtimeEntry || !overtimeExit) return null

  const { breakHours, breakMinutes } = GetBreakTime({ breakEntry: overtimeEntry, breakExit: overtimeExit })
  if (breakHours < 0) return null

  return { overtimeHours: breakHours, overtimeMinutes: breakMinutes }
}

/**
 * Sum of the base hours (entry to exit minus break) and the overtime hours.
 * @returns the total hours and minutes (minutes always under 60), or null when there are neither base nor overtime hours
 */
export function getTotalHours({ workedHours, workedMinutes, overtimeHours, overtimeMinutes }: {
  workedHours: number | null,
  workedMinutes: number | null,
  overtimeHours: number | null,
  overtimeMinutes: number | null
}) {
  const hasWorked = workedHours !== null && workedMinutes !== null
  const hasOvertime = overtimeHours !== null && overtimeMinutes !== null
  if (!hasWorked && !hasOvertime) return null

  const totalInMinutes = (hasWorked ? workedHours * 60 + workedMinutes : 0) + (hasOvertime ? overtimeHours * 60 + overtimeMinutes : 0)
  return { totalHours: Math.floor(totalInMinutes / 60), totalMinutes: totalInMinutes % 60 }
}

/**
 * What one overtime hour is paid.
 * @param wage hourly wage of the shift
 * @param overtimeRateType "amount" is a fixed amount per hour, "percent" is a percentage of the wage (150 = 1.5 times)
 * @param overtimeRate the amount or the percentage, depending on the type
 */
export function getOvertimeHourPay({ wage, overtimeRateType, overtimeRate }: {
  wage: number,
  overtimeRateType: OvertimeRateType,
  overtimeRate: number
}) {
  return overtimeRateType === "percent" ? wage * overtimeRate / 100 : overtimeRate
}

/**
 * Salary of a shift paid by the hour: the worked hours at the wage plus the overtime hours at the overtime pay.
 * A shift with a fixed salary does not use this: its salary is what the user writes, overtime or not.
 * @returns the normal salary, the overtime salary and their sum
 */
export function calculateShiftSalary({ workedHours, workedMinutes, wage, overtimeHours, overtimeMinutes, overtimeRateType, overtimeRate }: {
  workedHours: number | null,
  workedMinutes: number | null,
  wage: number,
  overtimeHours: number | null,
  overtimeMinutes: number | null,
  overtimeRateType: OvertimeRateType,
  overtimeRate: number
}) {
  const regularSalary = workedHours !== null && workedMinutes !== null ? (workedHours + workedMinutes / 60) * wage : 0
  const overtimeSalary = overtimeHours !== null && overtimeMinutes !== null
    ? (overtimeHours + overtimeMinutes / 60) * getOvertimeHourPay({ wage, overtimeRateType, overtimeRate })
    : 0

  return { regularSalary, overtimeSalary, totalSalary: regularSalary + overtimeSalary }
}
