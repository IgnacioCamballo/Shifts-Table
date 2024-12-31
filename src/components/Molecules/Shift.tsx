import React from 'react'
import { View, Text, StyleSheet, Alert } from 'react-native'
import theme from '../../theme/theme'
import { ShiftProps } from '../../types'
import useCalendar from '../../hooks/useCalendar'
import { firstLetterUpper, formattedMinutes, formattedMinutesNumber, textDay, translate } from '../../utils'
import Slider from '../Atoms/Slider'
import EditDeletButtons from './EditDeletButtons'

export default function Shift({shift}: {shift: ShiftProps}) {
  const {shifts, companysInfo, setShifts, lenguage} = useCalendar()

  //this way avoid of calling useCalendar in utils and translate can be used inside if functions
  function translateFn(text:string){
    return translate({text, lenguage})
  }

  const {key, employer, paid, shiftEntry, shiftExit, shiftBreak, workedHours, workedMinutes, salary} = shift

  const showAlert = () => {
    Alert.alert(
      '',
      translateFn("shiftDeleteAlert"),
      [
        {
          text: translateFn("cancel"),
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
        <Text style={styles.textLine}>{translateFn("employer")}:</Text>
        <Text style={styles.textLine}>{companysInfo.find(emp => emp.key === employer)?.name}</Text>
      </View>

      <View style={styles.line}>
        <Text style={styles.textLine}>{translateFn("entry")}:</Text>
        <Text style={styles.textLine}>{shiftEntry ? `${shiftEntry.getHours()}:${formattedMinutes(shiftEntry)}` : "-"}</Text>
      </View>

      <View style={styles.line}>
        <Text style={styles.textLine}>{translateFn("exit")}:</Text>
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
        <Text style={styles.textLine}>{translateFn("break")}:</Text>
        <Text style={styles.textLine}>{shiftBreak ? `${shiftBreak.getHours()}:${formattedMinutes(shiftBreak)}` : "0"}</Text>
      </View>

      <View style={styles.line}>
        <Text style={styles.textLine}>{translateFn("workedHours")}:</Text>
        <Text style={styles.textLine}>{workedHours !== null && workedMinutes !== null ? `${workedHours}:${formattedMinutesNumber(workedMinutes!)}` : "-"}</Text>
      </View>
      
      <View style={styles.line}>
        <Text style={styles.textLine}>{translateFn("shiftSalary")}:</Text>
        <Text style={styles.textLine}>{salary && `$ ${Math.floor(salary! * 100)/ 100}`}</Text>
      </View>

      <View style={styles.line}>
        <View style={styles.contPago}>
          <Text style={styles.textLine}>{translateFn("paid")}:</Text>
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