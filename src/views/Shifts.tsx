import React, { useState } from 'react'
import { Animated, Dimensions, ScrollView, StyleSheet, View} from 'react-native'
import { useParams } from 'react-router-native'
import { ShiftProps } from '../types'
import { firstLetterUpper, textDay } from '../utils'
import theme from '../theme/theme'
import useCalendar from '../hooks/useCalendar'
import Boton from '../components/Boton'
import Shift from '../components/Shift'
import SwiftArrows from '../components/SwiftArrows'
import TransparentButton from '../components/TransparentButton'

export default function Shifts() {
  const params = useParams()
  const pressedDate = params.date!

  const {shifts, setShifts} = useCalendar()

  let screenWidth = Dimensions.get("window").width
  let lenguage = "es"

  const [date, setDate] = useState(new Date(pressedDate))

  const prevDay = () => {
    const newDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() - 1);
    setDate(newDate)
  };
  
  const nextDay = () => {
    const newDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
    setDate(newDate)
  };

  return (
    <View style={styles.container}>
      <TransparentButton 
        style={styles.link} 
        link='/' 
        nameIconLeft="doubleleft" 
        text="Atras"
      />

      <SwiftArrows 
        leftAction={prevDay} 
        text={`${firstLetterUpper(date.toLocaleDateString('es-ES', {month: 'short'}))} / ${date.toLocaleDateString('es-ES', {day:"numeric"})} (${textDay(date)})`}
        rightAction={nextDay} 
      />

      <Boton margintop={12} block={false} press={() => {}} to={`/calendar/shifts/${date}/newShift`} text="Registrar Turno" color={theme.colors.verdeBoton}/>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
        {shifts.length === 0 ? <View></View> : 
          shifts.filter(shift => shift.shiftEntry.getFullYear() === date.getFullYear() && shift.shiftEntry.getMonth() === date.getMonth() && shift.shiftEntry.getDate() === date.getDate())
          .map(
            (mapedShift: ShiftProps) => <Shift shift={mapedShift} key={mapedShift.key}/>
          )
        }
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10  
  },
  scrollView: {
    maxHeight: theme.heigth.shiftScrollView,
    marginTop: 16
  },
  link: {
    position: "absolute",
    top: -32,
    left: 12
  }
})