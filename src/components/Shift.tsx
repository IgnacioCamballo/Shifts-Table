import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import Icon from "react-native-vector-icons/AntDesign"
import theme from '../theme'
import { ShiftProps } from '../types'
import useCalendar from '../hooks/useCalendar'
import { Link } from 'react-router-native'
import { firstLetterUpper, formattedMinutes, formattedMinutesNumber, textDay } from '../utils'

export default function Shift({shift}: {shift: ShiftProps}) {
  const {companysInfo, setCompanysInfo, setEditEmployer} = useCalendar()

  const {employer, paid, shiftEntry, shiftExit, shiftBreak, workedHours, workedMinutes} = shift

  // const handleDeleteShift = () => {
  //   const filtered = companysInfo.filter(employer => employer.name !== name)
  //   setCompanysInfo(filtered)
  // }

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
        <View style={styles.contColor}>
          <Text style={styles.textLine}>Pago:</Text>
          <Text>
           
          </Text>
        </View>
        <View style={styles.botones}>
          {/* <Link 
            to={`/config/editEmployer/${companysInfo.findIndex(employer => employer.name === name)}`} 
            onPress={() => setEditEmployer(employer)}
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
            onPress={() => handleDeleteEmployer()}
          /> */}
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
    contColor: {
      flexDirection: "row",
      alignItems: "baseline",
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