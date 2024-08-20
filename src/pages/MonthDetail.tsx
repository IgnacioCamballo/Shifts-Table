import React, { useEffect, useState } from 'react'
import { Text, TouchableOpacity, View, StyleSheet, ScrollView } from 'react-native'
import { useParams } from 'react-router-native'
import { Picker } from '@react-native-picker/picker'
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads'
import Icon from 'react-native-vector-icons/AntDesign'

import useCalendar from '../hooks/useCalendar'
import translations from "../lenguages/lenguages.json"
import theme from '../theme/theme'
import { firstLetterUpper, formattedMinutes, textDay} from '../utils'
import SwiftArrows from '../components/Molecules/SwiftArrows'
import TransparentButton from '../components/Atoms/Buttons/ButtonTransparent'

export default function MonthDetail() {
  const param = useParams()
  const month = param.month

  const {shifts, lenguage, addsInitialized} = useCalendar()

  const [currentDay, setCurrentDay] = useState(new Date(month!))
  const [employer, setEmployer] = useState("Todos")
  const [shownDays, setShownDays] = useState("Todos")
  const [employersList, setEmployersList] = useState<string[]>([])

  const monthlyShifts = shifts.filter(shift => shift.shiftEntry.getFullYear() === currentDay.getFullYear() && shift.shiftEntry.getMonth() === currentDay.getMonth())
  const monthlyShiftsFiltered = employer === "Todos" ? monthlyShifts : monthlyShifts.filter(shift => shift.employer === employer)
  const monthlyShiftsFilteredPayment = shownDays === "Todos" ? monthlyShiftsFiltered : shownDays === "Pagos" ? monthlyShiftsFiltered.filter(shift => shift.paid === true) : monthlyShiftsFiltered.filter(shift => shift.paid === false)
  monthlyShiftsFilteredPayment.sort((a, b)=> a.shiftEntry.getDate() - b.shiftEntry.getDate())

  const prevMonth = () => {
    const newDate = new Date(currentDay.getFullYear(), currentDay.getMonth() - 1);
    setCurrentDay(newDate)
  };

  const nextMonth = () => {
    const newDate = new Date(currentDay.getFullYear(), currentDay.getMonth() + 1);
    setCurrentDay(newDate)
  };

  //Calculates the total worked hours of the month
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

  //Gets the entry hour and exit hour and date for every shift showed
  function entryExitHours(entry: Date, exit: Date | null) {
    const monthText = (exit && entry ?
      (exit?.getDate() !== entry?.getDate() ? 
        `(${firstLetterUpper(exit!.toLocaleDateString(lenguage, {month: 'short'}))}/${exit?.getDate()})` : "") 
      : ""
    )

    const exitHours = (exit ? `${exit.getHours()}:${formattedMinutes(exit)}` : "")

    return(`${entry.getHours()}:${formattedMinutes(entry)} - ${monthText}${exitHours}`)
  }

  //Calculates worked hours in any shift showed
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

  //Sets the list of employers of every month used to filter by employer
  useEffect(() => {
    const copyList = [...employersList]
    if(!monthlyShifts){
      return
    } else {
      monthlyShifts.forEach(shift => {if(copyList.some(employer => employer === shift.employer)) {
        return
      } else {
        copyList.push(shift.employer)
      }})
    }
    setEmployersList(copyList)
  }, [currentDay])

  return (
    <View style={styles.container}>
      <TransparentButton link={`/totals/${currentDay}`} style={styles.link}>
        <Icon 
          name="doubleleft" 
          color={theme.colors.negro} 
          size={17}
          />
        <Text style={[styles.textLine, {fontWeight: 500}]}>{translations.back.find(i => i.lenguage === lenguage)?.text}</Text>
      </TransparentButton>
      
      <SwiftArrows 
        leftAction={prevMonth} 
        text={`${firstLetterUpper(currentDay.toLocaleDateString(lenguage, { month: 'long' }))} / ${currentDay.toLocaleDateString(lenguage, { year: '2-digit' })}`}
        rightAction={nextMonth} 
        />

      <View style={styles.employersContainer}>
        <View style={[styles.line, {borderBottomWidth: 0, paddingBottom: 0}]}>
          <Text style={styles.textLine}>{translations.employer.find(i => i.lenguage === lenguage)?.text}:</Text>
          
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={employer}
              onValueChange={newValue => setEmployer(newValue)}
              style={styles.picker}
              accessibilityLabel={translations.selectEmployer.find(i => i.lenguage === lenguage)?.text}
              mode='dropdown'
              >
                <Picker.Item style={styles.pickerItem} label={translations.all.find(i => i.lenguage === lenguage)?.text} value="Todos"/>
              {employersList.map(employer => 
                <Picker.Item style={styles.pickerItem} label={employer} value={employer} key={employer}/>
              )}
            </Picker>
          </View>
        </View>
      </View>
      
      <View style={styles.selector}>
        <Text style={styles.textLine}>{translations.days.find(i => i.lenguage === lenguage)?.text}:</Text>
        <View style={styles.flexRow}>
          <TouchableOpacity style={styles.outerCircle} onPress={() => setShownDays("Todos")}>
            <View style={[styles.innerCircle, shownDays === "Todos" ? styles.bgBlack : {}]}></View>
          </TouchableOpacity>

          <Text style={styles.textSelector}>{translations.all.find(i => i.lenguage === lenguage)?.text}</Text>
        </View>

        <View style={styles.flexRow}>
          <TouchableOpacity style={styles.outerCircle} onPress={() => setShownDays("Pagos")}>
            <View style={[styles.innerCircle2, shownDays === "Pagos" ? styles.bgBlack : {}]}></View>
          </TouchableOpacity>

          <Text style={styles.textSelector}>{translations.isPaid.find(i => i.lenguage === lenguage)?.text}</Text>
        </View>

        <View style={styles.flexRow}>
          <TouchableOpacity style={styles.outerCircle} onPress={() => setShownDays("Inpagos")}>
            <View style={[styles.innerCircle3, shownDays === "Inpagos" ? styles.bgBlack : {}]}></View>
          </TouchableOpacity>

          <Text style={styles.textSelector}>{translations.unPaid.find(i => i.lenguage === lenguage)?.text}</Text>
        </View>
      </View>

      <Text style={styles.TotalHours}>{translations.totalHours.find(i => i.lenguage === lenguage)?.text}: {findWorkedHours()}</Text>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
        {monthlyShiftsFilteredPayment.map(shift => (
          <View key={shift.key} style={styles.line}>
            <View style={[styles.flexRow, {gap: 2, width: 50}]}>
              <Text style={styles.textLine}>{textDay(shift.shiftEntry, lenguage)}/</Text>
              <Text style={styles.textLine}>{shift.shiftEntry.getDate()}</Text>
            </View>
            <Text style={styles.textLine}>{entryExitHours(shift.shiftEntry, shift.shiftExit)}</Text>
            <Text style={[styles.textLine, {width: 70, textAlign:"right"}]}>{calculateHours(shift.shiftEntry, shift.shiftExit, shift.shiftBreak)}</Text>
          </View>
        ))}
      </ScrollView>

      {addsInitialized && (
        <View style={styles.banner}>
        <BannerAd 
          size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
          unitId={TestIds.ADAPTIVE_BANNER}
          requestOptions={{
            requestNonPersonalizedAdsOnly: true
          }}
          />
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 10
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
  innerCircle2: {
    width: 8,
    height: 8,
    borderRadius: 6,
  },
  innerCircle3: {
    width: 8,
    height: 8,
    borderRadius: 6,
  },
  bgBlack: {
    backgroundColor: theme.colors.negro,
    borderRadius: 4
  },
  scrollView:{
    height: theme.heigth.monthDetailScrollView
  },
  link: {
    position: "absolute",
    top: -32,
    left: 12
  },
  banner:{
    height: 70, 
    position: 'absolute',
    justifyContent: "center", 
    alignContent: "center", 
    bottom: -66
  }
})