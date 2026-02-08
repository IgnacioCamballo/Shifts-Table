import React, { useEffect, useRef, useState } from 'react'
import { StyleSheet, Text, TextInput, TouchableOpacity, View, ScrollView, Animated, Dimensions, Platform } from 'react-native'
import { Link, Navigate } from 'react-router-native'
import { Picker } from '@react-native-picker/picker'
import RNPickerSelect from 'react-native-picker-select'

import useCalendar from '@/hooks/useCalendar'
import { ShiftProps } from '@/types'
import theme from '@/theme/theme'
import { firstLetterUpper, formattedMinutes, formattedMinutesNumber, textDay, translate } from '@/utils'
import { GetBreakTime, getWorkedTime } from '@/utils/datesCompare'

import Slider from '@/components/Atoms/Slider'
import ButtonSmall from '@/components/Atoms/Buttons/ButtonSmall'
import Button from '@/components/Atoms/Buttons/Button'
import DropDownAutoHeight from '@/components/Molecules/DropDownAutoHeight'
import ModalDatePicker from '@/components/Molecules/ModalDatePicker'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

type ShiftFormProps = {
  isCreate: boolean,
  editingShift?: ShiftProps,
  pressedDate: Date,
  onSubmit: (FormData: ShiftProps) => void
}

let screenWidth = Dimensions.get("window").width

