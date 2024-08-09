import React, { useEffect, useState } from 'react'
import { StyleSheet, Text, TextInput, TouchableOpacity, View, Modal, Platform, Alert } from 'react-native'
import { Link, useParams } from 'react-router-native'
import Constants from "expo-constants"

import useCalendar from '../hooks/useCalendar'
import theme from '../theme/theme'
import Boton from '../components/Boton'
import BotonChico from '../components/BotonChico'
import DatePicker from 'react-native-date-picker'
import { firstLetterUpper, formattedMinutes, formattedMinutesNumber, textDay } from '../utils'
import Icon from 'react-native-vector-icons/AntDesign'
import { Picker } from '@react-native-picker/picker'
import { ShiftProps } from '../types'
import Slider from '../components/Slider'

export default function EditShift() {
  const { companysInfo, shifts, setShifts} = useCalendar()

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
    shiftBreak, 
    shiftEntry, 
    shiftExit, 
    workedHours, 
    workedMinutes, 
    salary,
    color
  } = editingShift!

  const [employerEdit, setEmployer] = useState(employer)
  const [shiftEntryEdit, setShiftEntry] = useState<Date | null>(shiftEntry)
  const [shiftExitEdit, setShiftExit] = useState<Date | null>(shiftExit ? shiftExit : null)
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
      case "descanso":
        setDate(shiftBreakEdit ? shiftBreakEdit : pressedDate)
        setShowDelete(shiftBreakEdit ? true : false)
    }
  }

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
    if(timeType === "descanso") {    
      setShiftBreak(newDate!)
    }
    setTimeType("")
  }
  
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

  const showAlert = () => {
    Alert.alert(
      '',
      `¿seguro deseas eliminar la hora de ${timeType}?` ,
      [
        {
          text: 'Cancel',
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

  const handleEditShift = () => {
    const editedShift: ShiftProps = {
      key: `${shiftEntryEdit}${employerEdit}`,
      employer: employerEdit, 
      short: companysInfo.find(company => company.name === employerEdit)!.short,
      shiftEntry: shiftEntryEdit!, 
      shiftExit: shiftExitEdit, 
      shiftBreak: shiftBreakEdit, 
      workedHours: workedHoursEdit,
      workedMinutes: workedMinutesEdit,
      paid: paidEdit,
      salary: workedHours ? 
        companysInfo.some(company => company.name === employerEdit) 
        ? (workedHours + workedMinutes!/60) * companysInfo.find(company => company.name === employer)!.wage 
        : salary 
      : null,
      color: companysInfo.some(company => company.name === employerEdit)
        ? companysInfo.find(company => company.name === employer)!.color
        : color,
      note: noteEdit
    }
    const updatedshifts = [...shifts]
    updatedshifts.splice(editingShiftIndex, 1, editedShift)
    setShifts(updatedshifts)
  }

  const checkInfo = () => {
    if (employerEdit === "" && !shiftEntryEdit) {setMissing("Empleador y entrada son obligatorios")}
    if (employerEdit === "" && shiftEntryEdit) {setMissing("Empleador es obligatorio")}
    if (employerEdit !== "" && !shiftEntryEdit) {setMissing("Entrada es obligatorio")}
  }

  useEffect(() => {
    const currentExcluded = shifts.filter (shift => shift.key !== key)
    if (currentExcluded.find(shift => 
      shift.employer === employerEdit && 
      shift.shiftEntry.getFullYear() === shiftEntryEdit?.getFullYear() &&
      shift.shiftEntry.getMonth() === shiftEntryEdit?.getMonth() &&
      shift.shiftEntry.getDate() === shiftEntryEdit?.getDate() &&
      shift.shiftEntry.getHours() === shiftEntryEdit?.getHours() &&
      shift.shiftEntry.getMinutes() === shiftEntryEdit?.getMinutes()
    )) {
      setMissing("La entrada ya existe para este empleador")
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
        <BotonChico text='x' icon='' color={theme.colors.grisClaro}/>
      </Link>

      <View>
        <Text style={styles.textoConf}>Editar Turno</Text>
      </View>

      <View style={styles.empleador}>
        <View style={styles.line}>
          <Text style={styles.textLine}>Empleador:</Text>
          
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={employerEdit}
              onValueChange={newValue => setEmployer(newValue)}
              style={styles.picker}
              accessibilityLabel='Seleccionar Empleador'
              mode='dropdown'
              >
                <Picker.Item style={styles.pickerItem} label='Seleccionar Empleador' value="" enabled={false}/>
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
          <Text style={styles.textLine}>Entrada:</Text>
          <View >
            <Text style={styles.textLine}>{shiftEntryEdit ? `${shiftEntryEdit.getHours()}:${formattedMinutes(shiftEntryEdit)}` : "-"}</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          activeOpacity={0.8} 
          style={styles.line}
          onPress={() => {setTimeType("salida"), setModalOpen(true)}}
        >
          <Text style={styles.textLine}>Salida:</Text>
          <View >
            <Text style={styles.textLine}>
              {shiftExitEdit && shiftEntryEdit ?
                (shiftExitEdit?.getDate() !== shiftEntryEdit?.getDate() ? 
                  `${firstLetterUpper(shiftExitEdit!.toLocaleDateString('es-ES', {month: 'short'}))} ${shiftExitEdit?.getDate()} (${textDay(shiftExitEdit!)})  ` : "") 
                : ""
              }
              {shiftExitEdit ? `${shiftExitEdit.getHours()}:${formattedMinutes(shiftExitEdit)}` : "-"}
            </Text>
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity 
          activeOpacity={0.8} 
          style={styles.line}
          onPress={() => {setTimeType("descanso"), setModalOpen(true)}}
        >
          <Text style={styles.textLine}>Descanso:</Text>
          <View >
            <Text style={styles.textLine}>{shiftBreakEdit ? `${shiftBreakEdit.getHours()}:${formattedMinutes(shiftBreakEdit)}` : "0"}</Text>
          </View>
        </TouchableOpacity>
        
        <View style={styles.line}>
          <Text style={styles.textLine}>Horas trabajadas:</Text>
          <Text style={styles.textLine}>{workedHoursEdit !== null && workedMinutesEdit !== null ? `${workedHoursEdit}:${formattedMinutesNumber(workedMinutesEdit!)}` : "-"}</Text>
        </View>
        
        <View style={styles.lineLeft}>
          <Text style={styles.textLine}>Pagado</Text>
          <Slider setValue={setPaid} value={paidEdit} />
        </View>
        
        <TextInput 
          value={noteEdit}
          onChangeText={setNote}
          style={styles.textInput}
          multiline = {true}
          numberOfLines = {2}
          placeholder='Nota'
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
              <Text style={styles.modalTitle}>{timeType === "descanso" ? "Descanso" : `Horario de ${timeType}`}</Text>
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
              locale='es'
              date={date!}
              onDateChange={setDate}
              dividerColor={theme.colors.verdeBase}
              is24hourSource={timeType === "descanso" ? "locale" : "device"}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity activeOpacity={0.7} onPress={() => {setModalOpen(false), setTimeType("")}}>
                <Text style={styles.modalButton}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity activeOpacity={0.7} onPress={() => {setModalOpen(false), changeConfigInfo(date)}}>
                <Text style={styles.modalButton}>Guardar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {missing &&
        <Text style={styles.textAlert}>{missing}</Text>
      }

      <TouchableOpacity style={styles.boton} onPress={() => checkInfo()}>
        <Boton 
          margintop={20}
          press={() => handleEditShift()}
          block={employerEdit === "" || !shiftEntryEdit || blockSubmit ? true : false}
          to={`/calendar/shifts/${pressedDate}`} 
          text="Guardar cambios" 
          color={theme.colors.verdeBoton}
        />
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create ({
  container: {
    padding: 8,
    marginTop: 100
  },
  textoConf: {
    alignSelf: "center",
    color: theme.colors.grisOscuro,
    fontWeight: '800',
    fontSize: theme.fontSizes.F20,
  },
  botonCerrar: {
    position: "absolute",
    top: -80,
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
    fontSize: theme.fontSizes.F20,
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
    marginTop: -20
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
  }
})
