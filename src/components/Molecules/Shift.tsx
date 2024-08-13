import React from 'react'
import { View, Text, StyleSheet, Alert } from 'react-native'
import theme from '../../theme/theme'
import { ShiftProps } from '../../types'
import useCalendar from '../../hooks/useCalendar'
import { firstLetterUpper, formattedMinutes, formattedMinutesNumber, textDay } from '../../utils'
import Slider from '../Atoms/Slider'
import EditDeletButtons from './EditDeletButtons'
import translations from "../../lenguages/lenguages.json"

export default function Shift({shift}: {shift: ShiftProps}) {
  const {shifts, setShifts, lenguage} = useCalendar()

  const {key, employer, paid, shiftEntry, shiftExit, shiftBreak, workedHours, workedMinutes} = shift

  const showAlert = () => {
    Alert.alert(
      '',
      translations.shiftDeleteAlert.find(i => i.lenguage === lenguage)?.text,
      [
        {
          text: translations.cancel.find(i => i.lenguage === lenguage)?.text,
          style: 'cancel'
        },
        {
          text: 'OK',
          onPress: () => handleDeleteShift(),
          style: 'cancel'
        },
      ],
      {
        cancelable: true
      }
    )
  }

  const handleDeleteShift = () => {
    const filtered = shifts.filter(shift => shift.key !== key)
    setShifts(filtered)
  }

  const setPaid = (value: boolean) => {
    const shiftIndex = shifts.findIndex(shift => shift.key === key)
    const editedShift = {
      ...shift, paid: value
    }
    const updatedShifts = [...shifts]
    updatedShifts.splice(shiftIndex, 1, editedShift)
    setShifts(updatedShifts)
  }

  return (
    <View style={styles.empleador}>
      <View style={styles.line}>
        <Text style={styles.textLine}>{translations.employer.find(i => i.lenguage === lenguage)?.text}:</Text>
        <Text style={styles.textLine}>{employer}</Text>
      </View>

      <View style={styles.line}>
        <Text style={styles.textLine}>{translations.entry.find(i => i.lenguage === lenguage)?.text}:</Text>
        <Text style={styles.textLine}>{shiftEntry ? `${shiftEntry.getHours()}:${formattedMinutes(shiftEntry)}` : "-"}</Text>
      </View>

      <View style={styles.line}>
        <Text style={styles.textLine}>{translations.exit.find(i => i.lenguage === lenguage)?.text}:</Text>
        <Text style={styles.textLine}>
          {shiftExit && shiftEntry ?
            (shiftExit?.getDate() !== shiftEntry?.getDate() ? 
            `${firstLetterUpper(shiftExit!.toLocaleDateString(lenguage, {month: 'short'}))} ${shiftExit?.getDate()} (${textDay(shiftExit, lenguage)})  ` : "") 
            : ""
          }
          {shiftExit ? `${shiftExit.getHours()}:${formattedMinutes(shiftExit)}` : "-"}
        </Text>      
      </View>

      <View style={styles.line}>
        <Text style={styles.textLine}>{translations.break.find(i => i.lenguage === lenguage)?.text}:</Text>
        <Text style={styles.textLine}>{shiftBreak ? `${shiftBreak.getHours()}:${formattedMinutes(shiftBreak)}` : "0"}</Text>
      </View>

      <View style={styles.line}>
        <Text style={styles.textLine}>{translations.workedHours.find(i => i.lenguage === lenguage)?.text}:</Text>
        <Text style={styles.textLine}>{workedHours !== null && workedMinutes !== null ? `${workedHours}:${formattedMinutesNumber(workedMinutes!)}` : "-"}</Text>
      </View>

      <View style={styles.line}>
        <View style={styles.contPago}>
          <Text style={styles.textLine}>{translations.paid.find(i => i.lenguage === lenguage)?.text}:</Text>
          <Slider setValue={setPaid} value={paid}/>
        </View>

        <EditDeletButtons 
          DeleteAlert={showAlert} 
          link={`/calendar/shifts/${new Date(shiftEntry.getFullYear(), shiftEntry.getMonth(), shiftEntry.getDate())}/editShift/${key}`}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
    empleador: {
      borderTopWidth: 2,
    },
    line: {
      paddingHorizontal: 15,
      paddingVertical: 4,
      flexDirection: "row",
      justifyContent: 'space-between',
      alignItems: "center",
      borderBottomWidth: 1,
      borderColor: theme.colors.grisClaro
    },
    textLine: {
      fontSize: theme.fontSizes.F20,
      fontWeight: '400'
    },
    contPago: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10
    },
    color: {
      width: 20,
      height: 20,
      position: "relative",
      top: 3
    }
})