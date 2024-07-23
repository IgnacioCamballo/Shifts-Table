import React, { useEffect, useState } from 'react'
import { Animated, Dimensions, StyleSheet, Text, TouchableOpacity, View, ScrollView } from 'react-native'
import { useParams } from 'react-router-native'
import { firstLetterUpper } from '../utils'
import BotonChico from '../components/BotonChico'
import theme from '../theme'
import useCalendar from '../hooks/useCalendar'
import Boton from '../components/Boton'

export default function Shifts() {
  const params = useParams()
  const pressedDate = params.date!

  const {shifts, setShifts} = useCalendar()

  let screenWidth = Dimensions.get("window").width
  let lenguage = "es"

  const [position, setPosition] = useState(new Animated.Value(0))
  const [date, setDate] = useState(new Date(pressedDate))
  const [employersToday, setEmployersToday] = useState(["Todos"])

  useEffect(() => {
    const todayShifts = shifts.filter(shift => shift.shiftEntry === date)
    for (let i=0; i = todayShifts.length; i++) {
      const name = todayShifts[i].employer
      if (todayShifts.find(shift => shift.employer === name)) {
        return
      } else {
        setEmployersToday([...employersToday, name])
      }
    }
  }, [, date])

  const textDay = () => {
    const weekdaysArray = [...Array(7).keys()]
    const intlWeekDay = new Intl.DateTimeFormat(lenguage, {weekday: "short"})
    const weekDays = weekdaysArray.map(weekDayIndex => {
      const weekDayName = intlWeekDay.format(new Date(2021, 10, weekDayIndex))
      return weekDayName
    })
    const day = firstLetterUpper(weekDays[date.getDay()])
    
    return (day)
  }

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
    <ScrollView style={styles.container}>
      <View style={styles.arrows}>
        <TouchableOpacity activeOpacity={0.7} onPress={prevDay}>
          <BotonChico color={theme.colors.grisMedio} text='<'/>
        </TouchableOpacity>

        <Text style={styles.monthText}>{firstLetterUpper(date.toLocaleDateString('es-ES', {month: 'short'}))} / {date.toLocaleDateString('es-ES', {day:"numeric"})} ({textDay()})</Text>
        
        <TouchableOpacity activeOpacity={0.7} onPress={nextDay}>
          <BotonChico color={theme.colors.grisMedio} text='>'/>
        </TouchableOpacity>
      </View>

      <Boton block={false} press={() => {}} to={`/calendar/shifts/${date}/newShift`} text="Registrar Turno" color={theme.colors.verdeBoton}/>

    </ScrollView>
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
