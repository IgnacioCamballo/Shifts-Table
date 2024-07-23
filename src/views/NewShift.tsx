import React, { useEffect, useRef, useState } from 'react'
import { StyleSheet, Text, TextInput, TouchableOpacity, View, Modal, Platform, Alert, Animated, ViewStyle } from 'react-native'
import { Link, useParams } from 'react-router-native'
import Constants from "expo-constants"

import useCalendar from '../hooks/useCalendar'
import theme from '../theme'
import Boton from '../components/Boton'
import BotonChico from '../components/BotonChico'
import DatePicker from 'react-native-date-picker'
import { firstLetterUpper, formattedMinutes, formattedMinutesNumber } from '../utils'
import Icon from 'react-native-vector-icons/AntDesign'
import { Picker } from '@react-native-picker/picker'
import { ShiftProps } from '../types'

export default function NewShift() {
  const params = useParams()
  const pressedDate = new Date(params.date!)
  let lenguage = "es"

  const {configInfo, companysInfo, shifts, setShifts} = useCalendar()

  const [employer, setEmployer] = useState("")
  const [shiftEntry, setShiftEntry] = useState<Date | null>(configInfo.entry ? new Date(pressedDate.getFullYear(), pressedDate.getMonth(), pressedDate.getDate() ,configInfo.entry?.getHours(), configInfo.entry?.getMinutes()) : null)
  const [shiftExit, setShiftExit] = useState<Date | null>(configInfo.exit ? new Date(pressedDate.getFullYear(), pressedDate.getMonth(), pressedDate.getDate() ,configInfo.exit?.getHours(), configInfo.exit?.getMinutes()): null)
  const [shiftBreak, setShiftBreak] = useState(configInfo.configBreak)
  const [workedHours, setWorkedHours] = useState<number | null>(null)
  const [workedMinutes, setWorkedMinutes] = useState<number | null>(null)
  const [paid, setPaid] = useState(false)
  const [note, setNote] = useState("")

  const [missing, setMissing] = useState("")

  const animatedValue = useRef(new Animated.Value(paid ? 1 : 0)).current
  const animatedValue2 = useRef(new Animated.Value(paid ? 1 : 0)).current

  const [timeType, setTimeType] = useState("")
  const [date, setDate] = useState<Date | null>(pressedDate)
  const [modalOpen, setModalOpen] = useState(false)
  const [showDelete, setShowDelete] = useState(false)

  const selectedTime = () => {
    switch(timeType) {
      case "entrada": 
        setDate(shiftEntry ? shiftEntry : pressedDate)
        setShowDelete(shiftEntry ? true : false)
        break
      case "salida":
        setDate(shiftExit ? shiftExit : (shiftEntry ? shiftEntry : pressedDate))
        setShowDelete(shiftExit ? true : false)
        break
      case "descanso":
        setDate(shiftBreak ? shiftBreak : pressedDate)
        setShowDelete(shiftBreak ? true : false)
    }
  }

  const changeConfigInfo = (newDate: Date | null) => {
    if(timeType === "entrada") {
      setShiftEntry(newDate!)
    }
    if(timeType === "salida") {
      setShiftExit(newDate!)
      if (newDate !== null) {
        if (newDate!.getDate() === shiftEntry!.getDate() && (newDate!.getHours() < shiftEntry!.getHours() || (newDate!.getHours() === shiftEntry!.getHours() && newDate!.getMinutes() < shiftEntry!.getMinutes()))) {
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
    if(shiftEntry !== null && shiftExit !== null) {
      const difMonth = shiftExit!.getMonth() !== shiftEntry!.getMonth()
      const daysInMonth = new Date(pressedDate.getFullYear(), pressedDate.getMonth() + 1, 0).getDate();
      
      const dayDiference = shiftExit!.getDate() - shiftEntry!.getDate()    
      const minutes = ((shiftExit!.getMinutes() < shiftEntry!.getMinutes()) ?
        shiftExit!.getMinutes() + (60 - shiftEntry!.getMinutes()):
        shiftExit!.getMinutes() - shiftEntry!.getMinutes()
      ) 
      const minutesWithBreak = ((shiftBreak === undefined || shiftBreak === null) ? minutes : 
        (minutes - shiftBreak!.getMinutes() >= 0 ? minutes - shiftBreak!.getMinutes() : 60 + (minutes - shiftBreak!.getMinutes()))
      )
      
      setWorkedMinutes(minutesWithBreak)

      if(dayDiference === 0) {
        const hours = (
          shiftExit!.getHours() - shiftEntry!.getHours()  
          - (shiftExit!.getMinutes() < shiftEntry!.getMinutes() ? 1 : 0) 
          - ((shiftBreak === undefined || shiftBreak === null) ? 0 : minutes - shiftBreak!.getMinutes() < 0 ? 1 : 0)
          - ((shiftBreak === undefined || shiftBreak === null) ? 0 : shiftBreak!.getHours())
        )
        if(hours >= 0) {
          setWorkedHours(hours)
        } else {       
          setWorkedHours(null)
          setWorkedMinutes(null)
        }
      } else {
        const hours = (
          (24 - shiftEntry!.getHours()) 
          - (shiftExit!.getMinutes() < shiftEntry!.getMinutes() ? 1 : 0) 
          - ((shiftBreak === undefined || shiftBreak === null) ? 0 : minutes - shiftBreak!.getMinutes() < 0 ? 1 : 0)
          - ((shiftBreak === undefined || shiftBreak === null) ? 0 : shiftBreak!.getHours())
          + (difMonth ? 24 * ((daysInMonth - shiftEntry!.getDate()) + (shiftExit!.getDate() -1)) : 24 * (dayDiference - 1)) 
          + shiftExit!.getHours()
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


  }, [shiftEntry, shiftExit, shiftBreak])

  const showAlert = () => {
    Alert.alert(
      'Alerta',
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
  
  const textDay = () => {
    const weekdaysArray = [...Array(7).keys()]
    const intlWeekDay = new Intl.DateTimeFormat(lenguage, {weekday: "short"})
    const weekDays = weekdaysArray.map(weekDayIndex => {
      const weekDayName = intlWeekDay.format(new Date(2021, 10, weekDayIndex))
      return weekDayName
    })
    const day = firstLetterUpper(weekDays[shiftExit!.getDay()])
    
    return (day)
  }

  const handlePress = () => {
    Animated.parallel([
      Animated.timing(animatedValue, {
        toValue: paid ? 0 : 1,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(animatedValue2, {
        toValue: paid ? 0 : 1,
        duration: 150,
        useNativeDriver: true,
      })
    ]).start();
    setPaid(!paid);
  }

  const animatedStyles = {
    backgroundColor: animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [theme.colors.grisClaro, theme.colors.verdeMedio]
    })
  }

  const animatedStyles2 = {
    transform: [
      {
        translateX: animatedValue2.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 14]
        })
      }
    ]
  }

  const handleSaveShift = () => {
    const newShift: ShiftProps = {
      employer: employer, 
      shiftEntry: shiftEntry!, 
      shiftExit: shiftExit, 
      shiftBreak: shiftBreak, 
      workedHours: workedHours,
      workedMinutes: workedMinutes,
      paid: paid,
      note: note
    }
    const updatedshifts = [...shifts, newShift]
    setShifts(updatedshifts)
  }

  const checkInfo = () => {
    if (employer === "" && !shiftEntry) {setMissing("Empleador y entrada son obligatorios")}
    if (employer === "" && shiftEntry) {setMissing("Empleador es obligatorio")}
    if (employer !== "" && !shiftEntry) {setMissing("Entrada es obligatorio")}
  }

  return (
    <View style={styles.container}>
      <Link 
        to={`/calendar/shifts/${pressedDate}`}
        activeOpacity={0.7} 
        style={styles.botonCerrar}
        underlayColor="none"
        >
        <BotonChico text='x' color={theme.colors.grisClaro}/>
      </Link>

      <View>
        <Text style={styles.textoConf}>Nuevo Turno</Text>
      </View>

      <View style={styles.empleador}>
        <View style={styles.line}>
          <Text style={styles.textLine}>Empleador:</Text>
          
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={employer}
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
            <Text style={styles.textLine}>{shiftEntry ? `${shiftEntry.getHours()}:${formattedMinutes(shiftEntry)}` : "-"}</Text>
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
              {shiftExit && shiftEntry ?
                (shiftExit?.getDate() !== shiftEntry?.getDate() ? 
                  `${firstLetterUpper(shiftExit!.toLocaleDateString('es-ES', {month: 'short'}))} ${shiftExit?.getDate()} (${textDay()})  ` : "") 
                : ""
              }
              {shiftExit ? `${shiftExit.getHours()}:${formattedMinutes(shiftExit)}` : "-"}
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
            <Text style={styles.textLine}>{shiftBreak ? `${shiftBreak.getHours()}:${formattedMinutes(shiftBreak)}` : "0"}</Text>
          </View>
        </TouchableOpacity>
        
        <View style={styles.line}>
          <Text style={styles.textLine}>Horas trabajadas:</Text>
          <Text style={styles.textLine}>{workedHours !== null && workedMinutes !== null ? `${workedHours}:${formattedMinutesNumber(workedMinutes!)}` : "-"}</Text>
        </View>
        
        <View style={styles.lineLeft}>
          <Text style={styles.textLine}>Pagado</Text>
          <TouchableOpacity
            activeOpacity={1} 
            onPress={() => handlePress()}
          >
            <Animated.View style={[styles.slide_exterior, animatedStyles]}>
              <Animated.View style={[styles.slide_interior, animatedStyles2]}></Animated.View>
            </Animated.View>
          </TouchableOpacity>
        </View>
        
        <TextInput 
          value={note}
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
              mode={timeType === "salida" ? "datetime" : 'time'}
              minimumDate={shiftEntry && timeType === "salida" ? shiftEntry : pressedDate}
              maximumDate={timeType === "entrada" && shiftExit ? shiftExit : new Date(pressedDate!.getFullYear(), pressedDate!.getMonth(), pressedDate!.getDate() + 2, 23, 59)}
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
          press={() => handleSaveShift()}
          block={employer === "" || !shiftEntry ? true : false}
          to={`/calendar/shifts/${pressedDate}`} 
          text="Registrar Turno" 
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
    color: theme.colors.verdeOscuro,
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
