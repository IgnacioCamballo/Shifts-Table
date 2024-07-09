export function formattedMinutes (date: Date) {
    const minutes = date.getMinutes()
    const formatted = minutes.toString().padStart(2, '0')
    return formatted
}
