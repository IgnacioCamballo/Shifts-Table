import React, { useEffect, useState, useRef } from 'react'
import { Text, TouchableOpacity, View, StyleSheet, ScrollView, Platform } from 'react-native'
import { Picker } from '@react-native-picker/picker'
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import useCalendar from '@/hooks/useCalendar'
import theme from '@/theme/theme'
import { firstLetterUpper, formattedMinutes, textDay, translate } from '@/utils'
import { RootStackParamList } from '@/types';

import SwiftArrows from '@/components/Molecules/SwiftArrows'
import IosPickerModal from '@/components/Molecules/IosPickerModal'
import { BannerAdds } from '@/components/Atoms/BannerAdds';
import Slider from '@/components/Atoms/Slider';

export default function MultiplePaymentsSelect() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>()
  const params = navigation.getState().routes[navigation.getState().index].params as { month: string, employer: number }
  const month = params.month
  const employerParam = params.employer ? params.employer : 0

  const { shifts, setShifts, lenguage, addsInitialized, companysInfo, userInfo } = useCalendar()
  const showBanner = !userInfo.premium && addsInitialized

  //this way avoid of calling useCalendar in utils and translate can be used inside if functions
  function translateFn(text: string) {
    return translate({ text, lenguage })
  }

  const [currentDay, setCurrentDay] = useState(new Date(month)) //a date that define the current month
  const [employersList, setEmployersList] = useState<number[]>([]) //list of available eployers in this month based on the shifts of the month
  const [employer, setEmployer] = useState(employerParam) //the employer selected for the filter
  const [shownDays, setShownDays] = useState("Todos") //the selector for showing all paid or not paid days

  const monthlyShifts = shifts.filter(shift => shift.shiftEntry.getFullYear() === currentDay.getFullYear() && shift.shiftEntry.getMonth() === currentDay.getMonth() && shift.shiftExit)
  const monthlyShiftsFiltered = employer === 0 ? monthlyShifts : monthlyShifts.filter(shift => shift.employer == employer)
  const monthlyShiftsFilteredPayment = shownDays === "Todos" ? monthlyShiftsFiltered : shownDays === "Pagos" ? monthlyShiftsFiltered.filter(shift => shift.paid === true) : monthlyShiftsFiltered.filter(shift => shift.paid === false)
  monthlyShiftsFilteredPayment.sort((a, b) => a.shiftEntry.getHours() - b.shiftEntry.getHours())
  monthlyShiftsFilteredPayment.sort((a, b) => a.shiftEntry.getDate() - b.shiftEntry.getDate())

  const prevMonth = () => {
    const newDate = new Date(currentDay.getFullYear(), currentDay.getMonth() - 1);
    setCurrentDay(newDate)
  };

  const nextMonth = () => {
    const newDate = new Date(currentDay.getFullYear(), currentDay.getMonth() + 1);
    setCurrentDay(newDate)
  };

  //Gets the entry hour and exit hour and date for every shift showed
  function entryExitHours(entry: Date, exit: Date | null) {
    const monthText = (exit && entry ?
      (exit?.getDate() !== entry?.getDate() ?
        `(${firstLetterUpper(exit!.toLocaleDateString(lenguage, { month: 'short' }))}/${exit?.getDate()})` : "")
      : ""
    )

    const exitHours = (exit ? `${exit.getHours()}:${formattedMinutes(exit)}` : "")

    return (`${entry.getHours()}:${formattedMinutes(entry)} - ${monthText}${exitHours}`)
  }

  //Sets the list of employers of every month used to filter by employer
  useEffect(() => {
    const copyList = [...employersList]
    if (!monthlyShifts) {
      return
    } else {
      monthlyShifts.forEach(shift => {
        if (copyList.some(employer => employer === shift.employer)) {
          return
        } else {
          copyList.push(shift.employer)
        }
      })
    }
    setEmployersList(copyList)
  }, [currentDay])

  const handleChangeShiftPaid = (key: string) => {
    const shiftIndex = shifts.findIndex(shift => shift.key === key)
    const shift = shifts.find(shift => shift.key === key)
    if(!shift) return
    
    const editedShift = {
      ...shift, paid: !shift.paid
    }
    const updatedShifts = [...shifts]
    updatedShifts.splice(shiftIndex, 1, editedShift)
    setShifts(updatedShifts)
  }

  return (
    <View style={[styles.container, !showBanner && styles.containerNoBanner]}>
      <SwiftArrows
        leftAction={prevMonth}
        text={`${firstLetterUpper(currentDay.toLocaleDateString(lenguage, { month: 'long' }))} / ${currentDay.toLocaleDateString(lenguage, { year: '2-digit' })}`}
        rightAction={nextMonth}
      />

      <View style={styles.employersContainer}>
        <View style={[styles.line, { borderBottomWidth: 0, paddingBottom: 0 }]}>
          <Text style={styles.textLine}>{translateFn("employer")}:</Text>

          {Platform.OS === 'ios' ? (
            <View style={styles.pickerContainerIos}>
              <IosPickerModal
                value={employer}
                onValueChange={value => setEmployer(Number(value))}
                items={[
                  { label: translateFn("all") || "All", value: 0 },
                  ...employersList.map(employer => ({
                    label: companysInfo.find(emp => emp.key == employer)!.name,
                    value: employer,
                    key: employer
                  }))
                ]}
                inputStyle={styles.pickerInput}
                modalTitle={translateFn("employer") || "Employer"}
              />
            </View>
          ) : (
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={employer}
                onValueChange={newValue => setEmployer(newValue)}
                style={styles.picker}
                itemStyle={styles.pickerItem}
                dropdownIconColor={theme.colors.gris}
                accessibilityLabel={translateFn("selectEmployer")}
                mode='dropdown'
              >
                <Picker.Item style={styles.pickerItem} label={translateFn("all")} value={0} />
                {employersList.map(employer =>
                  <Picker.Item style={styles.pickerItem} label={companysInfo.find(emp => emp.key == employer)!.name} value={employer} key={employer} />
                )}
              </Picker>
            </View>
          )}
        </View>
      </View>

      <View style={styles.selector}>
        <TouchableOpacity activeOpacity={0.9} style={styles.flexRow} onPress={() => setShownDays("Todos")}>
          <View style={styles.outerCircle}>
            <View style={[styles.innerCircle, shownDays === "Todos" ? styles.bgBlack : {}]}></View>
          </View>

          <Text style={styles.textSelector}>{translateFn("all")}</Text>
        </TouchableOpacity>

        <TouchableOpacity activeOpacity={0.9} style={styles.flexRow} onPress={() => setShownDays("Pagos")}>
          <View style={styles.outerCircle}>
            <View style={[styles.innerCircle2, shownDays === "Pagos" ? styles.bgBlack : {}]}></View>
          </View>

          <Text style={styles.textSelector}>{translateFn("isPaid")}</Text>
        </TouchableOpacity>

        <TouchableOpacity activeOpacity={0.9} style={styles.flexRow} onPress={() => setShownDays("Inpagos")}>
          <View style={styles.outerCircle} >
            <View style={[styles.innerCircle3, shownDays === "Inpagos" ? styles.bgBlack : {}]}></View>
          </View>

          <Text style={styles.textSelector}>{translateFn("unPaid")}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tableTopContainer}>
        <Text style={styles.tableTop}>{translateFn("days")}</Text>
        <Text style={styles.tableTop}>{translateFn("hours")}</Text>
        <Text style={styles.tableTop}>{translateFn("paid")}</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
        {monthlyShiftsFilteredPayment.map(shift => (
          <View key={shift.key} style={styles.line}>
            <View style={[styles.flexRow, { gap: 2, width: 60 }]}>
              <Text style={styles.textLine}>{textDay(shift.shiftEntry, lenguage)}/</Text>
              <Text style={styles.textLine}>{shift.shiftEntry.getDate()}</Text>
            </View>
            <Text style={[styles.textLine, { width: 180, textAlign: "center" }]}>{entryExitHours(shift.shiftEntry, shift.shiftExit)}</Text>
            <Slider key={shift.key} value={shift.paid} setValue={() => handleChangeShiftPaid(shift.key)}/>
          </View>
        ))}
      </ScrollView>
      {showBanner && (
        <View style={styles.banner}>
          <BannerAdds />
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "relative",
    padding: 10,
    //the banner goes right above the footer, so there is no space below it
    paddingBottom: 0,
    //footer is absolute, so the margin makes the screen end where the footer starts
    marginBottom: theme.heigth.footer,
    backgroundColor: theme.colors.blanco,
  },
  containerNoBanner: {
    paddingBottom: 10
  },
  scrollView: {
    flex: 1
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
    fontWeight: '400',
    color: theme.colors.negro
  },
  employersContainer: {
    borderTopWidth: 2,
    marginTop: 24,
    borderColor: theme.colors.negro,
  },
  pickerContainer: {
    flex: 1,
    height: 24,
    justifyContent: "center",
    overflow: "hidden"
  },
  pickerContainerIos: {
    height: 20,
    justifyContent: "center",
    shadowOffset: { width: 2, height: 2 },
    shadowColor: theme.colors.negro,
    shadowOpacity: 0.6,
    shadowRadius: 2,
    elevation: 4,
    borderColor: theme.colors.grisClaro,
    borderWidth: Platform.OS === "android" ? 1 : 0
  },
  picker: {
    marginLeft: 0,
    transform: [{ translateX: 18 }, { translateY: 2 }],
    backgroundColor: "white",
    color: "black"
  },
  pickerItem: {
    fontSize: 18,
    color: "black",
    textAlign: 'center',
    backgroundColor: "white"
  },
  pickerInput: {
    fontSize: theme.fontSizes.F20,
    backgroundColor: theme.colors.grisClaro,
    height: 28,
    minWidth: 116,
    color: 'black',
    textAlign: 'center',
    borderRadius: 12,
  },
  selector: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingTop: 4,
    marginTop: 8,
    marginBottom: 8
  },
  textSelector: {
    fontSize: theme.fontSizes.F16,
    fontWeight: '400',
    color: theme.colors.negro
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
  banner: {
    //as the ad is as wide as the screen, it cancels the horizontal padding of the container
    marginHorizontal: -10
  },
  tableTopContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 2,
    backgroundColor: theme.colors.grisOscuro
  },
  tableTop: {
    color: theme.colors.blanco,
    fontSize: theme.fontSizes.F18
  }
})
