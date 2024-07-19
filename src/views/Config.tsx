import React, { useState } from 'react'
import { Modal, StyleSheet, Text, TouchableOpacity, View, Platform } from 'react-native'
import CheckBox from '@react-native-community/checkbox';
import DatePicker from 'react-native-date-picker'
import Constants from "expo-constants"
import useCalendar from '../hooks/useCalendar'
import theme from '../theme'
import Empleador from '../components/Empleador'
import Boton from '../components/Boton'
import { formattedMinutes } from '../utils'

export default function Config() {
  const {
    configInfo,
    companysInfo,
    setConfigInfo,
  } = useCalendar()

  let config = {...configInfo}

  const [timeType, setTimeType] = useState("")
  const [date, setDate] = useState(new Date())
  const [modalOpen, setModalOpen] = useState(false)
  const [toggleCheckBox, setToggleCheckBox] = useState(false)

  const selectedTime = () => {
    switch(timeType) {
      case "entrada": 
        setDate(config.entry ? config.entry : new Date())
        setToggleCheckBox(config.entry ? true : false)
        break
      case "salida":
        setDate(config.exit ? config.exit : new Date())
        setToggleCheckBox(config.exit ? true : false)
        break
      case "descanso":
        setDate(new Date(0))
        setToggleCheckBox(true)
    }
  }

  const changeConfigInfo = (newDate: Date) => {
    if(timeType === "entrada") {
      const configDateChanged = {
        entry: toggleCheckBox ? newDate : null,
        exit: config.exit ? config.exit : null,
        configBreak: config.configBreak ? config.configBreak : 0
      }
      setConfigInfo(configDateChanged)
    }
    if(timeType === "salida") {
      const configDateChanged = {
        entry: config.entry ? config.entry : null,
        exit: toggleCheckBox ? newDate : null,
        configBreak: config.configBreak ? config.configBreak : 0
      }
      setConfigInfo(configDateChanged)
    }
    if(timeType === "descanso") {
      const configDateChanged = {
        entry: config.entry ? config.entry : null,
        exit: config.exit ? config.exit : null,
        configBreak: newDate.getHours() + newDate.getMinutes()/60
      }
      setConfigInfo(configDateChanged)
    }
    
    setTimeType("")
  }

  return (
    <View style={styles.container}>
      <View style={styles.configGeneral}>
        <View style={styles.tituloConf}>
          <Text style={styles.textoConf}>Configuracion Predeterminada</Text>
        </View>

        <View>
          <TouchableOpacity 
            activeOpacity={0.8} 
            style={styles.line}
            onPress={() => {setTimeType("entrada"), setModalOpen(true)}}
          >
            <Text style={styles.textLine}>Hora de entrada:</Text>
            <View >
              <Text style={styles.textLine}>{config.entry ? `${config.entry.getHours()}:${formattedMinutes(config.entry)}` : "-"}</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            activeOpacity={0.8} 
            style={styles.line}
            onPress={() => {setTimeType("salida"), setModalOpen(true)}}
          >
            <Text style={styles.textLine}>Hora de salida:</Text>
            <View >
              <Text style={styles.textLine}>{config.exit ? `${config.exit.getHours()}:${formattedMinutes(config.exit)}` : "-"}</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            activeOpacity={0.8} 
            style={styles.line}
            onPress={() => {setTimeType("descanso"), setModalOpen(true)}}
          >
            <Text style={styles.textLine}>Descanso:</Text>
            <View >
              <Text style={styles.textLine}>{`${config.configBreak?.toFixed(2)}Hs`}</Text>
            </View>
          </TouchableOpacity>
        </View>
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
              {timeType !== "descanso" && 
                <CheckBox 
                  style={styles.checkbox}
                  disabled={false}
                  value={toggleCheckBox}
                  onValueChange={(newValue) => setToggleCheckBox(newValue)}
                />
              }
            </View>
            
            {!toggleCheckBox ? <View style={styles.view}></View> : 
              <DatePicker 
                mode='time'
                locale='es'
                date={date}
                onDateChange={setDate}
                dividerColor={theme.colors.verdeBase}
                is24hourSource={timeType === "descanso" ? "locale" : "device"}
              />
            }
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

      <View style={styles.empleadores}>
        <View>
          <Text style={styles.textoConf}>Empleadores</Text>
        </View>
        
        {companysInfo.length === 0 ? <Text style={styles.textNotEmployers}>Aún no hay empleadores</Text> : 
          companysInfo.map(employer => (
            <Empleador key={employer.name} employer={employer}/>
          ))
        }
        
        <Boton block={false} press={() => {}} to='/config/newEmployer' text="Registrar Empleado" color={theme.colors.verdeBoton}/>
      </View>
    </View>
  )
}

const styles = StyleSheet.create ({
  container: {
    padding: 8
  },
  configGeneral: {
    marginTop: 10
  },
  tituloConf: {
    borderBottomWidth: 2,
    width: "100%",
  },
  textoConf: {
    alignSelf: "center",
    color: theme.colors.verdeOscuro,
    fontWeight: '800',
    fontSize: theme.fontSizes.F20,
    marginBottom: 3
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
    fontSize: theme.fontSizes.F20,
    fontWeight: '400'
  },
  empleadores: {
    marginTop: 30
  },
  textNotEmployers: {
    textAlign: "center",
    paddingTop: 20,
    fontSize: theme.fontSizes.F16,
    borderTopWidth: 2,
    width: "100%",
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
    gap: 12
  },
  modalTitle: {
    fontSize: 24,
  },
  checkbox: {
    position: "relative",
    top: 2
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
  }
})