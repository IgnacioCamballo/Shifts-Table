import React, { useEffect, useRef, useState } from 'react'
import { StyleSheet, Text, TextInput, TouchableOpacity, View, ScrollView, Animated, Dimensions, Platform } from 'react-native'
import { Picker } from '@react-native-picker/picker'
import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'

import useCalendar from '@/hooks/useCalendar'
import useKeyboardBottomSpace from '@/hooks/useKeyboardBottomSpace'
import { ConfigInfo, OvertimeRateType, RootStackParamList, ShiftProps } from '@/types'
import theme from '@/theme/theme'
import { firstLetterUpper, formattedMinutes, formattedMinutesNumber, textDay, translate } from '@/utils'
import { GetBreakTime, getWorkedTime, normalizeShiftTimes, onDay } from '@/utils/datesCompare'
import { DEFAULT_OVERTIME_RATE, DEFAULT_OVERTIME_RATE_TYPE, calculateShiftSalary, getOvertimeTime, getTotalHours } from '@/utils/overtime'

import Slider from '@/components/Atoms/Slider'
import ButtonSmall from '@/components/Atoms/Buttons/ButtonSmall'
import Button from '@/components/Atoms/Buttons/Button'
import DropDownAutoHeight from '@/components/Molecules/DropDownAutoHeight'
import IosPickerModal from '@/components/Molecules/IosPickerModal'
import ModalDatePicker from '@/components/Molecules/ModalDatePicker'
import OvertimeRateTypePicker from '@/components/Molecules/OvertimeRateTypePicker'

type ShiftFormProps = {
  isCreate: boolean,
  editingShift?: ShiftProps,
  pressedDate: Date,
  onSubmit: (FormData: ShiftProps) => void
}

let screenWidth = Dimensions.get("window").width
//space kept between the focused input and the edge of the visible form
const INPUT_VISIBLE_MARGIN = 32
//the form shrinks while the keyboard animates, so the input is checked after it has settled
const KEYBOARD_SETTLE_DELAY = 350

/**
 * Times a shift form starts with. Default times fill a field only when it has exactly one: with
 * several the field starts empty and the user picks one. A new shift starts only with default times,
 * an existing shift keeps its own times and only gets a default for the ones it does not have.
 * @param pressedDate day the shift is being created or edited on
 */
function getInitialTimes({ isCreate, editingShift, configInfo, pressedDate }: {
  isCreate: boolean,
  editingShift?: ShiftProps,
  configInfo: ConfigInfo,
  pressedDate: Date
}) {
  const onlyDefault = (times: Date[] | null) => times && times.length === 1 ? onDay(pressedDate, times[0]) : null

  const existing = isCreate ? undefined : editingShift
  const times = {
    entry: existing?.shiftEntry || onlyDefault(configInfo.entry),
    exit: existing?.shiftExit || onlyDefault(configInfo.exit),
    breakEntry: existing?.shiftBreakEntry || onlyDefault(configInfo.configBreakEntry),
    breakExit: existing?.shiftBreakExit || onlyDefault(configInfo.configBreakExit),
    //overtime has no default times, a new shift starts without it
    overtimeEntry: existing?.overtimeEntry || null,
    overtimeExit: existing?.overtimeExit || null
  }

  const filledFromDefaults = !existing ||
    times.exit !== existing.shiftExit ||
    times.breakEntry !== existing.shiftBreakEntry ||
    times.breakExit !== existing.shiftBreakExit

  //default exit and break are put after the entry, so they are on the next day if their clock time is earlier
  return filledFromDefaults ? normalizeShiftTimes({ pressedDate, ...times }) : times
}

