import React, { useRef, useState } from 'react'
import { Alert, View, Text, TouchableOpacity, StyleSheet, Animated, Modal, Platform } from 'react-native'
import Constants from "expo-constants"
import DatePicker from 'react-native-date-picker'
import Icon from 'react-native-vector-icons/AntDesign'

import useCalendar from '../../hooks/useCalendar'
import theme from '../../theme/theme'
import { formattedMinutes, translate } from '../../utils'

export default function ConfigDefaultTimes() {
  const {lenguage, configInfo, setConfigInfo} = useCalendar()

  const [hoursOpen, setHoursOpen] = useState(false)
  const [timeType, setTimeType] = useState("")
  const [date, setDate] = useState(new Date())
  const [modalOpen, setModalOpen] = useState(false)
  const [showDelete, setShowDelete] = useState(false)

  let config = { ...configInfo }

  //this way avoid of calling useCalendar in utils and translate can be used inside if functions
  function translateFn(text: string) {
    return translate({ text, lenguage })
  }

  //called when pressing on default entry, exit or break. Sets data to open de correct modal and edit the correct info
  const selectedTime = () => {
    switch (timeType) {
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

  //sets the modal title
  const modalTitle = () => {
    switch (timeType) {
      case "entrada": return translateFn("entryHour")
      case "salida": return translateFn("exitHour")
      case "descansoEntrada": return translateFn("breakStart")
      case "descansoSalida": return translateFn("breakEnd")
    }
  }

  //alert called when deleting default entry, exit or break
  const showAlert = () => {
    Alert.alert(
      '',
      translateFn("defaultDeleteAlert"),
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

  //takes the new default time when changing default entry, exit or break. and sets the new data
  const changeConfigInfo = (newDate: Date | null) => {
    const configDateChanged = {
      entry: timeType === "entrada" ? newDate : config.entry || null,
      exit: timeType === "salida" ? newDate : config.exit || null,
      configBreakEntry: timeType === "descansoEntrada" ? newDate : config.configBreakEntry || null,
      configBreakExit: timeType === "descansoSalida" ? newDate : config.configBreakExit || null
    }
    
    setConfigInfo(configDateChanged)
    setTimeType("")
  }

  //manage the default hours animation
  const hoursValue = useRef(new Animated.Value(hoursOpen ? 1 : 0)).current
  const handlePress = () => {
    Animated.parallel([
      Animated.timing(hoursValue, {
        toValue: hoursOpen ? 0 : 1,
        duration: 300,
        useNativeDriver: false,
      })
    ]).start();
    setHoursOpen(!hoursOpen);
  }
  const heightChange = {
    maxHeight: hoursValue.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 200]
    })
  }
  const rotateArrow = {
    transform: [
      {
        rotate: hoursValue.interpolate({
          inputRange: [0, 1],
          outputRange: ["-90deg", "0deg"]
        })
      },
      {
        translateY: hoursValue.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -2]
        })
      }
    ]
  }

  return (
    <View style={styles.configGeneral}>
      <TouchableOpacity
        activeOpacity={0.8}
        style={styles.tituloConf}
        onPress={() => handlePress()}
      >
        <Animated.View style={[rotateArrow]}>
          <Icon
            name="caretdown"
            color={theme.colors.verdeBase}
            size={20}
            style={styles.arrow}
          />
        </Animated.View>
        <Text style={styles.textoConf}>{translateFn("defaultHours")}</Text>
      </TouchableOpacity>
      <Animated.View style={[styles.heightAuto, heightChange]}>
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.line}
          onPress={() => { setTimeType("entrada"), setModalOpen(true) }}
        >
          <Text style={styles.textLine}>{translateFn("entryHour")}:</Text>
          <View >
            <Text style={styles.textLine}>{config.entry ? `${config.entry.getHours()}:${formattedMinutes(config.entry)}` : "-"}</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.line}
          onPress={() => { setTimeType("salida"), setModalOpen(true) }}
        >
          <Text style={styles.textLine}>{translateFn("exitHour")}:</Text>
          <View >
            <Text style={styles.textLine}>{config.exit ? `${config.exit.getHours()}:${formattedMinutes(config.exit)}` : "-"}</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.line}
          onPress={() => { setTimeType("descansoEntrada"), setModalOpen(true) }}
        >
          <Text style={styles.textLine}>{translateFn("breakStart")}:</Text>
          <View >
            <Text style={styles.textLine}>{config.configBreakEntry ? `${config.configBreakEntry.getHours()}:${formattedMinutes(config.configBreakEntry)}` : "-"}</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.line}
          onPress={() => { setTimeType("descansoSalida"), setModalOpen(true) }}
        >
          <Text style={styles.textLine}>{translateFn("breakEnd")}:</Text>
          <View >
            <Text style={styles.textLine}>{config.configBreakExit ? `${config.configBreakExit.getHours()}:${formattedMinutes(config.configBreakExit)}` : "-"}</Text>
          </View>
        </TouchableOpacity>
      </Animated.View>

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
              mode='time'
              locale='es'
              date={date}
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
    </View>
  )
}

const styles = StyleSheet.create({
  configGeneral: {
    marginVertical: 10
  },
  tituloConf: {
    flexDirection: "row",    
    justifyContent: "center",
    alignItems: "center",
    borderBottomWidth: 2,
    width: "100%",
    gap: 12
  },
  textoConf: {
    alignSelf: "center",
    color: theme.colors.grisOscuro,
    fontWeight: '800',
    fontSize: theme.fontSizes.F20,
    marginBottom: 3
  },
  arrow: {
    position: "relative",
    width: 20,
    height: 20
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
  heightAuto: {
    height: "auto",
    overflow: "hidden"
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
})