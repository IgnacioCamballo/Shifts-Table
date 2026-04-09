import React, { useEffect, useState } from 'react'
import { Text, View, StyleSheet, Platform } from 'react-native'
import { Link, useParams } from 'react-router-native'
import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads'
import { Picker } from '@react-native-picker/picker'

import useCalendar from '@/hooks/useCalendar'
import { firstLetterUpper, formattedMinutesNumber, translate } from '@/utils'
import theme from '@/theme/theme'

import SwiftArrows from '@/components/Molecules/SwiftArrows'
import IosPickerModal from '@/components/Molecules/IosPickerModal'
import ButtonSmall from '@/components/Atoms/Buttons/ButtonSmall'

export default function Totals() { 
  const param = useParams()
  const currentMonth = param.month ? new Date(param.month) : new Date()

  const { shifts, lenguage, addsInitialized, companysInfo, configInfo, userInfo } = useCalendar()

  //this way avoid of calling useCalendar in utils and translate can be used inside if functions
  function translateFn(text: string) {
    return translate({ text, lenguage })
  }

  const [currentDay, setCurrentDay] = useState(currentMonth);
  const [employersList, setEmployersList] = useState<number[]>([])

  const [employer, setEmployer] = useState(0)
  const [workedDays, setWorkedDays] = useState(0)
  const [workedHours, setWorkedHours] = useState("")
  const [salary, setSalary] = useState(0)
  const [salaryPaid, setSalaryPaid] = useState(0)

  const monthlyShifts = shifts.filter(shift => shift.shiftEntry.getFullYear() === currentDay.getFullYear() && shift.shiftEntry.getMonth() === currentDay.getMonth())
  const monthlyShiftsFiltered = employer == 0 ? monthlyShifts : monthlyShifts.filter(shift => shift.employer == employer)

  function findWorkedDays() {
    let dayscounter = 0
    for (let i = 0; i < 31; i++) {
      if (monthlyShiftsFiltered.some(shift => shift.shiftEntry.getDate() === i + 1)) {
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
        return (sum - 60)
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

  //Creates an array with the employers on the shifts of that month used in the employer filter
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

  //call the functions to update the info when month or employer filter change
  useEffect(() => {
    findWorkedDays()
    findWorkedHours()
    findFullSalary()
    findPaidSalary()
  }, [currentDay, employer])

  const prevMonth = () => {
    const newDate = new Date(currentDay.getFullYear(), currentDay.getMonth() - 1);
    setCurrentDay(newDate)
  };

  const nextMonth = () => {
    const newDate = new Date(currentDay.getFullYear(), currentDay.getMonth() + 1);
    setCurrentDay(newDate)
  };

  return (
    <View style={styles.container}>
      <SwiftArrows
        leftAction={prevMonth}
        text={`${firstLetterUpper(currentDay.toLocaleDateString(lenguage, { month: 'long' }))} / ${currentDay.toLocaleDateString(lenguage, { year: '2-digit' })}`}
        rightAction={nextMonth}
      />

      <View style={styles.employersContainer}>
        <View style={styles.line}>
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
            <View style={styles.pickerContainerAndroid}>
              <Picker
                selectedValue={employer}
                onValueChange={newValue => setEmployer(newValue)}
                style={styles.picker}
                accessibilityLabel={translateFn("selectEmployer")}
                mode='dropdown'
              >
                <Picker.Item style={styles.pickerItem} label={translateFn("all")} value={0} />
                {employersList.map(employer =>
                  <Picker.Item style={styles.pickerItem} label={companysInfo.find(emp => emp.key === employer)!.name} value={employer} key={employer} />
                )}
              </Picker>
            </View>
          )}
        </View>
      </View>

      <View style={styles.line}>
        <Text style={styles.textLine}>{translateFn("workedDays")}:</Text>
        <View style={styles.botonVer}>
          <Text style={styles.textLine}>{workedDays}</Text>
          {workedDays !== 0 && <Link to={`/totalsDetail/${currentDay}/${employer}`} activeOpacity={0.8} underlayColor="none">
            <ButtonSmall color={configInfo.buttonsColor}>
              <Text style={styles.textButtonSmall}>{translateFn("seeDetail")}</Text>
            </ButtonSmall>
          </Link>}
        </View>
      </View>

      <View style={styles.line}>
        <Text style={styles.textLine}>{translateFn("workedHours")}:</Text>
        <Text style={styles.textLine}>{workedHours}</Text>
      </View>

      <View style={styles.line}>
        <Text style={styles.textLine}>{translateFn("totalSalary")}:</Text>
        <Text style={styles.textLine}>${salary.toFixed(2)}</Text>
      </View>

      <View style={styles.line}>
        <Text style={styles.textLine}>{translateFn("paid")}:</Text>
        <Text style={styles.textLine}>${salaryPaid}</Text>
      </View>

      <View style={styles.line}>
        <Text style={styles.textLine}>{translateFn("unpaidSalary")}:</Text>
        <Text style={styles.textLine}>${salary - salaryPaid === 0 ? "0" : (salary - salaryPaid).toFixed(2)}</Text>
      </View>

      {!userInfo.premium && addsInitialized && (
        <View style={styles.banner}>
          <BannerAd
            size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
            unitId={theme.banners.totals}
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
    flex: 1,
    padding: 10
  },
  line: {
    paddingHorizontal: 14,
    paddingVertical: 8,
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
  employersContainer: {
    borderTopWidth: 2,
    marginTop: 24,
    borderColor: theme.colors.negro,
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
  pickerContainerAndroid: {
    flex: 1,
    height: 20,
    justifyContent: "center",
  },
  picker: {
    marginLeft: 0,
    transform: [{ translateX: 18 }, { translateY: 4 }]
  },
  pickerItem: {
    fontSize: 18,
    color: "black"
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
  botonVer: {
    flexDirection: "row",
    gap: 12
  },
  textButtonSmall: {
    marginTop: 2,
    fontSize: theme.fontSizes.F20,
    fontWeight: "500",
    lineHeight: theme.fontSizes.F20
  },
  banner: {
    height: 70,
    position: 'absolute',
    justifyContent: "center",
    alignContent: "center",
    bottom: 80
  }
})