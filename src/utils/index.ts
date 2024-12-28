import trans from "../lenguages/lenguages.json"

//returns list of days of the week starting on monday
export function weekdays(lenguage: string) {
  const weekdaysArray = [...Array(7).keys()]
  const intlWeekDay = new Intl.DateTimeFormat(lenguage, {weekday: "short"})
  const weekDays = weekdaysArray.map(weekDayIndex => {
    const weekDayName = intlWeekDay.format(new Date(2021, 10, weekDayIndex +1))
    return weekDayName
  })
  return weekDays
}

//returns minutes with two digits
export function formattedMinutes(date: Date) {
  const minutes = date.getMinutes()
  const formatted = minutes.toString().padStart(2, '0')
  return formatted
}

//if you give minutes returns a string with two digits
export function formattedMinutesNumber(minutes: number) {
  const formatted = minutes.toString().padStart(2, '0')
  return formatted
}

//transforms the first letter to uppercase
export function firstLetterUpper(text: string) {
  const result = text.replace(text[0], text[0].toUpperCase())
  return result
}

//returns list of days with first letter un uppercase starting sunday
export function textDay(date: Date, lenguage: string) {
  const weekdaysArray = [...Array(7).keys()]
  const intlWeekDay = new Intl.DateTimeFormat(lenguage, { weekday: "short" })
  const weekDays = weekdaysArray.map(weekDayIndex => {
    const weekDayName = intlWeekDay.format(new Date(2021, 10, weekDayIndex))
    return weekDayName
  })
  const day = firstLetterUpper(weekDays[date!.getDay()])

  return (day)
}

export function translate({text, lenguage}:{text: string, lenguage: string}) {

  const words: {[key: string]: {lenguage: string; text: string}[]} = trans
  const object: {lenguage: string; text: string}[] = words[text]
  return object.find((i: { lenguage: string; }) => i.lenguage === lenguage)?.text
}