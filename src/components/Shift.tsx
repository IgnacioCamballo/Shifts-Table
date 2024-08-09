import React from 'react'
import { View, Text, StyleSheet, Alert } from 'react-native'
import Icon from "react-native-vector-icons/AntDesign"
import theme from '../theme/theme'
import { ShiftProps } from '../types'
import useCalendar from '../hooks/useCalendar'
import { Link } from 'react-router-native'
import { firstLetterUpper, formattedMinutes, formattedMinutesNumber, textDay } from '../utils'
import Slider from './Slider'

export default function Shift({shift}: {shift: ShiftProps}) {
  const {shifts, setShifts} = useCalendar()

  const {key, employer, paid, shiftEntry, shiftExit, shiftBreak, workedHours, workedMinutes} = shift

  const showAlert = () => {
    Alert.alert(
      '',
      "¿seguro deseas eliminar este turno?",
      [
        {
          text: 'Cancel',
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
        <Text style={styles.textLine}>Empleador:</Text>
        <Text style={styles.textLine}>{employer}</Text>
      </View>

      <View style={styles.line}>
        <Text style={styles.textLine}>Entrada:</Text>
        <Text style={styles.textLine}>{shiftEntry ? `${shiftEntry.getHours()}:${formattedMinutes(shiftEntry)}` : "-"}</Text>
      </View>

      <View style={styles.line}>
        <Text style={styles.textLine}>Salida:</Text>
        <Text style={styles.textLine}>
          {shiftExit && shiftEntry ?
            (shiftExit?.getDate() !== shiftEntry?.getDate() ? 
            `${firstLetterUpper(shiftExit!.toLocaleDateString('es-ES', {month: 'short'}))} ${shiftExit?.getDate()} (${textDay(shiftExit)})  ` : "") 
            : ""
          }
          {shiftExit ? `${shiftExit.getHours()}:${formattedMinutes(shiftExit)}` : "-"}
        </Text>      
      </View>

      <View style={styles.line}>
        <Text style={styles.textLine}>Descanso:</Text>
        <Text style={styles.textLine}>{shiftBreak ? `${shiftBreak.getHours()}:${formattedMinutes(shiftBreak)}` : "0"}</Text>
      </View>

      <View style={styles.line}>
        <Text style={styles.textLine}>Horas trabajadas:</Text>
        <Text style={styles.textLine}>{workedHours !== null && workedMinutes !== null ? `${workedHours}:${formattedMinutesNumber(workedMinutes!)}` : "-"}</Text>
      </View>

      <View style={styles.line}>
        <View style={styles.contPago}>
          <Text style={styles.textLine}>Pago:</Text>
          <Slider setValue={setPaid} value={paid}/>
        </View>
        <View style={styles.botones}>
          <Link 
            to={`/calendar/shifts/${new Date(shiftEntry.getFullYear(), shiftEntry.getMonth(), shiftEntry.getDate())}/editShift/${key}`} 
            activeOpacity={0.7}
            underlayColor={"none"}
          >
            <Icon
              name='edit' 
              color={theme.colors.verdeOscuro} 
              size={20}
              />
          </Link>
          <Icon 
            name='delete' 
            color={theme.colors.rojoBin} 
            size={20}
            onPress={() => showAlert()}
          />
        </View>
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
    },
    botones: {
      flexDirection: "row",
      gap: 20
    }
})