import React, { useEffect, useRef, useState } from 'react'
import { StyleSheet, Text, TextInput, TouchableOpacity, View, ScrollView, Animated, Dimensions, Platform } from 'react-native'
import { Picker } from '@react-native-picker/picker'
import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'

import useCalendar from '@/hooks/useCalendar'
import useKeyboardBottomSpace from '@/hooks/useKeyboardBottomSpace'
import { ConfigInfo, RootStackParamList, ShiftProps } from '@/types'
import theme from '@/theme/theme'
import { firstLetterUpper, formattedMinutes, formattedMinutesNumber, textDay, translate } from '@/utils'
import { GetBreakTime, getWorkedTime, normalizeShiftTimes, onDay } from '@/utils/datesCompare'

import Slider from '@/components/Atoms/Slider'
import ButtonSmall from '@/components/Atoms/Buttons/ButtonSmall'
import Button from '@/components/Atoms/Buttons/Button'
import DropDownAutoHeight from '@/components/Molecules/DropDownAutoHeight'
import IosPickerModal from '@/components/Molecules/IosPickerModal'
import ModalDatePicker from '@/components/Molecules/ModalDatePicker'

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
    breakExit: existing?.shiftBreakExit || onlyDefault(configInfo.configBreakExit)
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

  //states to manage missing or wrong data
  const [missing, setMissing] = useState("")
  const [blockSubmit, setBlockSubmit] = useState(true)

  //states for dropdowns
  const [breakOpen, setBreakOpen] = useState(false)
  const [salaryOpen, setSalaryOpen] = useState(false)

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
      breakExit: shiftBreakExitForm
    })

    if (normalized.entry?.getTime() !== shiftEntryForm?.getTime()) setShiftEntryForm(normalized.entry)
    if (normalized.exit?.getTime() !== shiftExitForm?.getTime()) setShiftExitForm(normalized.exit)
    if (normalized.breakEntry?.getTime() !== shiftBreakEntryForm?.getTime()) setShiftBreakEntryForm(normalized.breakEntry)
    if (normalized.breakExit?.getTime() !== shiftBreakExitForm?.getTime()) setShiftBreakExitForm(normalized.breakExit)
  }, [shiftEntryForm, shiftExitForm, shiftBreakEntryForm, shiftBreakExitForm])

  useEffect(() => {
    if (employerForm > 1) {
      const company = companysInfo.find(company => company.key == employerForm)
      setWageForm(company?.wage || 0)
      setWageInput(formatDecimalText(company?.wage || 0))
    } else if (employerForm === 1) { //if employerForm is 1, it means the user wants to create a new employer, so we navigate to the NewEmployer page
      navigation.navigate('NewEmployer')
      setEmployerForm(0) //reset employerForm to 0 to avoid navigating again when the user comes back from NewEmployer
    }
  }, [employerForm])

  //calculates the salary if changed between hourly rate and shift salary or if worked time or wage changes
  useEffect(() => {
    if (isHourlyRateForm) {
      const salary = workedHoursForm !== null || undefined ? (workedHoursForm! + workedMinutesForm! / 60) * wageForm : 0
      setSalaryForm(salary)
      setSalaryInput(formatDecimalText(salary))
    }
  }, [isHourlyRateForm, wageForm, workedHoursForm, workedMinutesForm])

  useEffect(() => {
    const correctedWage = normalizeDecimalText(wageInput)

    if (correctedWage !== wageInput) {
      setWageInput(correctedWage)
    }

    const parsedWage = correctedWage === '' || correctedWage === '.' ? 0 : Number.parseFloat(correctedWage)
    setWageForm(Number.isNaN(parsedWage) ? 0 : parsedWage)
  }, [wageInput])

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
            <Text style={styles.textLine}>{translateFn("workedHours")}:</Text>
            <Text style={styles.textLine}>{(workedHoursForm !== null || undefined) && (workedMinutesForm !== null || undefined) ? `${workedHoursForm}:${formattedMinutesNumber(workedMinutesForm!)}` : "-"}</Text>
          </View>

          <DropDownAutoHeight
            title={translateFn("salary")!}
            textRight={salaryForm && !salaryOpen ? `$ ${formatDecimalText(salaryForm)}` : ""}
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
                    ref={wageInputRef}
                    onFocus={() => scrollInputIntoView(wageInputRef.current)}
                    onChangeText={setWageInput}
                    value={wageInput}
                    placeholder="0"
                    placeholderTextColor={theme.colors.grisMedio}
                  />
                </View>

                <Text style={styles.textLine}>{translateFn("total")}: $ {formatDecimalText(salaryForm)}</Text>
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
