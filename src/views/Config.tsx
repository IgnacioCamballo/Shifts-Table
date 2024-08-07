import React, { useState } from 'react'
import { Modal, StyleSheet, Text, TouchableOpacity, View, Platform, Alert, ScrollView } from 'react-native'
import CheckBox from '@react-native-community/checkbox';
import DatePicker from 'react-native-date-picker'
import Constants from "expo-constants"
import useCalendar from '../hooks/useCalendar'
import theme from '../theme'
import Empleador from '../components/Empleador'
import Boton from '../components/Boton'
import { formattedMinutes } from '../utils'
import Icon from 'react-native-vector-icons/AntDesign';

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
  const [showDelete, setShowDelete] = useState(false)

  const selectedTime = () => {
    switch(timeType) {
      case "entrada": 
        setDate(config.entry ? config.entry : new Date())
        setShowDelete(config.entry ? true : false)
        break
      case "salida":
        setDate(config.exit ? config.exit : new Date())
        setShowDelete(config.exit ? true : false)
        break
      case "descanso":
        setDate(config.configBreak ? config.configBreak : new Date(0))
        setShowDelete(config.configBreak ? true : false)
    }
  }

  const changeConfigInfo = (newDate: Date | null) => {
    if(timeType === "entrada") {
      const configDateChanged = {
        entry: newDate,
        exit: config.exit ? config.exit : null,
        configBreak: config.configBreak ? config.configBreak : null
      }
      setConfigInfo(configDateChanged)
    }
    if(timeType === "salida") {
      const configDateChanged = {
        entry: config.entry ? config.entry : null,
        exit: newDate,
        configBreak: config.configBreak ? config.configBreak : null
      }
      setConfigInfo(configDateChanged)
    }
    if(timeType === "descanso") {
      const configDateChanged = {
        entry: config.entry ? config.entry : null,
        exit: config.exit ? config.exit : null,
        configBreak: newDate
      }
      setConfigInfo(configDateChanged)
    } 
    setTimeType("")
  }

  const showAlert = () => {
    Alert.alert(
      '',
      `¿seguro deseas eliminar la hora de ${timeType}?`,
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
              <Text style={styles.textLine}>
                {config.configBreak === null || 
                  (config.configBreak.getHours() === 0 && config.configBreak.getMinutes() === 0) 
                  ? "0" 
                  : `${config.configBreak?.getHours()}:${formattedMinutes(config.configBreak)}`
                }
              </Text>
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
              mode='time'
              locale='es'
              date={date}
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

      <View style={styles.empleadores}>
        <View>
          <Text style={styles.textoConf}>Empleadores</Text>
        </View>
        
        <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
          {companysInfo.length === 0 ? <Text style={styles.textNotEmployers}>Aún no hay empleadores</Text> : 
            companysInfo.map(employer => (
              <Empleador key={employer.name} employer={employer}/>
            ))
          }
        </ScrollView>
        
        <Boton margintop={20} block={false} press={() => {}} to='/config/newEmployer' text="Registrar Empleador" color={theme.colors.verdeBoton}/>
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
    color: theme.colors.grisOscuro,
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
  scrollView: {
    maxHeight: theme.heigth.configScrollView
  }
})