export default function ShiftForm({ isCreate, editingShift, pressedDate, onSubmit }: ShiftFormProps) {
  const { configInfo, companysInfo, shifts, lenguage } = useCalendar()
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>()

  //bottom space follows the keyboard, the footer is absolute so its height is the minimum space kept
  const { ref: bottomSpaceRef, style: bottomSpaceStyle } = useKeyboardBottomSpace(theme.heigth.footer)

  //with the keyboard open the form is small and has several inputs, so the focused one is scrolled into view
  const scrollRef = useRef<ScrollView>(null)
  const scrollY = useRef(0)
  const wageInputRef = useRef<TextInput>(null)
  const salaryInputRef = useRef<TextInput>(null)
  const overtimeRateInputRef = useRef<TextInput>(null)
  const noteInputRef = useRef<TextInput>(null)

  const scrollInputIntoView = (input: TextInput | null) => {
    setTimeout(() => {
      scrollRef.current?.getNativeScrollRef()?.measureInWindow((_x, viewportY, _width, viewportHeight) => {
        input?.measureInWindow((_inputX, inputY, _inputWidth, inputHeight) => {
          const hiddenBelow = inputY + inputHeight + INPUT_VISIBLE_MARGIN - (viewportY + viewportHeight)
          const hiddenAbove = viewportY - (inputY - INPUT_VISIBLE_MARGIN)
          if (hiddenBelow > 0) {
            scrollRef.current?.scrollTo({ y: scrollY.current + hiddenBelow, animated: true })
          } else if (hiddenAbove > 0) {
            scrollRef.current?.scrollTo({ y: Math.max(scrollY.current - hiddenAbove, 0), animated: true })
          }
        })
      })
    }, KEYBOARD_SETTLE_DELAY)
  }

  //this way avoid of calling useCalendar in utils and translate can be used inside if functions
  function translateFn(text: string) {
    return translate({ text, lenguage })
  }

  function normalizeDecimalText(text: string) {
    const normalized = text.replace(/,/g, '.').replace(/[^\d.]/g, '')

    if (normalized === '') {
      return ''
    }

    const [integerPart, ...decimalParts] = normalized.split('.')
    const fixedIntegerPart = integerPart === '' ? '0' : integerPart

    if (decimalParts.length === 0) {
      return normalized.endsWith('.') ? `${fixedIntegerPart}.` : fixedIntegerPart
    }

    const decimalPart = decimalParts.join('').slice(0, 2)
    return `${fixedIntegerPart}.${decimalPart}`
  }

  function formatDecimalText(value: number) {
    return value.toFixed(2).replace(/\.00$/, '').replace(/(\.\d)0$/, '$1')
  }

  //times the form starts with, calculated once
  const [initialTimes] = useState(() => getInitialTimes({ isCreate, editingShift, configInfo, pressedDate }))

  //states to manage the form data
  const [employerForm, setEmployerForm] = useState<number>(isCreate ? 0 : editingShift!.employer)
  const [shiftEntryForm, setShiftEntryForm] = useState<Date | null>(initialTimes.entry)
  const [shiftExitForm, setShiftExitForm] = useState<Date | null>(initialTimes.exit)
  const [shiftBreakEntryForm, setShiftBreakEntryForm] = useState<Date | null>(initialTimes.breakEntry)
  const [shiftBreakExitForm, setShiftBreakExitForm] = useState<Date | null>(initialTimes.breakExit)
  const [overtimeEntryForm, setOvertimeEntryForm] = useState<Date | null>(initialTimes.overtimeEntry)
  const [overtimeExitForm, setOvertimeExitForm] = useState<Date | null>(initialTimes.overtimeExit)
  //how the overtime is paid in this shift, it starts as the employer's and the user can change it here
  const [overtimeRateTypeForm, setOvertimeRateTypeForm] = useState<OvertimeRateType>(editingShift?.overtimeRateType ?? DEFAULT_OVERTIME_RATE_TYPE)
  const [overtimeRateForm, setOvertimeRateForm] = useState(editingShift?.overtimeRate ?? DEFAULT_OVERTIME_RATE)
  const [overtimeRateInput, setOvertimeRateInput] = useState(formatDecimalText(editingShift?.overtimeRate ?? DEFAULT_OVERTIME_RATE))
  const [shiftBreakForm, setShiftBreakForm] = useState<Date | null>(isCreate ? null : (editingShift?.shiftBreak || null))
  const [workedHoursForm, setWorkedHoursForm] = useState<number | null>(isCreate ? null : (editingShift?.workedHours || null))
  const [workedMinutesForm, setWorkedMinutesForm] = useState<number | null>(isCreate ? null : (editingShift?.workedMinutes || null))
  const [isHourlyRateForm, setIsHourlyRateForm] = useState<boolean>(isCreate ? true : editingShift!.isHourlyRate!)
  const [wageForm, setWageForm] = useState(editingShift?.wage || 0)
  const [salaryForm, setSalaryForm] = useState(editingShift?.salary || 0)
  const [wageInput, setWageInput] = useState(formatDecimalText(editingShift?.wage || 0))
  const [salaryInput, setSalaryInput] = useState(formatDecimalText(editingShift?.salary || 0))
  const [paidForm, setPaidForm] = useState(editingShift?.paid || false)
  const [noteForm, setNoteForm] = useState(editingShift?.note || "")

  //overtime time and the parts of the salary, calculated from the form data on every render
  const overtimeTime = getOvertimeTime({ overtimeEntry: overtimeEntryForm, overtimeExit: overtimeExitForm })
  const overtimeHoursForm = overtimeTime?.overtimeHours ?? null
  const overtimeMinutesForm = overtimeTime?.overtimeMinutes ?? null
  const totalHours = getTotalHours({
    workedHours: workedHoursForm,
    workedMinutes: workedMinutesForm,
    overtimeHours: overtimeHoursForm,
    overtimeMinutes: overtimeMinutesForm
  })
  const salaryParts = calculateShiftSalary({
    workedHours: workedHoursForm,
    workedMinutes: workedMinutesForm,
    wage: wageForm,
    overtimeHours: overtimeHoursForm,
    overtimeMinutes: overtimeMinutesForm,
    overtimeRateType: overtimeRateTypeForm,
    overtimeRate: overtimeRateForm
  })

  //states to manage missing or wrong data
  const [missing, setMissing] = useState("")
  const [blockSubmit, setBlockSubmit] = useState(true)

  //states for dropdowns
  const [breakOpen, setBreakOpen] = useState(false)
  const [salaryOpen, setSalaryOpen] = useState(false)
  const [overtimeOpen, setOvertimeOpen] = useState(false)

  //states to manage modal datepicker
  const [timeType, setTimeType] = useState("")
  const [modalOpen, setModalOpen] = useState(false)

  //when the user changes a time the others are rearranged: the entry is on the shift day, the exit and the break
  //go after it (the next day if their clock time is earlier) and a break outside the shift is removed.
  //Skipped on load so opening an existing shift never changes its times
  const isFirstRun = useRef(true)
  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false
      return
    }

    const normalized = normalizeShiftTimes({
      pressedDate,
      entry: shiftEntryForm,
      exit: shiftExitForm,
      breakEntry: shiftBreakEntryForm,
      breakExit: shiftBreakExitForm,
      overtimeEntry: overtimeEntryForm,
      overtimeExit: overtimeExitForm
    })

    if (normalized.entry?.getTime() !== shiftEntryForm?.getTime()) setShiftEntryForm(normalized.entry)
    if (normalized.exit?.getTime() !== shiftExitForm?.getTime()) setShiftExitForm(normalized.exit)
    if (normalized.breakEntry?.getTime() !== shiftBreakEntryForm?.getTime()) setShiftBreakEntryForm(normalized.breakEntry)
    if (normalized.breakExit?.getTime() !== shiftBreakExitForm?.getTime()) setShiftBreakExitForm(normalized.breakExit)
    if (normalized.overtimeEntry?.getTime() !== overtimeEntryForm?.getTime()) setOvertimeEntryForm(normalized.overtimeEntry)
    if (normalized.overtimeExit?.getTime() !== overtimeExitForm?.getTime()) setOvertimeExitForm(normalized.overtimeExit)
  }, [shiftEntryForm, shiftExitForm, shiftBreakEntryForm, shiftBreakExitForm, overtimeEntryForm, overtimeExitForm])

  //an existing shift keeps its own overtime pay when it is just opened, the first time the employer is read
  const isFirstEmployerRun = useRef(true)
  useEffect(() => {
    if (employerForm > 1) {
      const company = companysInfo.find(company => company.key == employerForm)
      setWageForm(company?.wage || 0)
      setWageInput(formatDecimalText(company?.wage || 0))

      //the overtime pay of the employer is the one the shift starts with, the user can change it in the shift
      const keepSavedOvertimeRate = !isCreate && isFirstEmployerRun.current && editingShift?.overtimeRate !== undefined
      if (!keepSavedOvertimeRate) {
        const employerOvertimeRate = company?.overtimeRate ?? DEFAULT_OVERTIME_RATE
        setOvertimeRateTypeForm(company?.overtimeRateType ?? DEFAULT_OVERTIME_RATE_TYPE)
        setOvertimeRateForm(employerOvertimeRate)
        setOvertimeRateInput(formatDecimalText(employerOvertimeRate))
      }
      isFirstEmployerRun.current = false
    } else if (employerForm === 1) { //if employerForm is 1, it means the user wants to create a new employer, so we navigate to the NewEmployer page
      navigation.navigate('NewEmployer')
      setEmployerForm(0) //reset employerForm to 0 to avoid navigating again when the user comes back from NewEmployer
    }
  }, [employerForm])

  //calculates the salary if changed between hourly rate and shift salary or if worked time, overtime or wage changes.
  //With a fixed shift salary the overtime is not used: the salary is what the user writes
  useEffect(() => {
    if (isHourlyRateForm) {
      setSalaryForm(salaryParts.totalSalary)
      setSalaryInput(formatDecimalText(salaryParts.totalSalary))
    }
  }, [isHourlyRateForm, salaryParts.totalSalary])

  useEffect(() => {
    const correctedWage = normalizeDecimalText(wageInput)

    if (correctedWage !== wageInput) {
      setWageInput(correctedWage)
    }

    const parsedWage = correctedWage === '' || correctedWage === '.' ? 0 : Number.parseFloat(correctedWage)
    setWageForm(Number.isNaN(parsedWage) ? 0 : parsedWage)
  }, [wageInput])

  useEffect(() => {
    const correctedOvertimeRate = normalizeDecimalText(overtimeRateInput)

    if (correctedOvertimeRate !== overtimeRateInput) {
      setOvertimeRateInput(correctedOvertimeRate)
    }

    const parsedOvertimeRate = correctedOvertimeRate === '' || correctedOvertimeRate === '.' ? 0 : Number.parseFloat(correctedOvertimeRate)
    setOvertimeRateForm(Number.isNaN(parsedOvertimeRate) ? 0 : parsedOvertimeRate)
  }, [overtimeRateInput])

  useEffect(() => {
    const correctedSalary = normalizeDecimalText(salaryInput)

    if (correctedSalary !== salaryInput) {
      setSalaryInput(correctedSalary)
    }

    const parsedSalary = correctedSalary === '' || correctedSalary === '.' ? 0 : Number.parseFloat(correctedSalary)
    setSalaryForm(Number.isNaN(parsedSalary) ? 0 : parsedSalary)
  }, [salaryInput])

  //calculates break
  useEffect(() => {
    if (shiftBreakEntryForm && shiftBreakExitForm) {
      const { breakHours, breakMinutes } = GetBreakTime({ breakEntry: shiftBreakEntryForm, breakExit: shiftBreakExitForm })

      const breakData = breakHours < 0 ? null : new Date(pressedDate.getFullYear(), pressedDate.getMonth(), pressedDate.getDate(), breakHours, breakMinutes)
      setShiftBreakForm(breakData)
    } else {
      setShiftBreakForm(null)
    }
  }, [shiftBreakEntryForm, shiftBreakExitForm])

  //calculates the worked hours and checks or inconsistencies
  useEffect(() => {
    //calculated with the days already arranged: right after picking a time the form still has it on the wrong day
    //for one render (an exit earlier than the entry gives negative hours), and that value must never reach the salary
    const arranged = normalizeShiftTimes({
      pressedDate,
      entry: shiftEntryForm,
      exit: shiftExitForm,
      breakEntry: shiftBreakEntryForm,
      breakExit: shiftBreakExitForm
    })

    if (arranged.entry && arranged.exit) {
      const { workedHours, workedMinutes } = getWorkedTime({
        entry: arranged.entry,
        exit: arranged.exit,
        breakEntry: arranged.breakEntry,
        breakExit: arranged.breakExit
      })
      setWorkedHoursForm(workedHours)
      setWorkedMinutesForm(workedMinutes)
    } else {
      setWorkedHoursForm(null)
      setWorkedMinutesForm(null)
    }
  }, [shiftEntryForm, shiftExitForm, shiftBreakEntryForm, shiftBreakExitForm, shiftBreakForm])

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
      overtimeEntry: overtimeEntryForm,
      overtimeExit: overtimeExitForm,
      overtimeHours: overtimeHoursForm,
      overtimeMinutes: overtimeMinutesForm,
      overtimeRateType: overtimeRateTypeForm,
      overtimeRate: overtimeRateForm,
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
    <Animated.View ref={bottomSpaceRef} style={[styles.container, bottomSpaceStyle]}>
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        activeOpacity={0.9}
        style={styles.botonCerrar}
      >
        <ButtonSmall color={theme.colors.grisClaro}>
          <Text style={styles.textButtonSmall}>x</Text>
        </ButtonSmall>
      </TouchableOpacity>

      <View>
        <Text style={styles.textoConf}>{isCreate ? translateFn("newShift") : translateFn("editShifts")} {firstLetterUpper(pressedDate.toLocaleDateString(lenguage, { month: 'short' }))} / {pressedDate.toLocaleDateString(lenguage, { day: "numeric" })}</Text>
      </View>

      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        onScroll={event => { scrollY.current = event.nativeEvent.contentOffset.y }}
        scrollEventThrottle={16}
        style={styles.scrollView}
      >
        <View style={styles.empleador}>
          <View style={styles.line}>
            <Text style={styles.textLine}>{translateFn("employer")}:</Text>

            {Platform.OS === 'ios' ? (
              <View style={styles.pickerContainerIos}>
                <IosPickerModal
                  value={employerForm}
                  onValueChange={newValue => setEmployerForm(Number(newValue))}
                  items={[
                    {label: translateFn("selectEmployer") || "Select Employer", value: 0},
                    ...companysInfo.map(employer => ({
                      label: employer.name,
                      value: employer.key,
                      key: employer.key
                    })),
                    {label: translateFn("createNewEmployerTab") || "Create New Employer", value: 1}
                  ]}
                  inputStyle={styles.pickerInput}
                  placeholderLabel={translateFn("selectEmployer") || "Select Employer"}
                  modalTitle={translateFn("employer") || "Employer"}
                  closeOnValues={[1]}
                />
              </View>
            ) : (
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={employerForm}
                  onValueChange={newValue => setEmployerForm(newValue)}
                  style={styles.picker}
                  itemStyle={styles.pickerItem}
                  dropdownIconColor={theme.colors.gris}
                  accessibilityLabel={translateFn("selectEmployer")}
                  mode='dropdown'
                >
                  {isCreate && <Picker.Item style={styles.pickerItem} label={translateFn("selectEmployer")} value={0} enabled={false} />}
                  {companysInfo.map(employer =>
                    <Picker.Item style={styles.pickerItem} label={employer.name} value={employer.key} key={employer.key} />
                  )}
                  <Picker.Item style={styles.pickerItem} label={translateFn("createNewEmployerTab")} value={1} />
                </Picker>
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
            <Text style={styles.textLine}>{translateFn("baseHours")}:</Text>
            <Text style={styles.textLine}>{(workedHoursForm !== null || undefined) && (workedMinutesForm !== null || undefined) ? `${workedHoursForm}:${formattedMinutesNumber(workedMinutesForm!)}` : "-"}</Text>
          </View>

          <DropDownAutoHeight
            title={translateFn("overtime")!}
            textRight={overtimeTime ? `${overtimeTime.overtimeHours}:${formattedMinutesNumber(overtimeTime.overtimeMinutes)}` : "0"}
            duration={300}
            maxHeight={200}
            arrowColor={configInfo.baseColor}
            isOpen={overtimeOpen}
            setIsOpen={setOvertimeOpen}
          >
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.line}
              disabled={shiftEntryForm === null && overtimeEntryForm === null}
              onPress={() => { setTimeType("extraEntrada"), setModalOpen(true) }}
            >
              <Text style={styles.textLineCenter}>{translateFn("overtimeStart")}:</Text>
              <View >
                <Text style={styles.textLine}>{overtimeEntryForm ? `${overtimeEntryForm.getHours()}:${formattedMinutes(overtimeEntryForm)}` : "-"}</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.line}
              disabled={overtimeEntryForm === null && overtimeExitForm === null}
              onPress={() => { setTimeType("extraSalida"), setModalOpen(true) }}
            >
              <Text style={styles.textLine}>{translateFn("overtimeEnd")}:</Text>
              <View >
                <Text style={styles.textLine}>{overtimeExitForm ? `${overtimeExitForm.getHours()}:${formattedMinutes(overtimeExitForm)}` : "-"}</Text>
              </View>
            </TouchableOpacity>
          </DropDownAutoHeight>

          <View style={styles.line}>
            <Text style={styles.textLine}>{translateFn("totalHours")}:</Text>
            <Text style={styles.textLine}>{totalHours ? `${totalHours.totalHours}:${formattedMinutesNumber(totalHours.totalMinutes)}` : "-"}</Text>
          </View>

          <DropDownAutoHeight
            title={translateFn("salary")!}
            textRight={salaryForm && !salaryOpen ? `$ ${formatDecimalText(salaryForm)}` : ""}
            duration={300}
            maxHeight={340}
            arrowColor={configInfo.baseColor}
            isOpen={salaryOpen}
            setIsOpen={setSalaryOpen}
          >
            <View style={[styles.line, styles.salaryPicker]}>
              <Animated.Text onPress={() => handlePress(true)} style={[styles.textLine, styles.textHourly, reversecolorChange]}>{translateFn("hourly")}</Animated.Text>
              <Animated.Text onPress={() => handlePress(false)} style={[styles.textLine, styles.textPerShift, colorChange]}>{translateFn("perTurn")}</Animated.Text>
            </View>

            <Animated.View style={[{ flexDirection: "row", alignItems: "flex-start", gap: 16 }, changeX]}>
              <View style={styles.hourlyPanel}>
              <View style={styles.line}>
                <View style={styles.salaryLine}>
                  <Text style={styles.textLine}>{translateFn("hourlyWage")}: $ </Text>
                  <TextInput
                    style={[styles.textLine, styles.inputBox]}
                    inputMode='numeric'
                    keyboardType='numeric'
                    ref={wageInputRef}
                    onFocus={() => scrollInputIntoView(wageInputRef.current)}
                    onChangeText={setWageInput}
                    value={wageInput}
                    placeholder="0"
                    placeholderTextColor={theme.colors.grisMedio}
                  />
                </View>

                <Text style={styles.textLine}>{translateFn("total")}: $ {formatDecimalText(salaryParts.regularSalary)}</Text>
              </View>

              <View style={styles.line}>
                <View style={styles.overtimeLineLeft}>
                  <Text style={styles.textLine}>{translateFn("overtimeWage")}:</Text>
                  <OvertimeRateTypePicker value={overtimeRateTypeForm} onChange={setOvertimeRateTypeForm} />
                  <TextInput
                    style={[styles.textLine, styles.inputBox]}
                    inputMode='numeric'
                    keyboardType='numeric'
                    ref={overtimeRateInputRef}
                    onFocus={() => scrollInputIntoView(overtimeRateInputRef.current)}
                    onChangeText={setOvertimeRateInput}
                    value={overtimeRateInput}
                    placeholder="0"
                    placeholderTextColor={theme.colors.grisMedio}
                  />
                </View>

                <Text style={styles.textLine}>{translateFn("total")}: $ {formatDecimalText(salaryParts.overtimeSalary)}</Text>
              </View>

              <View style={[styles.line, styles.lineCentered]}>
                <Text style={styles.textLineCenter}>{translateFn("total")}: $ {formatDecimalText(salaryParts.totalSalary)}</Text>
              </View>
              </View>

              <View style={styles.line}>
                <Text style={styles.textLine}>{translateFn("shiftSalary")}:</Text>

                <View style={styles.salaryLine}>
                  <Text style={styles.textLine}>$ </Text>
                  <TextInput
                    style={[styles.textLine, styles.inputBox]}
                    inputMode='numeric'
                    keyboardType='numeric'
                    ref={salaryInputRef}
                    onFocus={() => scrollInputIntoView(salaryInputRef.current)}
                    onChangeText={setSalaryInput}
                    value={salaryInput}
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
            ref={noteInputRef}
            onFocus={() => scrollInputIntoView(noteInputRef.current)}
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
          entryOvertime={overtimeEntryForm} setEntryOvertime={setOvertimeEntryForm}
          exitOvertime={overtimeExitForm} setExitOvertime={setOvertimeExitForm}
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
            onPress={() => handleSubmit()}
            block={employerForm === 0 || !shiftEntryForm || blockSubmit ? true : false}
            color={configInfo.buttonsColor}
          >
            <Text style={styles.textoBoton}>{isCreate ? translateFn("createNewShift") : translateFn("saveChanges")}</Text>
          </Button>
        </TouchableOpacity>

        <View style={{ height: 20 }} />
      </ScrollView>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 8,
    justifyContent: "center",
    backgroundColor: theme.colors.blanco
  },
  scrollView: {
    flex: 1
  },
  textoConf: {
    marginTop: 32,
    paddingBottom: 24,
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
    marginTop: 0,
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
  //the hourly lines (wage, overtime and total) are one block as wide as the dropdown
  hourlyPanel: {
    width: "100%"
  },
  overtimeLineLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexShrink: 1
  },
  lineCentered: {
    justifyContent: "center",
    borderBottomWidth: 0
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
    textAlign: "right",
    color: theme.colors.negro
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
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
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
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8
  },
  textLineCenter: {
    fontSize: theme.fontSizes.F18,
    fontWeight: "400",
    textAlign: "center",
    color: theme.colors.negro
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
    maxHeight: 60,
    color: theme.colors.negro
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
    transform: [{ translateX: 18 }],
    backgroundColor: "white"
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
    maxWidth: 300,
    color: 'black',
    textAlign: 'center',
    textDecorationColor: "black",
    borderRadius: 12,
  },
  textoBoton: {
    fontSize: theme.fontSizes.F18,
    fontWeight: "500",
    color: theme.colors.negro
  },
  textButtonSmall: {
    fontSize: theme.fontSizes.F20,
    fontWeight: "500",
    lineHeight: theme.fontSizes.F20,
    color: theme.colors.negro
  }
})
