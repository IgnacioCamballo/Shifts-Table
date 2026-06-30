import React, { useEffect, useState, useRef } from 'react'
import { Text, TouchableOpacity, View, StyleSheet, ScrollView, Dimensions, Platform } from 'react-native'
import { captureRef } from 'react-native-view-shot'
import * as Sharing from "expo-sharing"
import * as FileSystem from "expo-file-system";
import { Picker } from '@react-native-picker/picker'
import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads'
import IconMenu from 'react-native-vector-icons/Feather'
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import useCalendar from '@/hooks/useCalendar'
import theme from '@/theme/theme'
import { firstLetterUpper, formattedMinutes, textDay, translate } from '@/utils'
import { exportPDF } from '@/utils/shiftsExports'
import { RootStackParamList } from '@/types';

import SwiftArrows from '@/components/Molecules/SwiftArrows'
import IosPickerModal from '@/components/Molecules/IosPickerModal'

let screenWidth = Dimensions.get("window").width

export default function MonthDetail() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>()
  const params = navigation.getState().routes[navigation.getState().index].params as { month: string, employer: number }
  const month = params.month
  const employerParam = params.employer ? params.employer : 0

  const { shifts, lenguage, addsInitialized, companysInfo, userInfo } = useCalendar()

  //gets variable heigth for the screen without statusbar
  const insets = useSafeAreaInsets()
  const monthDetailHeight = theme.heigth.screenHeight - insets.top - Math.max(insets.bottom, theme.heigth.bottomSystemBar) - (userInfo.premium ? theme.heigth.monthDetailScrollViewPremium : theme.heigth.monthDetailScrollView)
  const noFooterNoHeaderHeight = theme.heigth.screenHeight - insets.top - Math.max(insets.bottom, theme.heigth.bottomSystemBar) - theme.heigth.noFooterNoHeader


  //this way avoid of calling useCalendar in utils and translate can be used inside if functions
  function translateFn(text: string) {
    return translate({ text, lenguage })
  }

  const [currentDay, setCurrentDay] = useState(new Date(month))
  const [employer, setEmployer] = useState(employerParam)
  const [shownDays, setShownDays] = useState("Todos")
  const [employersList, setEmployersList] = useState<number[]>([])
  const [modal, setModal] = useState(false)
  const exportImgRef = useRef<View>(null);

  const monthlyShifts = shifts.filter(shift => shift.shiftEntry.getFullYear() === currentDay.getFullYear() && shift.shiftEntry.getMonth() === currentDay.getMonth() && shift.shiftExit)
  const monthlyShiftsFiltered = employer === 0 ? monthlyShifts : monthlyShifts.filter(shift => shift.employer == employer)
  const monthlyShiftsFilteredPayment = shownDays === "Todos" ? monthlyShiftsFiltered : shownDays === "Pagos" ? monthlyShiftsFiltered.filter(shift => shift.paid === true) : monthlyShiftsFiltered.filter(shift => shift.paid === false)
  monthlyShiftsFilteredPayment.sort((a, b) => a.shiftEntry.getDate() - b.shiftEntry.getDate())

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
        return (sum - 60)
      } else {
        return sum
      }
    }, 0);
    const totalHours = monthlyShiftsFilteredPayment.reduce((total, shift) => {
      return total + (shift.workedHours || 0);
    }, initialHours);
    return (`${totalMinutes === 0 ? totalHours : (totalHours + totalMinutes / 60).toFixed(2)}Hs`);
  }

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

  //Calculates worked hours in any shift showed
  function calculateHours(entry: Date, exit: Date | null, shiftBreak: Date | null) {
    if (entry !== null && exit !== null) {
      const difMonth = exit!.getMonth() !== entry!.getMonth()
      const daysInMonth = new Date(currentDay.getFullYear(), currentDay.getMonth() + 1, 0).getDate();

      const dayDiference = exit!.getDate() - entry!.getDate()
      const minutes = ((exit!.getMinutes() < entry!.getMinutes()) ?
        exit!.getMinutes() + (60 - entry!.getMinutes()) :
        exit!.getMinutes() - entry!.getMinutes()
      )
      const minutesWithBreak = ((shiftBreak === undefined || shiftBreak === null) ? minutes :
        (minutes - shiftBreak!.getMinutes() >= 0 ? minutes - shiftBreak!.getMinutes() : 60 + (minutes - shiftBreak!.getMinutes()))
      )

      if (dayDiference === 0) {
        const hours = (
          exit!.getHours() - entry!.getHours()
          - (exit!.getMinutes() < entry!.getMinutes() ? 1 : 0)
          - ((shiftBreak === undefined || shiftBreak === null) ? 0 : minutes - shiftBreak!.getMinutes() < 0 ? 1 : 0)
          - ((shiftBreak === undefined || shiftBreak === null) ? 0 : shiftBreak!.getHours())
        )

        return (`${minutesWithBreak === 0 ? hours : ((hours + minutesWithBreak / 60).toFixed(2))}Hs`)
      } else {
        const hours = (
          (24 - entry!.getHours())
          - (exit!.getMinutes() < entry!.getMinutes() ? 1 : 0)
          - ((shiftBreak === undefined || shiftBreak === null) ? 0 : minutes - shiftBreak!.getMinutes() < 0 ? 1 : 0)
          - ((shiftBreak === undefined || shiftBreak === null) ? 0 : shiftBreak!.getHours())
          + (difMonth ? 24 * ((daysInMonth - entry!.getDate()) + (exit!.getDate() - 1)) : 24 * (dayDiference - 1))
          + exit!.getHours()
        )

        return (`${minutesWithBreak === 0 ? hours : ((hours + minutesWithBreak / 60).toFixed(2))}Hs`)
      }
    } else {
      return "-  "
    }
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

  const exportImg = async () => {
    try {
      const uri = await captureRef(exportImgRef, {
        format: 'png',
        quality: 1
      })
      const fromUri = uri.startsWith("file://") ? uri : `file://${uri}`;
      //rename the file
      const rawName = `${userInfo.userName}-${firstLetterUpper(currentDay.toLocaleDateString(lenguage, { month: 'long' }))}-${currentDay.toLocaleDateString(lenguage, { year: 'numeric' })}-Shifts-Table.png`;
      const safeName = rawName.replace(/[^a-z0-9._-]/gi, "_");
      const newUri = `${FileSystem.cacheDirectory}${safeName}`;
      await FileSystem.copyAsync({
        from: fromUri,
        to: newUri,
      });
      //If posible shares the Img
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(newUri);
      } else {
        alert(translateFn("noShareAlert"));
      }
    } catch (error) {
      console.error("Error capturing the image:", error)
    }
  }

  return (
    <View style={styles.container}>
      <IconMenu
        style={styles.absolute}
        name="menu"
        color={theme.colors.negro}
        size={28}
        onPress={() => setModal(true)}
      />
    
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

      <Text style={styles.TotalHours}>{translateFn("totalHours")}: {findWorkedHours()}</Text>

      <View style={styles.tableTopContainer}>
        <Text style={styles.tableTop}>{translateFn("days")}</Text>
        <Text style={styles.tableTop}>{translateFn("hours")}</Text>
        <Text style={styles.tableTop}>{translateFn("total")}</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={{ height: monthDetailHeight }}>
        {monthlyShiftsFilteredPayment.map(shift => (
          <View key={shift.key} style={styles.line}>
            <View style={[styles.flexRow, { gap: 2, width: 60 }]}>
              <Text style={styles.textLine}>{textDay(shift.shiftEntry, lenguage)}/</Text>
              <Text style={styles.textLine}>{shift.shiftEntry.getDate()}</Text>
            </View>
            <Text style={[styles.textLine, { width: 180, textAlign: "center" }]}>{entryExitHours(shift.shiftEntry, shift.shiftExit)}</Text>
            <Text style={[styles.textLine, { width: 70, textAlign: "right" }]}>{calculateHours(shift.shiftEntry, shift.shiftExit, shift.shiftBreak)}</Text>
          </View>
        ))}
      </ScrollView>

      <Text style={styles.breakMessage}>{translateFn("breakMessage")}</Text>

      {/* this view is used for creating an image, rendered outside of the screen */}
      <View ref={exportImgRef} style={{ backgroundColor: "#fff", padding: 20, position: "absolute", left: Dimensions.get("screen").width * 2, height: "auto", width: 600 }}>
        <View style={styles.tableTopContainer}>
          <Text style={styles.tableTop}>{translateFn("days")}</Text>
          <Text style={[styles.tableTop, { width: 180, textAlign: "center" }]}>{translateFn("hours")}</Text>
          <Text style={styles.tableTop}>{translateFn("break")}</Text>
          <Text style={styles.tableTop}>{translateFn("total")}</Text>
        </View>

        {monthlyShiftsFilteredPayment.map(shift => (
          <View key={shift.key} style={styles.line}>
            <View style={[styles.flexRow, { gap: 2, width: 60 }]}>
              <Text style={styles.textLine}>{textDay(shift.shiftEntry, lenguage)}/</Text>
              <Text style={styles.textLine}>{shift.shiftEntry.getDate()}</Text>
            </View>
            <Text style={[styles.textLine, { width: 180, textAlign: "center" }]}>{entryExitHours(shift.shiftEntry, shift.shiftExit)}</Text>
            <Text style={styles.textLine}>{shift.shiftBreak ? `${shift.shiftBreak!.getHours()}:${shift.shiftBreak!.getMinutes()}` : 0}</Text>
            <Text style={[styles.textLine, { width: 70, textAlign: "right" }]}>{calculateHours(shift.shiftEntry, shift.shiftExit, shift.shiftBreak)}</Text>
          </View>
        ))}

        <Text style={styles.TotalHours}>{translateFn("totalHours")}: {findWorkedHours()}</Text>
      </View>

      {!userInfo.premium && addsInitialized && (
        <View style={styles.banner}>
          <BannerAd
            size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
            unitId={theme.banners.detail}
            requestOptions={{
              requestNonPersonalizedAdsOnly: true
            }}
          />
        </View>
      )}

      {modal &&
        <TouchableOpacity activeOpacity={1} style={[styles.modalContainer, { height: noFooterNoHeaderHeight }]} onPress={() => setModal(false)}>
          <View style={styles.modal}>
            <Text
              style={styles.modalText}
              disabled={!userInfo.premium}
              onPress={() => exportImg()}
            >
              {translateFn("exportImagen")}
            </Text>
            <Text
              style={styles.modalText}
              disabled={!userInfo.premium}
              onPress={() => exportPDF(
                monthlyShiftsFilteredPayment,
                lenguage,
                `${FileSystem.cacheDirectory}${userInfo.userName}-${firstLetterUpper(currentDay.toLocaleDateString(lenguage, { month: 'long' }))}-${currentDay.toLocaleDateString(lenguage, { year: 'numeric' })}-Shifts-Table.pdf`
              )}
            >
              {translateFn("exportPdf")}
            </Text>

            {!userInfo.premium &&
              <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginTop: -12 }}>
                <IconMenu
                  name='info'
                  size={20}
                />
                <Text style={styles.modalText_s} onPress={() => { }}>{translateFn("onlyInPremium")}</Text>
              </View>
            }
          </View>
        </TouchableOpacity>
      }
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
    padding: 10,
    backgroundColor: theme.colors.blanco,
  },
  absolute: {
    position: "absolute",
    right: 16,
    top: 9,
    zIndex: 20
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
  TotalHours: {
    width: "100%",
    textAlign: "center",
    alignSelf: "center",
    borderBottomWidth: 1,
    borderColor: theme.colors.grisClaro,
    color: theme.colors.negro,
    paddingBottom: 2
  },
  breakMessage: {
    width: "100%",
    textAlign: "center",
    alignSelf: "center",
    color: theme.colors.negro,
    marginTop: 4,
    marginBottom: -2
  },
  selector: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingTop: 4,
    marginTop: 8
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
  link: {
    position: "absolute",
    top: -32,
    left: 12
  },
  banner: {
    height: 70,
    position: 'absolute',
    justifyContent: "center",
    alignContent: "center",
    bottom: -66
  },
  modalContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    width: screenWidth,
    backgroundColor: "transparent"
  },
  modal: {
    position: "absolute",
    top: 32,
    right: 32,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: theme.colors.grisClaro,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 16
  },
  modalText: {
    textAlign: "right",
    fontSize: theme.fontSizes.F18,
    color: theme.colors.negro
  },
  modalText_s: {
    fontSize: theme.fontSizes.F14,
    color: theme.colors.negro,
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