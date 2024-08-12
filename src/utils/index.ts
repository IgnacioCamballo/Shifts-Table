
export const weekdays = (lenguage: string) => {
  const weekdaysArray = [...Array(7).keys()]
  const intlWeekDay = new Intl.DateTimeFormat(lenguage, {weekday: "short"})
  const weekDays = weekdaysArray.map(weekDayIndex => {
    const weekDayName = intlWeekDay.format(new Date(2021, 10, weekDayIndex +1))
    return weekDayName
  })
  return weekDays
}

export function formattedMinutes(date: Date) {
  const minutes = date.getMinutes()
  const formatted = minutes.toString().padStart(2, '0')
  return formatted
}

export function formattedMinutesNumber(minutes: number) {
  const formatted = minutes.toString().padStart(2, '0')
  return formatted
}

export function firstLetterUpper(text: string) {
  const result = text.replace(text[0], text[0].toUpperCase())
  return result
}

export function textDay(date: Date) {
  const weekdaysArray = [...Array(7).keys()]
  const intlWeekDay = new Intl.DateTimeFormat("es", { weekday: "short" })
  const weekDays = weekdaysArray.map(weekDayIndex => {
    const weekDayName = intlWeekDay.format(new Date(2021, 10, weekDayIndex))
    return weekDayName
  })
  const day = firstLetterUpper(weekDays[date!.getDay()])

  return (day)
}