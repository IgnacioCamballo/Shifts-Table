import React, { useState } from 'react'
import { Text, ScrollView, StyleSheet, View} from 'react-native'
import { useParams } from 'react-router-native'
import { ShiftProps } from '../types'
import { firstLetterUpper, textDay } from '../utils'
import theme from '../theme/theme'
import useCalendar from '../hooks/useCalendar'
import Shift from '../components/Molecules/Shift'
import SwiftArrows from '../components/Molecules/SwiftArrows'
import Icon from 'react-native-vector-icons/AntDesign'
import TransparentButton from '../components/Atoms/Buttons/ButtonTransparent'
import Button from '../components/Atoms/Buttons/Button'

export default function Shifts() {
  const params = useParams()
  const pressedDate = params.date!

  const {shifts} = useCalendar()

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
      <TransparentButton link="/" style={styles.link}>
        <Icon 
          name="doubleleft" 
          color={theme.colors.negro} 
          size={17}
        />
        <Text style={styles.textLine}>Atras</Text>
      </TransparentButton>

      <SwiftArrows 
        leftAction={prevDay} 
        text={`${firstLetterUpper(date.toLocaleDateString('es-ES', {month: 'short'}))} / ${date.toLocaleDateString('es-ES', {day:"numeric"})} (${textDay(date)})`}
        rightAction={nextDay} 
      />

      <Button margintop={12} to={`/calendar/shifts/${date}/newShift`} color={theme.colors.verdeBoton}>
        <Text style={styles.textoBoton}>Registrar Turno</Text>
      </Button>

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
  },
  textoBoton: {
    fontSize: theme.fontSizes.F18,
    fontWeight: "500"    
  },
  textLine: {
    fontSize: theme.fontSizes.F18,
    fontWeight: '500'
  }
})