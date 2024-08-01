import React, { useEffect, useState } from 'react'
import { Text, TouchableOpacity, View, StyleSheet, Animated, Dimensions } from 'react-native'
import BotonChico from '../components/BotonChico'
import theme from '../theme'
import { firstLetterUpper, formattedMinutesNumber } from '../utils'
import { Picker } from '@react-native-picker/picker'
import useCalendar from '../hooks/useCalendar'
import { Link } from 'react-router-native'

let screenWidth = Dimensions.get("window").width

export default function Totals() {
  const {companysInfo, shifts} = useCalendar()

  const [currentDay, setCurrentDay] = useState(new Date());
  const [position, setPosition] = useState(new Animated.Value(0))

  const [employer, setEmployer] = useState("Todos")
  const [workedDays, setWorkedDays] = useState(0)
  const [workedHours, setWorkedHours] = useState("")
  const [salary, setSalary] = useState(0)
  const [salaryPaid, setSalaryPaid] = useState(0)
  const [unpaidHours, setUnpaidHours] = useState("")

  const monthlyShifts = shifts.filter(shift => shift.shiftEntry.getFullYear() === currentDay.getFullYear() && shift.shiftEntry.getMonth() === currentDay.getMonth())
  const monthlyShiftsFiltered = employer === "Todos" ? monthlyShifts : monthlyShifts.filter(shift => shift.employer === employer)

  function findWorkedDays() {
    let dayscounter = 0
    for(let i = 0; i < 31; i++) {
      if (monthlyShiftsFiltered.some(shift => shift.shiftEntry.getDate() === i+1)) {
        dayscounter += 1
      }
      setWorkedDays(dayscounter)
    }
  }

  function findWorkedHours() {
    let initialHours = 0
    const totalMinutes = monthlyShiftsFiltered.reduce((total, shift) => {
      const sum = total + (shift.workedMinutes || 0);
      if (sum >= 60) {
        initialHours += 1
        return(sum - 60)
      } else {
        return sum
      }
    }, 0);
    const totalHours = monthlyShiftsFiltered.reduce((total, shift) => {
      return total + (shift.workedHours || 0);
    }, initialHours);
    setWorkedHours(`${totalHours}:${formattedMinutesNumber(totalMinutes)}`);
  }
  
  function findFullSalary() {
    const fullSalary = monthlyShiftsFiltered.reduce((total, shift) => {
      const sum = total + (shift.salary || 0)
      return sum
    }, 0)
    setSalary(fullSalary)
  }

  function findPaidSalary() {
    const PaidSalary = monthlyShiftsFiltered.reduce((total, shift) => {
        return total + (shift.paid ? shift.salary || 0 : 0)
    }, 0)
    setSalaryPaid(parseFloat(PaidSalary.toFixed(2)))
  }

  function findUnpaidHours() {
    const monthlyShiftsFilteredUnpaid = monthlyShiftsFiltered.filter(shift => shift.paid === false)
    let initialHours = 0
    const totalMinutes = monthlyShiftsFilteredUnpaid.reduce((total, shift) => {
      const sum = total + (shift.workedMinutes || 0);
      if (sum >= 60) {
        initialHours += 1
        return(sum - 60)
      } else {
        return sum
      }
    }, 0);
    const totalHours = monthlyShiftsFilteredUnpaid.reduce((total, shift) => {
      return total + (shift.workedHours || 0);
    }, initialHours);
    setUnpaidHours(`${totalHours}:${formattedMinutesNumber(totalMinutes)}`);
  }

  useEffect(() => {
    findWorkedDays()
    findWorkedHours()
    findFullSalary()
    findPaidSalary()
    findUnpaidHours()
  }, [currentDay, employer])

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

  return (
    <View style={styles.container}>
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
        <View style={styles.line}>
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

      <View style={styles.line}>
        <Text style={styles.textLine}>Dias trabajados:</Text>
        <View style={styles.botonVer}>
          <Text style={styles.textLine}>{workedDays}</Text>
          <Link to={`/totalsDetail/${currentDay}/`} activeOpacity={0.8} underlayColor="none">
            <BotonChico color={theme.colors.verdeBoton} text='ver'/>
          </Link>
        </View>
      </View>
      
      <View style={styles.line}>
        <Text style={styles.textLine}>Horas trabajadas:</Text>
        <Text style={styles.textLine}>{workedHours}</Text>
      </View>
      
      <View style={styles.line}>
        <Text style={styles.textLine}>Salario total:</Text>
        <Text style={styles.textLine}>${salary.toFixed(2)}</Text>
      </View>
      
      <View style={styles.line}>
        <Text style={styles.textLine}>Pagado:</Text>
        <Text style={styles.textLine}>${salaryPaid}</Text>
      </View>
      
      <View style={styles.line}>
        <Text style={styles.textLine}>Horas pendientes de pago:</Text>
        <Text style={styles.textLine}>{unpaidHours}</Text>
      </View>
      
      <View style={styles.line}>
        <Text style={styles.textLine}>Salario pendiente:</Text>
        <Text style={styles.textLine}>${salary - salaryPaid === 0 ? "0" : (salary - salaryPaid).toFixed(2)}</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    fontSize: theme.fontSizes.F20,
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
  botonVer: {
    flexDirection: "row",
    gap: 12
  }
})