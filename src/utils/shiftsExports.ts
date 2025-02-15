import * as Print from "expo-print"
import * as Sharing from "expo-sharing"
import * as FileSystem from "expo-file-system";

import { firstLetterUpper, formattedMinutes, formattedMinutesNumber, translate } from "@/utils";
import { ShiftProps } from "@/types"

export function createTable(shiftsList: ShiftProps[], lenguage: string) {
  function translateFn(text: string) {
    return translate({ text, lenguage })
  }

  function findWorkedHours() {
    let initialHours = 0
    const totalMinutes = shiftsList.reduce((total, shift) => {
      const sum = total + (shift.workedMinutes || 0);
      if (sum >= 60) {
        initialHours += 1
        return (sum - 60)
      } else {
        return sum
      }
    }, 0);
    const totalHours = shiftsList.reduce((total, shift) => {
      return total + (shift.workedHours || 0);
    }, initialHours);
    return (`${totalMinutes === 0 ? totalHours : (totalHours + totalMinutes / 60).toFixed(2)}`);
  }

  const htmlContent = `
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; width: auto; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: center; }
          th { background-color: #3C819A; color: white; }
          h2 { text-align: center; }
          h6 { text-align: center; font-weight: 300; }
        </style>
      </head>
      <body>
        <h2>${firstLetterUpper(shiftsList[0].shiftEntry.toLocaleDateString(lenguage, { month: 'long' }))}  ${shiftsList[0].shiftEntry.toLocaleDateString(lenguage, { year: 'numeric' })}</h2>
        <table>
          <tr>
            <th>${translateFn("day")}</th>
            <th>${translateFn("entry")}</th>
            <th>${translateFn("exit")}</th>
            <th>${translateFn("break")}</th>
            <th>${translateFn("total")}</th>
          </tr>
          ${shiftsList
            .map(
              (day) => `
              <tr>
                <td>${day.shiftEntry.getDate()}</td>
                <td>${day.shiftEntry.getHours()}:${formattedMinutes(day.shiftEntry)}</td>
                <td>${day.shiftExit!.getHours()}:${formattedMinutes(day.shiftExit!)}</td>
                <td>${day.shiftBreak ? `${day.shiftBreak.getHours()}:${formattedMinutes(day.shiftBreak)}` : "-"}</td>
                <td>${day.workedHours}:${formattedMinutesNumber(day.workedMinutes)}</td>
              </tr>
            `
            )
            .join("")
          }
          <tr>
            <td></td>
            <td></td>
            <td></td>
            <td>${translateFn("totalHours")}:</td>
            <td>${findWorkedHours()}Hs</td>
          </tr>
        </table>
        <h6>${translateFn("createdFrom")}</h6>
      </body>
    </html>
  `
  return htmlContent
}

export async function exportPDF(shiftsList: ShiftProps[], lenguage: string, newUri: string) {
  function translateFn(text: string) {
    return translate({ text, lenguage })
  }
  
  const htmlContent = createTable(shiftsList, lenguage)

  // Creates the PDF
  const { uri } = await Print.printToFileAsync({ html: htmlContent });

  await FileSystem.moveAsync({
    from: uri,
    to: newUri,
  });

  // If posible shares the PDF
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(newUri);
  } else {
    alert(translateFn("noShareAlert"));
  }
}

export function exportExcel(shiftsList: ShiftProps[]) {

}
