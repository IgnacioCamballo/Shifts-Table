import React, { useState } from 'react'
import { Modal, StyleSheet, Text, TouchableOpacity, View, Platform, Alert, ScrollView } from 'react-native'
import DatePicker from 'react-native-date-picker'
import Constants from "expo-constants"
import useCalendar from '../hooks/useCalendar'
import theme from '../theme/theme'
import Employer from '../components/Molecules/Employer'
import { formattedMinutes } from '../utils'
import Icon from 'react-native-vector-icons/AntDesign';
import { Picker } from '@react-native-picker/picker'
import Button from '../components/Atoms/Buttons/Button'
import translations from "../lenguages/lenguages.json"

export default function Config() {
  const {
    configInfo,
    companysInfo,
    lenguage,
    setConfigInfo,
    setLenguage
  } = useCalendar()

  let config = {...configInfo}

  const [timeType, setTimeType] = useState("")
  const [date, setDate] = useState(new Date())
  const [modalOpen, setModalOpen] = useState(false)
  const [showDelete, setShowDelete] = useState(false)

  //called when pressing on default entry, exit or break. Sets data to open de correct modal and edit the correct info
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
      case "descansoEntrada":
        setDate(config.configBreakEntry ? config.configBreakEntry : new Date())
        setShowDelete(config.configBreakEntry ? true : false)
        break
      case "descansoSalida":
        setDate(config.configBreakExit ? config.configBreakEntry! : new Date())
        setShowDelete(config.configBreakExit ? true : false)
    }
  }

  //takes the new default time when changing default entry, exit or break. and sets the new data
  const changeConfigInfo = (newDate: Date | null) => {
    if(timeType === "entrada") {
      const configDateChanged = {
        entry: newDate,
        exit: config.exit || null,
        configBreakEntry: config.configBreakEntry || null,
        configBreakExit: config.configBreakExit || null
      }
      setConfigInfo(configDateChanged)
    }
    if(timeType === "salida") {
      const configDateChanged = {
        entry: config.entry || null,
        exit: newDate,
        configBreakEntry: config.configBreakEntry || null,
        configBreakExit: config.configBreakExit || null
      }
      setConfigInfo(configDateChanged)
    }
    if(timeType === "descansoEntrada") {
      const configDateChanged = {
        entry: config.entry ? config.entry : null,
        exit: config.exit ? config.exit : null,
        configBreakEntry: newDate,
        configBreakExit: config.configBreakExit || null      }
      setConfigInfo(configDateChanged)
    } 
    if(timeType === "descansoSalida") {
      const configDateChanged = {
        entry: config.entry ? config.entry : null,
        exit: config.exit ? config.exit : null,
        configBreakEntry: config.configBreakEntry || null,
        configBreakExit: newDate      
      }
      setConfigInfo(configDateChanged)
    } 
    setTimeType("")
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

  //alert called when deleting default entry, exit or break
  const showAlert = () => {
    Alert.alert(
      '',
      translations.defaultDeleteAlert.find(i => i.lenguage === lenguage)?.text,
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

  return (
    <View style={styles.container}>
      <View style={styles.configGeneral}>
        <View style={styles.tituloConf}>
          <Text style={styles.textoConf}>{translations.lenguage.find(i => i.lenguage === lenguage)?.text}</Text>
        </View>

        <View style={styles.pickerContainer}>
            <Picker
              selectedValue={lenguage}
              onValueChange={newValue => setLenguage(newValue)}
              style={styles.picker}
              accessibilityLabel={translations.selectLenguage.find(i => i.lenguage === lenguage)?.text}
              mode='dropdown'
              >
                <Picker.Item style={styles.pickerItem} label='Español' value="es"/>
                <Picker.Item style={styles.pickerItem} label='English' value="en"/>
                <Picker.Item style={styles.pickerItem} label='Portugues' value="pt"/>
            </Picker>
          </View>
      </View>

      <View style={styles.configGeneral}>
        <View style={styles.tituloConf}>
          <Text style={styles.textoConf}>{translations.defaultHours.find(i => i.lenguage === lenguage)?.text}</Text>
        </View>

        <View>
          <TouchableOpacity 
            activeOpacity={0.8} 
            style={styles.line}
            onPress={() => {setTimeType("entrada"), setModalOpen(true)}}
          >
            <Text style={styles.textLine}>{translations.entryHour.find(i => i.lenguage === lenguage)?.text}:</Text>
            <View >
              <Text style={styles.textLine}>{config.entry ? `${config.entry.getHours()}:${formattedMinutes(config.entry)}` : "-"}</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            activeOpacity={0.8} 
            style={styles.line}
            onPress={() => {setTimeType("salida"), setModalOpen(true)}}
          >
            <Text style={styles.textLine}>{translations.exitHour.find(i => i.lenguage === lenguage)?.text}:</Text>
            <View >
              <Text style={styles.textLine}>{config.exit ? `${config.exit.getHours()}:${formattedMinutes(config.exit)}` : "-"}</Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity 
            activeOpacity={0.8} 
            style={styles.line}
            disabled={config.entry === null || undefined}
            onPress={() => {setTimeType("descansoEntrada"), setModalOpen(true)}}
          >
            <Text style={styles.textLine}>{translations.breakStart.find(i => i.lenguage === lenguage)?.text}:</Text>
            <View >
              <Text style={styles.textLine}>{config.configBreakEntry ? `${config.configBreakEntry.getHours()}:${formattedMinutes(config.configBreakEntry)}` : "-"}</Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity 
            activeOpacity={0.8} 
            style={styles.line}
            disabled={config.configBreakEntry === null || undefined}
            onPress={() => {setTimeType("descansoSalida"), setModalOpen(true)}}
          >
            <Text style={styles.textLine}>{translations.breakEnd.find(i => i.lenguage === lenguage)?.text}:</Text>
            <View >
              <Text style={styles.textLine}>{config.configBreakExit ? `${config.configBreakExit.getHours()}:${formattedMinutes(config.configBreakExit)}` : "-"}</Text>
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
              mode='time'
              locale='es'
              date={date}
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

      <View style={styles.empleadores}>
        <View>
          <Text style={styles.textoConf}>{translations.employers.find(i => i.lenguage === lenguage)?.text}</Text>
        </View>
        
        <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
          {companysInfo.length === 0 ? <Text style={styles.textNotEmployers}>{translations.noEmployersYet.find(i => i.lenguage === lenguage)?.text}</Text> : 
            companysInfo.map(employer => (
              <Employer key={employer.key} employer={employer}/>
            ))
          }
        </ScrollView>
        
        <Button margintop={20} to='/config/newEmployer' color={theme.colors.verdeBoton}>
          <Text style={styles.textoBoton}>{translations.createNewEmployer.find(i => i.lenguage === lenguage)?.text}</Text>
        </Button>
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
  },
  pickerContainer: {
    height: 40,
    justifyContent: "center",
    marginBottom: 20,
    marginTop: 10,
    borderColor: theme.colors.grisMedio,
    borderWidth: 1,
    borderRadius:4
  },
  picker: {
    marginLeft: "39%"
  },
  pickerItem: {
    textAlign: "center",
    fontSize: 20,
    color: "black"
  },
  textoBoton: {
    fontSize: theme.fontSizes.F18,
    fontWeight: "500"    
  }
})