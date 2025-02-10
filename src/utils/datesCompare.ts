
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