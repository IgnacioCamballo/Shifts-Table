import React, { useEffect, useRef, useState } from 'react'
import { StyleSheet, Text, TextInput, TouchableOpacity, View, Modal, Platform, Alert, ScrollView, Animated } from 'react-native'
import { Link } from 'react-router-native'
import { Picker } from '@react-native-picker/picker'
import DatePicker from 'react-native-date-picker'
import Icon from 'react-native-vector-icons/AntDesign'
import Constants from "expo-constants"

import useCalendar from '../../hooks/useCalendar'
import { ShiftProps } from '../../types'
import theme from '../../theme/theme'
import { firstLetterUpper, formattedMinutes, formattedMinutesNumber, textDay, translate } from '../../utils'
import Slider from '../Atoms/Slider'
import ButtonSmall from '../Atoms/Buttons/ButtonSmall'
import Button from '../Atoms/Buttons/Button'
import { GetBreakTime, getWorkedTime } from '../../utils/datesCompare'

type ShiftFormProps = {
  isCreate: boolean,
  editingShift?: ShiftProps,
  pressedDate: Date,
  onSubmit: (FormData: ShiftProps) => void
}

export default function ShiftForm({ isCreate, editingShift, pressedDate, onSubmit }: ShiftFormProps) {
  const { configInfo, companysInfo, shifts, lenguage } = useCalendar()

  //this way avoid of calling useCalendar in utils and translate can be used inside if functions
  function translateFn(text: string) {
    return translate({ text, lenguage })
  }

  //gets a date and creates a date on the pressedDay with hour and minutes of the parameter time
  const PutTimeOnCurrentDay = (time: Date) => {
    return new Date(pressedDate.getFullYear(), pressedDate.getMonth(), pressedDate.getDate(), time!.getHours(), time!.getMinutes())
  }

  //states to manage the form data
  const [employerForm, setEmployerForm] = useState<number>(isCreate ? 0 : editingShift!.employer)
  const [shiftEntryForm, setShiftEntryForm] = useState<Date | null>(isCreate ? (configInfo.entry ? PutTimeOnCurrentDay(configInfo.entry) : null) : editingShift?.shiftEntry || (configInfo.entry ? PutTimeOnCurrentDay(configInfo.entry) : null))
  const [shiftExitForm, setShiftExitForm] = useState<Date | null>(isCreate ? (configInfo.exit ? PutTimeOnCurrentDay(configInfo.exit) : null) : editingShift?.shiftExit || (configInfo.exit ? PutTimeOnCurrentDay(configInfo.exit) : null))
  const [shiftBreakEntryForm, setShiftBreakEntryForm] = useState<Date | null>(isCreate ? (configInfo.configBreakEntry ? PutTimeOnCurrentDay(configInfo.configBreakEntry) : null) : editingShift?.shiftBreakEntry || (configInfo.configBreakEntry ? PutTimeOnCurrentDay(configInfo.configBreakEntry) : null))
  const [shiftBreakExitForm, setShiftBreakExitForm] = useState<Date | null>(isCreate ? (configInfo.configBreakExit ? PutTimeOnCurrentDay(configInfo.configBreakExit) : null) : editingShift?.shiftBreakExit || (configInfo.configBreakExit ? PutTimeOnCurrentDay(configInfo.configBreakExit) : null))
  const [shiftBreakForm, setShiftBreakForm] = useState<Date | null>(isCreate ? null : (editingShift?.shiftBreak || null))
  const [workedHoursForm, setWorkedHoursForm] = useState<number | null>(isCreate ? null : (editingShift?.workedHours || null))
  const [workedMinutesForm, setWorkedMinutesForm] = useState<number | null>(isCreate ? null : (editingShift?.workedMinutes || null))
  const [isHourlyRateForm, setIsHourlyRateForm] = useState(isCreate ? true : (editingShift?.isHourlyRate || true))
  const [wageForm, setWageForm] = useState(editingShift?.wage || 0)
  const [salaryForm, setSalaryForm] = useState(editingShift?.salary || 0)
  const [paidForm, setPaidForm] = useState(editingShift?.paid || false)
  const [noteForm, setNoteForm] = useState(editingShift?.note || "")

  //states to manage missing or wrong data
  const [missing, setMissing] = useState("")
  const [blockSubmit, setBlockSubmit] = useState(true)

  //states to manage modal datepicker
  const [timeType, setTimeType] = useState("")
  const [date, setDate] = useState<Date | null>(pressedDate)
  const [modalOpen, setModalOpen] = useState(false)
  const [showDelete, setShowDelete] = useState(false)

  //states to manage the animations
  const [breakOpen, setBreakOpen] = useState(false)

  useEffect(() => {
    if (employerForm > 1) {
      const companyWage = companysInfo.find(company => company.key === employerForm)!.wage
      setWageForm(companyWage)
    }
  }, [employerForm])

  //calculates the salary if changed between hourly rate and shift salary or if worked time or wage changes
  useEffect(() => {
    if (isHourlyRateForm) {
      const salary = workedHoursForm !== null || undefined ? (workedHoursForm! + workedMinutesForm! / 60) * wageForm : 0
      setSalaryForm(salary)
    }
  }, [isHourlyRateForm, wageForm, workedHoursForm, workedMinutesForm])

  //called when pressing on default entry, exit or break. Sets data to open de correct modal and edit the correct info
  const selectedTime = () => {
    switch (timeType) {
      case "entrada":
        setDate(shiftEntryForm || pressedDate)
        setShowDelete(shiftEntryForm ? true : false)
        break
      case "salida":
        setDate(shiftExitForm || (shiftEntryForm || pressedDate))
        setShowDelete(shiftExitForm ? true : false)
        break
      case "descansoEntrada":
        setDate(shiftBreakEntryForm || pressedDate)
        setShowDelete(shiftBreakEntryForm ? true : false)
      case "descansoSalida":
        setDate(shiftBreakExitForm || (shiftBreakEntryForm || pressedDate))
        setShowDelete(shiftBreakExitForm ? true : false)
    }
  }

  //takes the new time when changing entry, exit or break. and sets the new data
  const changeConfigInfo = (newDate: Date | null) => {
    if (timeType === "entrada") {
      setShiftEntryForm(newDate)
    }
    if (timeType === "salida") {
      setShiftExitForm(newDate)

      if (newDate !== null && newDate.getDate() === shiftEntryForm!.getDate() && (newDate.getHours() < shiftEntryForm!.getHours() || (newDate.getHours() === shiftEntryForm!.getHours() && newDate.getMinutes() < shiftEntryForm!.getMinutes()))) {
        setShiftEntryForm(null)
      }
    }
    if (timeType === "descansoEntrada") {
      setShiftBreakEntryForm(newDate)
    }
    if (timeType === "descansoSalida") {
      setShiftBreakExitForm(newDate)
    }
    setTimeType("")
  }

  //calculates break
  useEffect(() => {
    if (shiftBreakEntryForm && shiftBreakExitForm) {
      const { breakHours, breakMinutes } = GetBreakTime({ breakEntry: shiftBreakEntryForm, breakExit: shiftBreakExitForm })

      const breakData = breakHours < 0 ? null : new Date(pressedDate.getFullYear(), pressedDate.getMonth(), pressedDate.getDay(), breakHours, breakMinutes)
      setShiftBreakForm(breakData)
    } else {
      setShiftBreakForm(null)
    }
  }, [shiftBreakEntryForm, shiftBreakExitForm])

  //calculates the worked hours and checks or inconsistencies
  useEffect(() => {
    if (shiftEntryForm && shiftExitForm) {
      const { workedHours, workedMinutes } = getWorkedTime({
        entry: shiftEntryForm,
        exit: shiftExitForm,
        breakEntry: shiftBreakEntryForm,
        breakExit: shiftBreakExitForm
      })
      setWorkedHoursForm(workedHours)
      setWorkedMinutesForm(workedMinutes)
    } else {
      setWorkedHoursForm(null)
      setWorkedMinutesForm(null)
    }
  }, [shiftEntryForm, shiftExitForm, shiftBreakForm])

  //calls the alert when trying to delete entry, exit or break time
  const showAlert = () => {
    Alert.alert(
      '',
      translateFn("timeDeleteAlert"),
      [
        {
          text: translateFn("cancel"),
          style: 'cancel'
        },
        {
          text: 'OK',
          onPress: () => { setModalOpen(false), changeConfigInfo(null) },
          style: 'cancel'
        },
      ],
      {
        cancelable: true
      }
    )
  }

  //sets the datePicker modal title
  const modalTitle = () => {
    switch (timeType) {
      case "entrada": return translateFn("entryHour")
      case "salida": return translateFn("exitHour")
      case "descansoEntrada": return translateFn("breakStart")
      case "descansoSalida": return translateFn("breakEnd")
    }
  }

  //saves the new edited info when submiting
  const handleSubmit = () => {
    const FormData: ShiftProps = {
      key: editingShift?.key || `${new Date().getTime()}`,
      employer: companysInfo.find(emp => emp.key === employerForm)!.key,
      short: companysInfo.find(company => company.key === employerForm)!.short,
      shiftEntry: shiftEntryForm!,
      shiftExit: shiftExitForm,
      shiftBreak: shiftBreakForm,
      shiftBreakEntry: shiftBreakEntryForm,
      shiftBreakExit: shiftBreakExitForm,
      workedHours: workedHoursForm,
      workedMinutes: workedMinutesForm,
      paid: paidForm,
      isHourlyRate: isHourlyRateForm,
      wage: wageForm,
      salary: salaryForm,
      color: companysInfo.find(company => company.key === employerForm)!.color || editingShift!.color,
      note: noteForm
    }

    onSubmit(FormData)
  }

  //calls the alert if there is something wrong or missing in the input data
  const checkInfo = () => {
    if (employerForm === 0 && !shiftEntryForm) { setMissing(translateFn("noEntryEmployerAlert")!) }
    if (employerForm === 0 && shiftEntryForm) { setMissing(translateFn("noEmployerAlert")!) }
    if (employerForm !== 0 && !shiftEntryForm) { setMissing(translateFn("noEntryAlert")!) }
  }

  //checks there is no repeted shifts
  useEffect(() => {
    const currentExcluded = shifts.filter(shift => shift.key !== editingShift?.key)
    if (currentExcluded.find(shift =>
      shift.shiftEntry.getFullYear() === shiftEntryForm?.getFullYear() &&
      shift.shiftEntry.getMonth() === shiftEntryForm?.getMonth() &&
      shift.shiftEntry.getDate() === shiftEntryForm?.getDate() &&
      shift.shiftEntry.getHours() === shiftEntryForm?.getHours() &&
      shift.shiftEntry.getMinutes() === shiftEntryForm?.getMinutes()
    )) {
      setMissing(translateFn("repetedShiftAlert")!)
      setBlockSubmit(true)
    } else {
      setMissing("")
      setBlockSubmit(false)
    }
  }, [employerForm, shiftEntryForm])

  //sets the date picker mode
  const datePickerMode = () => {
    switch (timeType) {
      case "entrada": return "time"
      case "salida": return "datetime"
      case "descansoEntrada": return shiftExitForm && shiftExitForm.getDate() === pressedDate.getDate() ? "time" : "datetime"
      case "descansoSalida": return shiftExitForm && shiftExitForm.getDate() === pressedDate.getDate() ? "time" : "datetime"
    }
  }

  //sets the minimum date for date picker
  const minDate = () => {
    switch (timeType) {
      case "salida": return shiftEntryForm || pressedDate
      case "descansoEntrada": return shiftEntryForm || shiftBreakEntryForm || pressedDate
      case "descansoSalida": return shiftBreakEntryForm || (shiftEntryForm || pressedDate)
    }
  }

  //sets the maximum date for date picker
  const maxDate = () => {
    switch (timeType) {
      case "entrada": return shiftExitForm || new Date(pressedDate.getFullYear(), pressedDate.getMonth(), pressedDate.getDate() + 2, 23, 59)
      case "salida": return new Date(pressedDate.getFullYear(), pressedDate.getMonth(), pressedDate.getDate() + 2, 23, 59)
      case "descansoEntrada": return shiftExitForm || undefined
      case "descansoSalida": return shiftExitForm || new Date(pressedDate.getFullYear(), pressedDate.getMonth(), pressedDate.getDate() + 2, 23, 59)
    }
  }

  //manage the break animations
  const breakValue = useRef(new Animated.Value(breakOpen ? 1 : 0)).current
  const handlePress = () => {
    Animated.parallel([
      Animated.timing(breakValue, {
        toValue: breakOpen ? 0 : 1,
        duration: 300,
        useNativeDriver: false,
      })
    ]).start();
    setBreakOpen(!breakOpen);
  }
  const heightChange = {
    maxHeight: breakValue.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 200]
    })
  }
  const rotateArrow = {
    transform: [
      {
        rotate: breakValue.interpolate({
          inputRange: [0, 1],
          outputRange: ["-90deg", "0deg"]
        })
      }
    ]
  }

  return (
    <View style={styles.container}>
      <Link
        to={`/calendar/shifts/${pressedDate}`}
        activeOpacity={0.7}
        style={styles.botonCerrar}
        underlayColor="none"
      >
        <ButtonSmall color={theme.colors.grisClaro}>
          <Text style={styles.textButtonSmall}>x</Text>
        </ButtonSmall>
      </Link>

      <View>
        <Text style={styles.textoConf}>{isCreate ? translateFn("newShift") : translateFn("editShifts")} {firstLetterUpper(pressedDate.toLocaleDateString(lenguage, { month: 'short' }))} / {pressedDate.toLocaleDateString(lenguage, { day: "numeric" })}</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
        <View style={styles.empleador}>
          <View style={styles.line}>
            <Text style={styles.textLine}>{translateFn("employer")}:</Text>

            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={employerForm}
                onValueChange={newValue => setEmployerForm(newValue)}
                style={styles.picker}
                accessibilityLabel={translateFn("selectEmployer")}
                mode='dropdown'
              >
                {isCreate && <Picker.Item style={styles.pickerItem} label={translateFn("selectEmployer")} value={0} enabled={false} />}
                {companysInfo.map(employer =>
                  <Picker.Item style={styles.pickerItem} label={employer.name} value={employer.key} key={employer.key} />
                )}
              </Picker>
            </View>
          </View>

          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.line}
            onPress={() => { setTimeType("entrada"), setModalOpen(true) }}
          >
            <Text style={styles.textLine}>{translateFn("entryHour")}:</Text>
            <View >
              <Text style={styles.textLine}>{shiftEntryForm ? `${shiftEntryForm.getHours()}:${formattedMinutes(shiftEntryForm)}` : "-"}</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.line}
            disabled={shiftEntryForm === null}
            onPress={() => { setTimeType("salida"), setModalOpen(true) }}
          >
            <Text style={styles.textLine}>{translateFn("exitHour")}:</Text>
            <View >
              <Text style={styles.textLine}>
                {shiftExitForm && shiftEntryForm ?
                  (shiftExitForm.getDate() !== shiftEntryForm.getDate() ?
                    `${firstLetterUpper(shiftExitForm.toLocaleDateString(lenguage, { month: 'short' }))} ${shiftExitForm.getDate()} (${textDay(shiftExitForm, lenguage)})  ` : "")
                  : ""
                }
                {shiftExitForm ? `${shiftExitForm.getHours()}:${formattedMinutes(shiftExitForm)}` : "-"}
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.lineCenter}
            onPress={() => handlePress()}
          >
            <Animated.View style={[rotateArrow]}>
              <Icon
                name="caretdown"
                color={theme.colors.verdeBase}
                size={20}
              />
            </Animated.View>
            <Text style={styles.textLine}>{translateFn("break")}</Text>
            <Text style={styles.break}>{shiftBreakForm ? `${shiftBreakForm.getHours()}:${formattedMinutes(shiftBreakForm)}` : "0"}</Text>
          </TouchableOpacity>
          <Animated.View style={[styles.heightAuto, heightChange]}>
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.line}
              disabled={shiftEntryForm === null}
              onPress={() => { setTimeType("descansoEntrada"), setModalOpen(true) }}
            >
              <Text style={styles.textLineCenter}>{translateFn("breakStart")}:</Text>
              <View >
                <Text style={styles.textLine}>{shiftBreakEntryForm ? `${shiftBreakEntryForm.getHours()}:${formattedMinutes(shiftBreakEntryForm)}` : "-"}</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.line}
              disabled={shiftBreakEntryForm === null}
              onPress={() => { setTimeType("descansoSalida"), setModalOpen(true) }}
            >
              <Text style={styles.textLine}>{translateFn("breakEnd")}:</Text>
              <View >
                <Text style={styles.textLine}>{shiftBreakExitForm ? `${shiftBreakExitForm.getHours()}:${formattedMinutes(shiftBreakExitForm)}` : "-"}</Text>
              </View>
            </TouchableOpacity>
          </Animated.View>

          <View style={styles.line}>
            <Text style={styles.textLine}>{translateFn("workedHours")}:</Text>
            <Text style={styles.textLine}>{(workedHoursForm !== null || undefined) && (workedMinutesForm !== null || undefined) ? `${workedHoursForm}:${formattedMinutesNumber(workedMinutesForm!)}` : "-"}</Text>
          </View>

          <View style={styles.lineLeft}>
            <Text style={styles.textLine}>{translateFn("paid")}</Text>
            <Slider setValue={setPaidForm} value={paidForm} />
          </View>

          <TextInput
            value={noteForm}
            onChangeText={setNoteForm}
            style={styles.textInput}
            multiline={true}
            numberOfLines={2}
            placeholder={translateFn("note")}
            maxLength={70}
            scrollEnabled={true}
          />
        </View>

        <Modal
          visible={modalOpen}
          onShow={selectedTime}
          transparent={true}
          animationType="fade"
        >
          <View style={styles.modalContainer}>
            <View style={styles.modal}>
              <View style={styles.modalTitleContainer}>
                <Text style={styles.modalTitle}>{modalTitle()}</Text>
                {showDelete && <Icon
                  style={styles.delete}
                  name='delete'
                  color={theme.colors.rojoBin}
                  size={20}
                  onPress={() => { showAlert() }}
                />}
              </View>

              <DatePicker
                theme='light'
                mode={datePickerMode()}
                minimumDate={minDate()}
                maximumDate={maxDate()}
                locale={lenguage}
                date={date!}
                onDateChange={setDate}
                dividerColor={theme.colors.verdeBase}
                is24hourSource={timeType === "descanso" ? "locale" : "device"}
              />

              <View style={styles.modalButtons}>
                <TouchableOpacity activeOpacity={0.7} onPress={() => { setModalOpen(false), setTimeType("") }}>
                  <Text style={styles.modalButton}>{translateFn("cancel")}</Text>
                </TouchableOpacity>
                <TouchableOpacity activeOpacity={0.7} onPress={() => { setModalOpen(false), changeConfigInfo(date) }}>
                  <Text style={styles.modalButton}>{translateFn("save")}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {missing &&
          <Text style={styles.textAlert}>{missing}</Text>
        }

        <TouchableOpacity style={styles.boton} onPress={() => checkInfo()}>
          <Button
            margintop={20}
            press={() => handleSubmit()}
            block={employerForm === 0 || !shiftEntryForm || blockSubmit ? true : false}
            to={`/calendar/shifts/${pressedDate}`}
            color={theme.colors.verdeBoton}
          >
            <Text style={styles.textoBoton}>{isCreate ? translateFn("createNewShift") : translateFn("saveChanges")}</Text>
          </Button>
        </TouchableOpacity>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 8,
    justifyContent: "center"
  },
  textoConf: {
    alignSelf: "center",
    color: theme.colors.grisOscuro,
    fontWeight: '800',
    fontSize: theme.fontSizes.F20,
  },
  botonCerrar: {
    position: "absolute",
    top: 20,
    right: 20,
    width: "auto"
  },
  empleador: {
    borderTopWidth: 2,
    marginTop: 24,
    marginBottom: 24
  },
  line: {
    paddingHorizontal: 15,
    paddingVertical: 12,
    flexDirection: "row",
    justifyContent: 'space-between',
    alignItems: "center",
    borderBottomWidth: 1,
    borderColor: theme.colors.grisClaro
  },
  lineLeft: {
    paddingHorizontal: 15,
    paddingVertical: 12,
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    gap: 20
  },
  lineCenter: {
    position: "relative",
    paddingHorizontal: 15,
    paddingVertical: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    borderBottomWidth: 1,
    borderColor: theme.colors.grisClaro,
    gap: 12
  },
  textLine: {
    fontSize: theme.fontSizes.F18,
    fontWeight: '400',
    textAlign: "right"
  },
  break: {
    position: "absolute",
    right: 14,
    fontSize: theme.fontSizes.F18,
    fontWeight: '400'
  },
  textLineCenter: {
    fontSize: theme.fontSizes.F18,
    fontWeight: "400",
    textAlign: "center"
  },
  textInput: {
    borderColor: theme.colors.grisClaro,
    borderWidth: 1,
    marginHorizontal: 15,
    paddingHorizontal: 8,
    paddingVertical: 4,
    fontSize: theme.fontSizes.F18,
    textAlignVertical: "top",
    maxHeight: 60
  },
  heightAuto: {
    height: "auto",
    overflow: "hidden"
  },
  row: {
    flexDirection: "row"
  },
  textAlert: {
    fontSize: theme.fontSizes.F18,
    fontWeight: "500",
    textTransform: "uppercase",
    color: theme.colors.rojoBin,
    backgroundColor: theme.colors.rojoClaro,
    paddingVertical: 10,
    marginHorizontal: 20,
    marginTop: -10,
    marginBottom: 10,
    height: "auto",
    textAlign: "center",
    textAlignVertical: "center"
  },
  boton: {
    marginTop: -20,
    marginBottom: 10
  },
  modalContainer: {
    flex: 1,
    marginTop: Platform.OS === "ios" ? Constants.statusBarHeight + 10 : Constants.statusBarHeight + 12,
    marginBottom: 76,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modal: {
    alignItems: "center",
    backgroundColor: "white",
    padding: 40,
    borderRadius: 10
  },
  modalTitleContainer: {
    alignSelf: "flex-start",
    flexDirection: "row",
    justifyContent: "space-between",
    width: "70%"
  },
  modalTitle: {
    fontSize: 24
  },
  delete: {
    position: "relative",
    top: 7
  },
  view: {
    height: 180
  },
  modalButtons: {
    flexDirection: "row",
    gap: 28,
    alignSelf: "flex-end"
  },
  modalButton: {
    fontSize: theme.fontSizes.F18
  },
  slide_exterior: {
    flexDirection: "row",
    borderRadius: 15,
    width: 40,
    height: 26,
    alignItems: "center",
    position: "relative",
    top: 1,
  },
  slide_interior: {
    backgroundColor: "#fff",
    borderColor: theme.colors.grisMasClaro,
    borderWidth: 1,
    width: 22,
    height: 22,
    borderRadius: 12,
    margin: 2
  },
  pickerContainer: {
    flex: 1,
    height: 20,
    justifyContent: "center",
  },
  picker: {
    marginLeft: 0,
    transform: [{ translateX: 18 }]
  },
  pickerItem: {
    fontSize: 18,
    color: "black"
  },
  textoBoton: {
    fontSize: theme.fontSizes.F18,
    fontWeight: "500"
  },
  textButtonSmall: {
    fontSize: theme.fontSizes.F20,
    fontWeight: "500",
    lineHeight: theme.fontSizes.F20
  },
  scrollView: {
    maxHeight: theme.heigth.shiftNewEditScrollView
  }
})
