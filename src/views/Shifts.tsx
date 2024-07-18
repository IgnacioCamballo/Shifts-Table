import React, { useEffect, useState } from 'react'
import { Animated, Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { Picker } from '@react-native-picker/picker'
import { useParams } from 'react-router-native'
import { firstLetterUpper } from '../utils'
import BotonChico from '../components/BotonChico'
import theme from '../theme'
import useCalendar from '../hooks/useCalendar'

export default function Shifts() {
  const params = useParams()
  const pressedDate = params.date!

  const {shifts, setShifts} = useCalendar()

  let screenWidth = Dimensions.get("window").width
  let lenguage = "es"

  const [position, setPosition] = useState(new Animated.Value(0))
  const [date, setDate] = useState(new Date(pressedDate))
  const [employersToday, setEmployersToday] = useState(["Todos"])
  const [filter, setFilter] = useState()

  useEffect(() => {
    const todayShifts = shifts.filter(shift => shift.entry === date)
    for (let i=0; i = todayShifts.length; i++) {
      const name = todayShifts[i].Employer
      if (todayShifts.find(shift => shift.Employer === name)) {
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
    <View style={styles.container}>
      <View style={styles.arrows}>
        <TouchableOpacity activeOpacity={0.7} onPress={prevDay}>
          <BotonChico color={theme.colors.grisMedio} text='<'/>
        </TouchableOpacity>

        <Text style={styles.monthText}>{firstLetterUpper(date.toLocaleDateString('es-ES', {month: 'short'}))} / {date.toLocaleDateString('es-ES', {day:"numeric"})} ({textDay()})</Text>
        
        <TouchableOpacity activeOpacity={0.7} onPress={nextDay}>
          <BotonChico color={theme.colors.grisMedio} text='>'/>
        </TouchableOpacity>
      </View>

      <View style={styles.selector}>
        <Text style={styles.selectorText}>Mostar:</Text>
        <View style={styles.selectorPickerCont}>

        <Picker
          selectedValue={filter}
          onValueChange={(itemValue) => setFilter(itemValue)}
          style={styles.selectorPicker}
          > 
          {employersToday.map(employer => 
            <Picker.Item label={employer} value={employer} key={employer}/>
          )}
        </Picker> 
          </View>
      </View>
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
  },
  selector: {
    width: "100%",
    alignItems: "center",
    justifyContent: "space-between",
    flexDirection: "row",
    gap: 20,
    padding: 12
  },
  selectorText: {
    fontSize: theme.fontSizes.F16
  },
  selectorPickerCont: {
    borderWidth: 1,
    borderColor: theme.colors.gris,
    flex: 1,
    height: 32,
    justifyContent: "center"
  },
  selectorPicker: {
  }
})
