import React, { useState } from 'react'
import { Text, TouchableOpacity, View, StyleSheet, Animated, ScrollView } from 'react-native'
import { Link, useParams } from 'react-router-native'
import { firstLetterUpper, formattedMinutes} from '../utils'
import Icon from "react-native-vector-icons/AntDesign"
import BotonChico from '../components/BotonChico'
import theme from '../theme'
import { Dimensions } from 'react-native'
import { Picker } from '@react-native-picker/picker'
import useCalendar from '../hooks/useCalendar'

let screenWidth = Dimensions.get("window").width

export default function MonthDetail() {
  const param = useParams()
  const month = param.month

  const {companysInfo, shifts} = useCalendar()

  const [currentDay, setCurrentDay] = useState(new Date(month!))
  const [position, setPosition] = useState(new Animated.Value(0))
  const [employer, setEmployer] = useState("Todos")
  const [shownDays, setShownDays] = useState("Todos")

  const monthlyShifts = shifts.filter(shift => shift.shiftEntry.getFullYear() === currentDay.getFullYear() && shift.shiftEntry.getMonth() === currentDay.getMonth())
  const monthlyShiftsFiltered = employer === "Todos" ? monthlyShifts : monthlyShifts.filter(shift => shift.employer === employer)
  const monthlyShiftsFilteredPayment = shownDays === "Todos" ? monthlyShiftsFiltered : shownDays === "Pagos" ? monthlyShiftsFiltered.filter(shift => shift.paid === true) : monthlyShiftsFiltered.filter(shift => shift.paid === false)
  monthlyShiftsFilteredPayment.sort((a, b)=> a.shiftEntry.getDate() - b.shiftEntry.getDate())

  const prevMonth = () => {
    const newDate = new Date(currentDay.getFullYear(), currentDay.getMonth() - 1);

    Animated.timing(position, {
      toValue: screenWidth,
      duration: 100,
      useNativeDriver: false
    }).start(() => {
      setCurrentDay(newDate)
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

  const nextMonth = () => {
    const newDate = new Date(currentDay.getFullYear(), currentDay.getMonth() + 1);

    Animated.timing(position, {
      toValue: -screenWidth,
      duration: 100,
      useNativeDriver: false
    }).start(() => {
      setCurrentDay(newDate)
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

  function findWorkedHours() {
    let initialHours = 0
    const totalMinutes = monthlyShiftsFilteredPayment.reduce((total, shift) => {
      const sum = total + (shift.workedMinutes || 0);
      if (sum >= 60) {
        initialHours += 1
        return(sum - 60)
      } else {
        return sum
      }
    }, 0);
    const totalHours = monthlyShiftsFilteredPayment.reduce((total, shift) => {
      return total + (shift.workedHours || 0);
    }, initialHours);
    return(`${totalMinutes === 0 ? totalHours : (totalHours + totalMinutes/60).toFixed(2)}Hs`);
  }

  function entryExitHours(entry: Date, exit: Date | null) {
    const monthText = (exit && entry ?
      (exit?.getDate() !== entry?.getDate() ? 
        `(${firstLetterUpper(exit!.toLocaleDateString('es-ES', {month: 'short'}))}/${exit?.getDate()})` : "") 
      : ""
    )

    const exitHours = (exit ? `${exit.getHours()}:${formattedMinutes(exit)}` : "")

    return(`${entry.getHours()}:${formattedMinutes(entry)} - ${exitHours} ${monthText}`)
  }

  function calculateHours(entry: Date, exit: Date | null, shiftBreak: Date | null) {
    if(entry !== null && exit !== null) {
      const difMonth = exit!.getMonth() !== entry!.getMonth()
      const daysInMonth = new Date(currentDay.getFullYear(), currentDay.getMonth() + 1, 0).getDate();
      
      const dayDiference = exit!.getDate() - entry!.getDate()    
      const minutes = ((exit!.getMinutes() < entry!.getMinutes()) ?
        exit!.getMinutes() + (60 - entry!.getMinutes()):
        exit!.getMinutes() - entry!.getMinutes()
      ) 
      const minutesWithBreak = ((shiftBreak === undefined || shiftBreak === null) ? minutes : 
        (minutes - shiftBreak!.getMinutes() >= 0 ? minutes - shiftBreak!.getMinutes() : 60 + (minutes - shiftBreak!.getMinutes()))
      )
    
      if(dayDiference === 0) {
        const hours = (
          exit!.getHours() - entry!.getHours()  
          - (exit!.getMinutes() < entry!.getMinutes() ? 1 : 0) 
          - ((shiftBreak === undefined || shiftBreak === null) ? 0 : minutes - shiftBreak!.getMinutes() < 0 ? 1 : 0)
          - ((shiftBreak === undefined || shiftBreak === null) ? 0 : shiftBreak!.getHours())
        )
        
        return(`${minutesWithBreak === 0 ? hours : ((hours + minutesWithBreak/60).toFixed(2))}Hs`)
      } else {
        const hours = (
          (24 - entry!.getHours()) 
          - (exit!.getMinutes() < entry!.getMinutes() ? 1 : 0) 
          - ((shiftBreak === undefined || shiftBreak === null) ? 0 : minutes - shiftBreak!.getMinutes() < 0 ? 1 : 0)
          - ((shiftBreak === undefined || shiftBreak === null) ? 0 : shiftBreak!.getHours())
          + (difMonth ? 24 * ((daysInMonth - entry!.getDate()) + (exit!.getDate() -1)) : 24 * (dayDiference - 1)) 
          + exit!.getHours()
        )  

        return(`${minutesWithBreak === 0 ? hours : ((hours + minutesWithBreak/60).toFixed(2))}Hs`)
      }
    } else {
      return "-  "
    }
  }

  return (
    <View style={styles.container}>
      <Link style={styles.link} to={`/totals/${currentDay}`} underlayColor="none">
        <View style={[styles.flexRow, {gap: 4}]}>
          <Icon 
            name="doubleleft" 
            color={theme.colors.negro} 
            size={18}
          />
          <Text style={styles.textLine}>Atras</Text>
        </View>
      </Link>
      <View style={styles.arrows}>
        <TouchableOpacity activeOpacity={0.7} onPress={prevMonth}>
          <BotonChico color={theme.colors.grisMedio} text='<'/>
        </TouchableOpacity>

        <Text style={styles.monthText}>{firstLetterUpper(currentDay.toLocaleDateString('es-ES', { month: 'long' }))} / {currentDay.toLocaleDateString('es-ES', { year: '2-digit' })}</Text>
        
        <TouchableOpacity activeOpacity={0.7} onPress={nextMonth}>
        <BotonChico color={theme.colors.grisMedio} text='>'/>
        </TouchableOpacity>
      </View>

      <View style={styles.employersContainer}>
        <View style={[styles.line, {borderBottomWidth: 0, paddingBottom: 0}]}>
          <Text style={styles.textLine}>Empleador:</Text>
          
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={employer}
              onValueChange={newValue => setEmployer(newValue)}
              style={styles.picker}
              accessibilityLabel='Seleccionar Empleador'
              mode='dropdown'
              >
                <Picker.Item style={styles.pickerItem} label='Todos' value="Todos"/>
              {companysInfo.map(employer => 
                <Picker.Item style={styles.pickerItem} label={employer.name} value={employer.name} key={employer.name}/>
              )}
            </Picker>
          </View>
        </View>
      </View>
      
      <View style={styles.selector}>
        <Text style={styles.textLine}>Dias:</Text>
        <View style={styles.flexRow}>
          <TouchableOpacity style={styles.outerCircle} onPress={() => setShownDays("Todos")}>
            <View style={[styles.innerCircle, shownDays === "Todos" ? styles.bgBlack : {}]}></View>
          </TouchableOpacity>

          <Text style={styles.textSelector}>Todos</Text>
        </View>

        <View style={styles.flexRow}>
          <TouchableOpacity style={styles.outerCircle} onPress={() => setShownDays("Pagos")}>
            <View style={[styles.innerCircle, shownDays === "Pagos" ? styles.bgBlack : {}]}></View>
          </TouchableOpacity>

          <Text style={styles.textSelector}>Pagos</Text>
        </View>

        <View style={styles.flexRow}>
          <TouchableOpacity style={styles.outerCircle} onPress={() => setShownDays("Inpagos")}>
            <View style={[styles.innerCircle, shownDays === "Inpagos" ? styles.bgBlack : {}]}></View>
          </TouchableOpacity>

          <Text style={styles.textSelector}>Inpagos</Text>
        </View>
      </View>

      <Text style={styles.TotalHours}>Total de horas: {findWorkedHours()}</Text>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
        {monthlyShiftsFilteredPayment.map(shift => (
          <View key={shift.key} style={styles.line}>
            <Text style={[styles.textLine, {width: 50}]}>{shift.shiftEntry.getDate()}</Text>
            <Text style={styles.textLine}>{entryExitHours(shift.shiftEntry, shift.shiftExit)}</Text>
            <Text style={[styles.textLine, {width: 80, textAlign:"right"}]}>{calculateHours(shift.shiftEntry, shift.shiftExit, shift.shiftBreak)}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 10
  },
  arrows: {
    height: 28,
    flexDirection: 'row',
    justifyContent: "space-between",
    paddingHorizontal: 48
  },
  monthText: {
    fontSize: theme.fontSizes.F20,
    fontWeight: 'bold',
  },
  line: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    flexDirection: "row",
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderColor: theme.colors.grisClaro
  },
  textLine: {
    fontSize: theme.fontSizes.F18,
    fontWeight: '400'
  },
  employersContainer: {
    borderTopWidth: 2,
    marginTop: 24,
    borderColor: theme.colors.negro,
  },
  pickerContainer: {
    flex: 1,
    height: 20,
    justifyContent: "center",
  },
  picker: {
    marginLeft: 0,
    transform: [{translateX: 18}, {translateY: 4}]
  },
  pickerItem: {
    fontSize: 18,
    color: "black"
  },
  TotalHours: {
    width: "100%",
    textAlign: "center",
    alignSelf: "center",
    borderBottomWidth: 1,
    borderColor: theme.colors.grisClaro,
    color: theme.colors.gris,
    paddingBottom: 2
  },
  selector: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems:"center",
    paddingHorizontal: 15,
    paddingTop: 4
  },
  textSelector: {
    fontSize: theme.fontSizes.F16,
    fontWeight: '400'
  },
  flexRow: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center"
  },
  outerCircle: {
    borderWidth: 1.5,
    borderColor: theme.colors.negro,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center"
  },
  innerCircle: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  bgBlack: {
    backgroundColor: theme.colors.negro
  },
  scrollView:{
    maxHeight: theme.heigth.monthDetailScrollView
  },
  link: {
    position: "absolute",
    top: -32,
    left: 12
  }
})