export default function ShiftForm({ isCreate, editingShift, pressedDate, onSubmit }: ShiftFormProps) {
  const { configInfo, companysInfo, shifts, lenguage } = useCalendar()

  //gets variable heigth for the screen without statusbar
  const insets = useSafeAreaInsets()
  const newEditHeight = theme.heigth.screenHeight - insets.top - insets.bottom - theme.heigth.shiftNewEditScrollView


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
  const [isHourlyRateForm, setIsHourlyRateForm] = useState<boolean>(isCreate ? true : editingShift!.isHourlyRate!)
  const [wageForm, setWageForm] = useState(editingShift?.wage || 0)
  const [salaryForm, setSalaryForm] = useState(editingShift?.salary || 0)
  const [paidForm, setPaidForm] = useState(editingShift?.paid || false)
  const [noteForm, setNoteForm] = useState(editingShift?.note || "")

  //states to manage missing or wrong data
  const [missing, setMissing] = useState("")
  const [blockSubmit, setBlockSubmit] = useState(true)

  //states for dropdowns
  const [breakOpen, setBreakOpen] = useState(false)
  const [salaryOpen, setSalaryOpen] = useState(false)

  //states to manage modal datepicker
  const [timeType, setTimeType] = useState("")
  const [modalOpen, setModalOpen] = useState(false)

  useEffect(() => {
    if (employerForm > 1) {
      const company = companysInfo.find(company => company.key == employerForm)
      setWageForm(company?.wage || 0)
    }
  }, [employerForm])

  //calculates the salary if changed between hourly rate and shift salary or if worked time or wage changes
  useEffect(() => {
    if (isHourlyRateForm) {
      const salary = workedHoursForm !== null || undefined ? (workedHoursForm! + workedMinutesForm! / 60) * wageForm : 0
      setSalaryForm(salary)
    }
  }, [isHourlyRateForm, wageForm, workedHoursForm, workedMinutesForm])

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

  //saves the new edited info when submiting
  const handleSubmit = () => {
    const FormData: ShiftProps = {
      key: editingShift?.key || `${new Date().getTime()}`,
      employer: companysInfo.find(emp => emp.key == employerForm)!.key,
      short: companysInfo.find(company => company.key == employerForm)!.short,
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
      color: companysInfo.find(company => company.key == employerForm)!.color || editingShift!.color,
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
    if (employerForm) {
      const currentExcluded = shifts.filter(shift =>
        shift.key !== editingShift?.key &&
        shift.shiftEntry.getFullYear() === shiftEntryForm?.getFullYear() &&
        shift.shiftEntry.getMonth() === shiftEntryForm?.getMonth() &&
        shift.shiftEntry.getDate() === shiftEntryForm?.getDate()
      )
      if (currentExcluded.some(shift =>
        shift.employer === employerForm &&
        shift.shiftEntry.getHours() === shiftEntryForm?.getHours() &&
        shift.shiftEntry.getMinutes() === shiftEntryForm?.getMinutes()
      )) {
        setMissing(translateFn("repetedShiftAlert")!)
        setBlockSubmit(true)
        return
      }
    }
    setMissing("")
    setBlockSubmit(false)
  }, [employerForm, shiftEntryForm])

  //Animation of payment method selector
  const value = useRef(new Animated.Value(isHourlyRateForm ? 0 : 1)).current
  const handlePress = (boolean: boolean) => {
    Animated.parallel([
      Animated.timing(value, {
        toValue: boolean ? 0 : 1,
        duration: 500,
        useNativeDriver: false,
      })
    ]).start();
    setIsHourlyRateForm(boolean);
  }
  const colorChange = {
    backgroundColor: value.interpolate({
      inputRange: [0, 1],
      outputRange: ["#fff", theme.colors.azulClaro]
    })
  }
  const reversecolorChange = {
    backgroundColor: value.interpolate({
      inputRange: [0, 1],
      outputRange: [theme.colors.azulClaro, "#fff"]
    })
  }
  const changeX = {
    transform: [{
      translateX: value.interpolate({
        inputRange: [0, 1],
        outputRange: [0, -screenWidth]
      })
    }]
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

      <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: newEditHeight }}>
        <View style={styles.empleador}>
          <View style={styles.line}>
            <Text style={styles.textLine}>{translateFn("employer")}:</Text>

            {Platform.OS === 'ios' ? (
              <View style={styles.pickerContainerIos}>
                <RNPickerSelect
                  value={employerForm}
                  onValueChange={newValue => setEmployerForm(newValue)}
                  items={[
                    {label: translateFn("selectEmployer") || "Select Employer", value: 0},
                    ...companysInfo.map(employer => ({
                      label: employer.name,
                      value: employer.key,
                      key: employer.key
                    })),
                    ...(isCreate ? [{label: translateFn("createNewEmployerTab") || "Create New Employer", value: 1}] : [])
                  ]}
                  placeholder={{}}
                  style={{ inputIOS: styles.pickerInput }}
                  useNativeAndroidPickerStyle={false}
                />
                {employerForm === 1 && <Navigate to={`/config/newEmployer/${pressedDate}`} />}

              </View>
            ) : (
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
                  {isCreate && <Picker.Item style={styles.pickerItem} label={translateFn("createNewEmployerTab")} value={1} />}
                </Picker>
                {employerForm === 1 && <Navigate to={`/config/newEmployer/${pressedDate}`} />}
              </View>
            )}
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
            disabled={shiftEntryForm === null && shiftExitForm === null}
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

          <DropDownAutoHeight
            title={translateFn("break")!}
            textRight={shiftBreakForm ? `${shiftBreakForm.getHours()}:${formattedMinutes(shiftBreakForm)}` : "0"}
            duration={300}
            maxHeight={200}
            arrowColor={configInfo.baseColor}
            isOpen={breakOpen}
            setIsOpen={setBreakOpen}
          >
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.line}
              disabled={shiftEntryForm === null && shiftBreakEntryForm === null}
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
              disabled={shiftBreakEntryForm === null && shiftBreakExitForm === null}
              onPress={() => { setTimeType("descansoSalida"), setModalOpen(true) }}
            >
              <Text style={styles.textLine}>{translateFn("breakEnd")}:</Text>
              <View >
                <Text style={styles.textLine}>{shiftBreakExitForm ? `${shiftBreakExitForm.getHours()}:${formattedMinutes(shiftBreakExitForm)}` : "-"}</Text>
              </View>
            </TouchableOpacity>
          </DropDownAutoHeight>

          <View style={styles.line}>
            <Text style={styles.textLine}>{translateFn("workedHours")}:</Text>
            <Text style={styles.textLine}>{(workedHoursForm !== null || undefined) && (workedMinutesForm !== null || undefined) ? `${workedHoursForm}:${formattedMinutesNumber(workedMinutesForm!)}` : "-"}</Text>
          </View>

          <DropDownAutoHeight
            title={translateFn("salary")!}
            textRight={salaryForm && !salaryOpen ? `$ ${Math.floor(salaryForm * 100) / 100}` : ""}
            duration={300}
            maxHeight={200}
            arrowColor={configInfo.baseColor}
            isOpen={salaryOpen}
            setIsOpen={setSalaryOpen}
          >
            <View style={[styles.line, styles.salaryPicker]}>
              <Animated.Text onPress={() => handlePress(true)} style={[styles.textLine, styles.textHourly, reversecolorChange]}>{translateFn("hourly")}</Animated.Text>
              <Animated.Text onPress={() => handlePress(false)} style={[styles.textLine, styles.textPerShift, colorChange]}>{translateFn("perTurn")}</Animated.Text>
            </View>

            <Animated.View style={[{ flexDirection: "row", gap: 16 }, changeX]}>
              <View style={styles.line}>
                <View style={styles.salaryLine}>
                  <Text style={styles.textLine}>{translateFn("hourlyWage")}: $ </Text>
                  <TextInput
                    style={[styles.textLine, styles.inputBox]}
                    inputMode='numeric'
                    keyboardType='numeric'
                    onChangeText={(e) => setWageForm(parseInt(e || "0"))}
                    value={wageForm.toString()}
                    placeholder="0"
                    placeholderTextColor={theme.colors.grisMedio}
                  />
                </View>

                <Text style={styles.textLine}>{translateFn("total")}: $ {Math.floor(salaryForm * 100) / 100}</Text>
              </View>

              <View style={styles.line}>
                <Text style={styles.textLine}>{translateFn("shiftSalary")}:</Text>

                <View style={styles.salaryLine}>
                  <Text style={styles.textLine}>$ </Text>
                  <TextInput
                    style={[styles.textLine, styles.inputBox]}
                    inputMode='numeric'
                    keyboardType='numeric'
                    onChangeText={(e) => setSalaryForm(parseInt(e || "0"))}
                    value={(Math.floor(salaryForm * 100) / 100).toString()}
                    placeholder="0"
                    placeholderTextColor={theme.colors.grisMedio}
                  />
                </View>
              </View>
            </Animated.View>

            <View style={styles.lineLeft}>
              <Text style={styles.textLine}>{translateFn("paid")}</Text>
              <Slider setValue={setPaidForm} value={paidForm} />
            </View>
          </DropDownAutoHeight>

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

        <ModalDatePicker
          entry={shiftEntryForm} setEntry={setShiftEntryForm}
          exit={shiftExitForm} setExit={setShiftExitForm}
          entryBreak={shiftBreakEntryForm} setEntryBreak={setShiftBreakEntryForm}
          exitBreak={shiftBreakExitForm} setExitBreak={setShiftBreakExitForm}
          modalOpen={modalOpen} setModalOpen={setModalOpen}
          timeType={timeType} setTimeType={setTimeType}
          pressedDate={pressedDate}
        />

        {missing &&
          <Text style={styles.textAlert}>{missing}</Text>
        }

        <TouchableOpacity style={styles.boton} onPress={() => checkInfo()}>
          <Button
            margintop={20}
            press={() => handleSubmit()}
            block={employerForm === 0 || !shiftEntryForm || blockSubmit ? true : false}
            to={`/calendar/shifts/${pressedDate}`}
            color={configInfo.buttonsColor}
          >
            <Text style={styles.textoBoton}>{isCreate ? translateFn("createNewShift") : translateFn("saveChanges")}</Text>
          </Button>
        </TouchableOpacity>

        <View style={{ height: 20 }} />
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
    width: "100%",
    paddingHorizontal: 15,
    paddingVertical: 12,
    flexDirection: "row",
    justifyContent: 'space-between',
    alignItems: "center",
    borderBottomWidth: 1,
    borderColor: theme.colors.grisClaro
  },
  salaryLine: {
    flexDirection: "row",
    alignItems: "center"
  },
  salaryPicker: {
    justifyContent: "center",
    paddingVertical: 8,
    paddingBottom: 0,
    borderBottomWidth: 0
  },
  lineLeft: {
    paddingHorizontal: 15,
    paddingVertical: 12,
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    gap: 20,
    borderBottomWidth: 1,
    borderColor: theme.colors.grisClaro
  },
  textLine: {
    fontSize: theme.fontSizes.F18,
    fontWeight: '400',
    textAlign: "right"
  },
  inputBox: {
    borderWidth: 0.5,
    borderColor: theme.colors.gris,
    paddingHorizontal: 8,
    paddingVertical: 2,
    textAlign: "center"
  },
  textHourly: {
    borderWidth: 1,
    borderColor: theme.colors.grisClaro,
    paddingVertical: 4,
    paddingLeft: 12,
    paddingRight: 10,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },
  bglblue: {
    backgroundColor: theme.colors.azulClaro,
  },
  textPerShift: {
    borderWidth: 1,
    borderColor: theme.colors.grisClaro,
    paddingVertical: 4,
    paddingLeft: 10,
    paddingRight: 12,
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12
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
    marginTop: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    fontSize: theme.fontSizes.F18,
    textAlignVertical: "top",
    maxHeight: 60
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
  pickerContainer: {
    flex: 1,
    height: 20,
    justifyContent: "center",
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
    transform: [{ translateX: 18 }]
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
    maxWidth: 300,
    color: 'black',
    textAlign: 'center',
    textDecorationColor: "black",
    borderRadius: 12,
  },
  textoBoton: {
    fontSize: theme.fontSizes.F18,
    fontWeight: "500"
  },
  textButtonSmall: {
    fontSize: theme.fontSizes.F20,
    fontWeight: "500",
    lineHeight: theme.fontSizes.F20
  }
})
