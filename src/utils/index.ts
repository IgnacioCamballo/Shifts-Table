export function formattedMinutes (date: Date) {
    const minutes = date.getMinutes()
    const formatted = minutes.toString().padStart(2, '0')
    return formatted
}

export function firstLetterUpper (text: string) {
    const result = text.replace(text[0], text[0].toUpperCase())
    return result
}