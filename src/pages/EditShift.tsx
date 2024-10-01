import React, { useEffect, useState } from 'react'
import { StyleSheet, Text, TextInput, TouchableOpacity, View, Modal, Platform, Alert, ScrollView } from 'react-native'
import { Link, useParams } from 'react-router-native'
import { ShiftProps } from '../types'
import Constants from "expo-constants"
import { Picker } from '@react-native-picker/picker'
import Icon from 'react-native-vector-icons/AntDesign'
import DatePicker from 'react-native-date-picker'

import useCalendar from '../hooks/useCalendar'
import translations from "../lenguages/lenguages.json"
import theme from '../theme/theme'
import { firstLetterUpper, formattedMinutes, formattedMinutesNumber, textDay } from '../utils'
import Slider from '../components/Atoms/Slider'
import ButtonSmall from '../components/Atoms/Buttons/ButtonSmall'
import Button from '../components/Atoms/Buttons/Button'

export default function EditShift() {
  const { companysInfo, shifts, setShifts, lenguage} = useCalendar()

  const params = useParams()
  const pressedDate = new Date(params.date!)
  const editingShiftKey = params.shift!
  const editingShift = shifts.find(shift => shift.key === editingShiftKey)
  const editingShiftIndex = shifts.findIndex(shift => shift.key === editingShiftKey)

  const {
    employer, 
    key, 
    note, 
    paid, 
    shiftBreakEntry,
    shiftBreakExit,
    shiftBreak, 
    shiftEntry, 
    shiftExit, 
    workedHours, 
    workedMinutes, 
    salary,
    color
  } = editingShift!

  const [employerEdit, setEmployer] = useState(companysInfo.find(emp => emp.key === employer)!.name)
  const [shiftEntryEdit, setShiftEntry] = useState<Date | null>(shiftEntry)
  const [shiftExitEdit, setShiftExit] = useState<Date | null>(shiftExit ? shiftExit : null)
  const [shiftBreakEntryEdit, setShiftBreakEntry] = useState<Date | null>(shiftBreakEntry ? shiftBreakEntry : null)
  const [shiftBreakExitEdit, setShiftBreakExit] = useState<Date | null>(shiftBreakExit ? shiftBreakExit : null)
  const [shiftBreakEdit, setShiftBreak] = useState<Date | null>(shiftBreak ? shiftBreak : null)
  const [workedHoursEdit, setWorkedHours] = useState<number | null>(workedHours ? workedHours : null)
  const [workedMinutesEdit, setWorkedMinutes] = useState<number | null>(workedMinutes ? workedMinutes : null)
  const [paidEdit, setPaid] = useState(paid ? paid : false)
  const [noteEdit, setNote] = useState(note ? note : "")

  const [missing, setMissing] = useState("")
  const [blockSubmit, setBlockSubmit] = useState(true)

  const [timeType, setTimeType] = useState("")
  const [date, setDate] = useState<Date | null>(pressedDate)
  const [modalOpen, setModalOpen] = useState(false)
  const [showDelete, setShowDelete] = useState(false)

  //called when pressing on default entry, exit or break. Sets data to open de correct modal and edit the correct info
  const selectedTime = () => {
    switch(timeType) {
      case "entrada": 
        setDate(shiftEntryEdit ? shiftEntryEdit : pressedDate)
        setShowDelete(shiftEntryEdit ? true : false)
        break
      case "salida":
        setDate(shiftExitEdit ? shiftExitEdit : (shiftEntryEdit ? shiftEntryEdit : pressedDate))
        setShowDelete(shiftExitEdit ? true : false)
        break
      case "descansoEntrada":
        setDate(shiftBreakEntry ? shiftBreakEntry : pressedDate)
        setShowDelete(shiftBreakEntry ? true : false)
      case "descansoSalida":
        setDate(shiftBreakExit ? shiftBreakExit : pressedDate)
        setShowDelete(shiftBreakExit ? true : false)
    }
  }

  //takes the new time when changing entry, exit or break. and sets the new data
  const changeConfigInfo = (newDate: Date | null) => {
    if(timeType === "entrada") {
      setShiftEntry(newDate!)
    }
    if(timeType === "salida") {
      setShiftExit(newDate!)
      if (newDate !== null) {
        if (newDate!.getDate() === shiftEntryEdit!.getDate() && (newDate!.getHours() < shiftEntryEdit!.getHours() || (newDate!.getHours() === shiftEntryEdit!.getHours() && newDate!.getMinutes() < shiftEntryEdit!.getMinutes()))) {
          setShiftEntry(null!)
        }
      }
    }
    if(timeType === "descansoEntrada") {    
      setShiftBreakEntry(newDate!)
    }
    if(timeType === "descansoSalida") {    
      setShiftBreakExit(newDate!)
    }
    setTimeType("")
  }

  //calculates break
  useEffect(() => {
    if(shiftBreakEntryEdit && shiftBreakExitEdit) {
      const difMonth = shiftBreakExitEdit.getMonth() !== shiftBreakEntryEdit.getMonth()
      const daysInMonth = new Date(pressedDate.getFullYear(), pressedDate.getMonth() + 1, 0).getDate();

      const dayDiference = shiftBreakExitEdit!.getDate() - shiftBreakEntryEdit!.getDate()    
      const minutes = ((shiftBreakExitEdit!.getMinutes() < shiftBreakEntryEdit!.getMinutes()) ?
        shiftBreakExitEdit!.getMinutes() + (60 - shiftEntry!.getMinutes()):
        shiftBreakExitEdit!.getMinutes() - shiftEntry!.getMinutes()
      ) 
      // minutes is the break minutes
      if(dayDiference === 0) {
        const hours = (
          shiftBreakExitEdit!.getHours() - shiftBreakEntryEdit!.getHours()  
          - (shiftBreakExitEdit!.getMinutes() < shiftBreakEntryEdit!.getMinutes() ? 1 : 0) 
        )
        setShiftBreak(new Date(pressedDate.getFullYear(), pressedDate.getMonth(), pressedDate.getDay(), hours, minutes))
      } else {
        const hours = (
          (24 - shiftBreakEntryEdit!.getHours()) 
          - (shiftBreakExitEdit!.getMinutes() < shiftBreakEntryEdit!.getMinutes() ? 1 : 0) 
          + (difMonth ? 24 * ((daysInMonth - shiftBreakEntryEdit!.getDate()) + (shiftBreakExitEdit!.getDate() -1)) : 24 * (dayDiference - 1)) 
          + shiftBreakExitEdit!.getHours()
        ) 
        setShiftBreak(new Date(pressedDate.getFullYear(), pressedDate.getMonth(), pressedDate.getDay(), hours, minutes))
      }
    } else {
      setShiftBreak(null)
    }
  }, [shiftBreakEntryEdit, shiftBreakExitEdit])
  
  //calculates the worked hours and checks or inconsistencies
  useEffect (() => {
    if(shiftEntryEdit !== null && shiftExitEdit !== null) {
      const difMonth = shiftExitEdit!.getMonth() !== shiftEntryEdit!.getMonth()
      const daysInMonth = new Date(pressedDate.getFullYear(), pressedDate.getMonth() + 1, 0).getDate();
      
      const dayDiference = shiftExitEdit!.getDate() - shiftEntryEdit!.getDate()    
      const minutes = ((shiftExitEdit!.getMinutes() < shiftEntryEdit!.getMinutes()) ?
      shiftExitEdit!.getMinutes() + (60 - shiftEntryEdit!.getMinutes()):
      shiftExitEdit!.getMinutes() - shiftEntryEdit!.getMinutes()
      ) 
      const minutesWithBreak = ((shiftBreakEdit === undefined || shiftBreakEdit === null) ? minutes : 
        (minutes - shiftBreakEdit!.getMinutes() >= 0 ? minutes - shiftBreakEdit!.getMinutes() : 60 + (minutes - shiftBreakEdit!.getMinutes()))
      )
      
      setWorkedMinutes(minutesWithBreak)

      if(dayDiference === 0) {
        const hours = (
          shiftExitEdit!.getHours() - shiftEntryEdit!.getHours()  
          - (shiftExitEdit!.getMinutes() < shiftEntryEdit!.getMinutes() ? 1 : 0) 
          - ((shiftBreakEdit === undefined || shiftBreakEdit === null) ? 0 : minutes - shiftBreakEdit!.getMinutes() < 0 ? 1 : 0)
          - ((shiftBreakEdit === undefined || shiftBreakEdit === null) ? 0 : shiftBreakEdit!.getHours())
        )
        if(hours >= 0) {
          setWorkedHours(hours)
        } else {       
          setWorkedHours(null)
          setWorkedMinutes(null)
        }
      } else {
        const hours = (
          (24 - shiftEntryEdit!.getHours()) 
          - (shiftExitEdit!.getMinutes() < shiftEntryEdit!.getMinutes() ? 1 : 0) 
          - ((shiftBreakEdit === undefined || shiftBreakEdit === null) ? 0 : minutes - shiftBreakEdit!.getMinutes() < 0 ? 1 : 0)
          - ((shiftBreakEdit === undefined || shiftBreakEdit === null) ? 0 : shiftBreakEdit!.getHours())
          + (difMonth ? 24 * ((daysInMonth - shiftEntryEdit!.getDate()) + (shiftExitEdit!.getDate() -1)) : 24 * (dayDiference - 1)) 
          + shiftExitEdit!.getHours()
        )  
        if(hours >= 0) {
          setWorkedHours(hours)
        } else {       
          setWorkedHours(null)
          setWorkedMinutes(null)
        }
      }
    } else {
      setWorkedHours(null)
      setWorkedMinutes(null)
    }
  }, [shiftEntryEdit, shiftExitEdit, shiftBreakEdit])
  
  //calls the alert when trying to delete entry, exit or break time
  const showAlert = () => {
    Alert.alert(
      '',
      translations.timeDeleteAlert.find(i => i.lenguage === lenguage)?.text,
      [
        {
          text: translations.cancel.find(i => i.lenguage === lenguage)?.text,
          style: 'cancel'
        },
        {
          text: 'OK',
          onPress: () => {setModalOpen(false), changeConfigInfo(null)},
          style: 'cancel'
        },
      ],
      {
        cancelable: true
      }
    )
  }
  
  //sets the modal title
  const modalTitle = () => {
    switch(timeType) {
      case "entrada": return translations.entryHour.find(i => i.lenguage === lenguage)?.text
      case "salida": return translations.exitHour.find(i => i.lenguage === lenguage)?.text
      case "descansoEntrada": return translations.breakStart.find(i => i.lenguage === lenguage)?.text
      case "descansoSalida": return translations.breakEnd.find(i => i.lenguage === lenguage)?.text
    }
  }

  //saves the new edited info when submiting
  const handleEditShift = () => {
    const editedShift: ShiftProps = {
      key: `${shiftEntryEdit}${employerEdit}`,
      employer: companysInfo.find(emp => emp.name === employerEdit)!.key, 
      short: companysInfo.find(company => company.name === employerEdit)!.short,
      shiftEntry: shiftEntryEdit!, 
      shiftExit: shiftExitEdit, 
      shiftBreak: shiftBreakEdit, 
      shiftBreakEntry: shiftBreakEntryEdit, 
      shiftBreakExit: shiftBreakExitEdit, 
      workedHours: workedHoursEdit,
      workedMinutes: workedMinutesEdit,
      paid: paidEdit,
      salary: workedHoursEdit ? 
        companysInfo.some(company => company.name === employerEdit) 
        ? (workedHoursEdit + workedMinutesEdit!/60) * companysInfo.find(company => company.name === employerEdit)!.wage 
        : salary 
      : null,
      color: companysInfo.some(company => company.name === employerEdit)
        ? companysInfo.find(company => company.name === employerEdit)!.color
        : color,
      note: noteEdit
    }
    const updatedshifts = [...shifts]
    updatedshifts.splice(editingShiftIndex, 1, editedShift)
    setShifts(updatedshifts)
  }

  //calls the alert if there is something wrong or missing in the input data
  const checkInfo = () => {
    if (employerEdit === "" && !shiftEntryEdit) {setMissing(translations.noEntryEmployerAlert.find(i => i.lenguage === lenguage)?.text!)}
    if (employerEdit === "" && shiftEntryEdit) {setMissing(translations.noEmployerAlert.find(i => i.lenguage === lenguage)?.text!)}
    if (employerEdit !== "" && !shiftEntryEdit) {setMissing(translations.noEntryAlert.find(i => i.lenguage === lenguage)?.text!)}
  }

  //checks there is no repeted shifts
  useEffect(() => {
    const currentExcluded = shifts.filter (shift => shift.key !== key)
    if (currentExcluded.find(shift => 
      shift.key === `${shiftEntry}${employerEdit}` && 
      shift.shiftEntry.getFullYear() === shiftEntryEdit?.getFullYear() &&
      shift.shiftEntry.getMonth() === shiftEntryEdit?.getMonth() &&
      shift.shiftEntry.getDate() === shiftEntryEdit?.getDate() &&
      shift.shiftEntry.getHours() === shiftEntryEdit?.getHours() &&
      shift.shiftEntry.getMinutes() === shiftEntryEdit?.getMinutes()
    )) {
      setMissing(translations.repetedShiftAlert.find(i => i.lenguage === lenguage)?.text!)
      setBlockSubmit(true)
    } else {
      setMissing("")
      setBlockSubmit(false)
    }
  }, [employerEdit, shiftEntryEdit])

  
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

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
        <View>
          <Text style={styles.textoConf}>{translations.editShifts.find(i => i.lenguage === lenguage)?.text} {firstLetterUpper(pressedDate.toLocaleDateString(lenguage, {month: 'short'}))} / {pressedDate.toLocaleDateString(lenguage, {day:"numeric"})}</Text>
        </View>

        <View style={styles.empleador}>
          <View style={styles.line}>
            <Text style={styles.textLine}>{translations.employer.find(i => i.lenguage === lenguage)?.text}:</Text>
            
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={employerEdit}
                onValueChange={newValue => setEmployer(newValue)}
                style={styles.picker}
                accessibilityLabel={translations.selectEmployer.find(i => i.lenguage === lenguage)?.text}
                mode='dropdown'
                >
                  <Picker.Item style={styles.pickerItem} label={translations.selectEmployer.find(i => i.lenguage === lenguage)?.text} value="" enabled={false}/>
                {companysInfo.map(employer => 
                  <Picker.Item style={styles.pickerItem} label={employer.name} value={employer.name} key={employer.name}/>
                )}
              </Picker>
            </View>
          </View>

          <TouchableOpacity 
            activeOpacity={0.8} 
            style={styles.line}
            onPress={() => {setTimeType("entrada"), setModalOpen(true)}}
          >
            <Text style={styles.textLine}>{translations.entryHour.find(i => i.lenguage === lenguage)?.text}:</Text>
            <View >
              <Text style={styles.textLine}>{shiftEntryEdit ? `${shiftEntryEdit.getHours()}:${formattedMinutes(shiftEntryEdit)}` : "-"}</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            activeOpacity={0.8} 
            style={styles.line}
            disabled={shiftEntry === null}
            onPress={() => {setTimeType("salida"), setModalOpen(true)}}
          >
            <Text style={styles.textLine}>{translations.exitHour.find(i => i.lenguage === lenguage)?.text}:</Text>
            <View >
              <Text style={styles.textLine}>
                {shiftExitEdit && shiftEntryEdit ?
                  (shiftExitEdit?.getDate() !== shiftEntryEdit?.getDate() ? 
                    `${firstLetterUpper(shiftExitEdit!.toLocaleDateString(lenguage, {month: 'short'}))} ${shiftExitEdit?.getDate()} (${textDay(shiftExitEdit!, lenguage)})  ` : "") 
                  : ""
                }
                {shiftExitEdit ? `${shiftExitEdit.getHours()}:${formattedMinutes(shiftExitEdit)}` : "-"}
              </Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity 
            activeOpacity={0.8} 
            style={styles.line}
            disabled={shiftEntry === null}
            onPress={() => {setTimeType("descansoEntrada"), setModalOpen(true)}}
            >
            <Text style={styles.textLine}>{translations.breakStart.find(i => i.lenguage === lenguage)?.text}:</Text>
            <View >
              <Text style={styles.textLine}>{shiftBreakEntry ? `${shiftBreakEntry.getHours()}:${formattedMinutes(shiftBreakEntry)}` : "-"}</Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity    
            activeOpacity={0.8} 
            style={styles.line}
            disabled={shiftBreakEntry === null}
            onPress={() => {setTimeType("descansoSalida"), setModalOpen(true)}}
            >
            <Text style={styles.textLine}>{translations.breakEnd.find(i => i.lenguage === lenguage)?.text}:</Text>
            <View >
              <Text style={styles.textLine}>{shiftBreakExit ? `${shiftBreakExit.getHours()}:${formattedMinutes(shiftBreakExit)}` : "-"}</Text>
            </View>
          </TouchableOpacity>
          
          <View style={styles.line}>
            <Text style={styles.textLine}>{translations.workedHours.find(i => i.lenguage === lenguage)?.text}:</Text>
            <Text style={styles.textLine}>{workedHoursEdit !== null && workedMinutesEdit !== null ? `${workedHoursEdit}:${formattedMinutesNumber(workedMinutesEdit!)}` : "-"}</Text>
          </View>
          
          <View style={styles.lineLeft}>
            <Text style={styles.textLine}>{translations.paid.find(i => i.lenguage === lenguage)?.text}</Text>
            <Slider setValue={setPaid} value={paidEdit} />
          </View>
          
          <TextInput 
            value={noteEdit}
            onChangeText={setNote}
            style={styles.textInput}
            multiline = {true}
            numberOfLines = {2}
            placeholder={translations.note.find(i => i.lenguage === lenguage)?.text}
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
                  onPress={() => {showAlert()}}
                />}
              </View>
              
              <DatePicker 
                theme='light'
                mode={timeType === "salida" ? "datetime" : 'time'}
                minimumDate={shiftEntryEdit && timeType === "salida" ? shiftEntryEdit : pressedDate}
                maximumDate={timeType === "entrada" && shiftExitEdit ? shiftExitEdit : new Date(pressedDate!.getFullYear(), pressedDate!.getMonth(), pressedDate!.getDate() + 2, 23, 59)}
                locale={lenguage}
                date={date!}
                onDateChange={setDate}
                dividerColor={theme.colors.verdeBase}
                is24hourSource={timeType === "descanso" ? "locale" : "device"}
              />

              <View style={styles.modalButtons}>
                <TouchableOpacity activeOpacity={0.7} onPress={() => {setModalOpen(false), setTimeType("")}}>
                  <Text style={styles.modalButton}>{translations.cancel.find(i => i.lenguage === lenguage)?.text}</Text>
                </TouchableOpacity>
                <TouchableOpacity activeOpacity={0.7} onPress={() => {setModalOpen(false), changeConfigInfo(date)}}>
                  <Text style={styles.modalButton}>{translations.save.find(i => i.lenguage === lenguage)?.text}</Text>
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
            press={() => handleEditShift()}
            block={employerEdit === "" || !shiftEntryEdit || blockSubmit ? true : false}
            to={`/calendar/shifts/${pressedDate}`} 
            color={theme.colors.verdeBoton}
          >
            <Text style={styles.textoBoton}>{translations.saveChanges.find(i => i.lenguage === lenguage)?.text}</Text>
          </Button>
        </TouchableOpacity>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create ({
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
  textLine: {
    fontSize: theme.fontSizes.F18,
    fontWeight: '400',
    textAlign: "right"
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
    marginTop: Platform.OS === "ios" ? Constants.statusBarHeight +10 : Constants.statusBarHeight +12,
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
    flexDirection:"row",
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
    transform: [{translateX: 18}]
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
