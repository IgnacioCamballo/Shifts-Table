import React, { useState } from 'react'
import { Animated, Dimensions, StyleSheet, Text, TouchableOpacity, View, ScrollView } from 'react-native'
import { useParams } from 'react-router-native'
import { ShiftProps } from '../types'
import { firstLetterUpper, textDay } from '../utils'
import BotonChico from '../components/BotonChico'
import theme from '../theme'
import useCalendar from '../hooks/useCalendar'
import Boton from '../components/Boton'
import Shift from '../components/Shift'

export default function Shifts() {
  const params = useParams()
  const pressedDate = params.date!

  const {shifts, setShifts} = useCalendar()

  let screenWidth = Dimensions.get("window").width
  let lenguage = "es"

  const [position, setPosition] = useState(new Animated.Value(0))
  const [date, setDate] = useState(new Date(pressedDate))

  const prevDay = () => {
      const newDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() - 1);
  
      Animated.timing(position, {
        toValue: screenWidth,
        duration: 100,
        useNativeDriver: false
      }).start(() => {
        setDate(newDate)
        Animated.timing(position, {
          toValue: -screenWidth,
          duration: 0,
          useNativeDriver: false
        }).start(() => {
          Animated.timing(position, {
            toValue: 0,
            duration: 200,
            useNativeDriver: false
          }).start()
        })
      })
    };
  
  const nextDay = () => {
    const newDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);

    Animated.timing(position, {
      toValue: -screenWidth,
      duration: 100,
      useNativeDriver: false
    }).start(() => {
      setDate(newDate)
      Animated.timing(position, {
        toValue: screenWidth,
        duration: 0,
        useNativeDriver: false
      }).start(() => {
        Animated.timing(position, {
          toValue: 0,
          duration: 200,
          useNativeDriver: false
        }).start()
      })
    })
  };

  return (
    <View style={styles.container}>
      <View style={styles.arrows}>
        <TouchableOpacity activeOpacity={0.7} onPress={prevDay}>
          <BotonChico color={theme.colors.grisMedio} text='<'/>
        </TouchableOpacity>

        <Text style={styles.monthText}>{firstLetterUpper(date.toLocaleDateString('es-ES', {month: 'short'}))} / {date.toLocaleDateString('es-ES', {day:"numeric"})} ({textDay(date)})</Text>
        
        <TouchableOpacity activeOpacity={0.7} onPress={nextDay}>
          <BotonChico color={theme.colors.grisMedio} text='>'/>
        </TouchableOpacity>
      </View>

      <Boton block={false} press={() => {}} to={`/calendar/shifts/${date}/newShift`} text="Registrar Turno" color={theme.colors.verdeBoton}/>

      <ScrollView>
        {shifts.length === 0 || shifts === undefined ? <View></View> : 
          shifts.filter((shift: ShiftProps) => new Date(shift.shiftEntry.getFullYear(), shift.shiftEntry.getMonth(), shift.shiftEntry.getDate(), 0, 0) === new Date(date.getFullYear(), date.getMonth(), date.getDay(), 0, 0)).map(
            (mapedShift: ShiftProps) => <Shift shift={mapedShift} />
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
  monthText: {
    fontSize: theme.fontSizes.F20,
    fontWeight: 'bold',
  },
  arrows: {
    height: 28,
    flexDirection: 'row',
    justifyContent: "space-between",
    paddingHorizontal: 48
  }
})
