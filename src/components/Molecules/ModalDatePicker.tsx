import React, { useState } from 'react'
import { Modal, Text, View, StyleSheet, Platform, TouchableOpacity, Alert } from 'react-native'
import DatePicker from 'react-native-date-picker'
import Icon from 'react-native-vector-icons/AntDesign'
import Constants from "expo-constants"

import useCalendar from '@/hooks/useCalendar'
import theme from '@/theme/theme'
import { translate } from '@/utils'

type modalDatePickerPorps = {
    timeType: string,
    setTimeType: React.Dispatch<React.SetStateAction<string>>,
    entry: Date | null,
    setEntry: React.Dispatch<React.SetStateAction<Date | null>>,
    exit: Date | null,
    setExit: React.Dispatch<React.SetStateAction<Date | null>>,
    entryBreak: Date | null,
    setEntryBreak: React.Dispatch<React.SetStateAction<Date | null>>,
    exitBreak: Date | null,
    setExitBreak: React.Dispatch<React.SetStateAction<Date | null>>,
    modalOpen: boolean,
    setModalOpen: React.Dispatch<React.SetStateAction<boolean>>,
    pressedDate: Date
}

export default function ModalDatePicker(modalDatePickerPorps: modalDatePickerPorps) {
  const { lenguage = 'en' } = useCalendar() || {}
  const {
    timeType, setTimeType,
    entry, setEntry,
    exit, setExit,
    entryBreak, setEntryBreak,
    exitBreak, setExitBreak,
    modalOpen, setModalOpen,
    pressedDate
  } = modalDatePickerPorps

  const [showDelete, setShowDelete] = useState(false)
  const [date, setDate] = useState<Date | null>(pressedDate)

  //this way avoid of calling useCalendar in utils and translate can be used inside if functions
  function translateFn(text: string) {
    return translate({ text, lenguage })
  }

  //called when pressing on default entry, exit or break. Sets data to open de correct modal and edit the correct info
  const selectedTime = () => {
    switch (timeType) {
      case "entrada":
        setDate(entry || pressedDate)
        setShowDelete(entry ? true : false)
        break
      case "salida":
        setDate(exit || (entry || pressedDate))
        setShowDelete(exit ? true : false)
        break
      case "descansoEntrada":
        setDate(entryBreak || pressedDate)
        setShowDelete(entryBreak ? true : false)
        break
      case "descansoSalida":
        setDate(exitBreak || (entryBreak || pressedDate))
        setShowDelete(exitBreak ? true : false)
        break
      default:
        setDate(pressedDate)
        setShowDelete(false)
        break
    }
  }

  //sets the datePicker modal title
  const modalTitle = () => {
    switch (timeType) {
      case "entrada": return translateFn("entryHour")
      case "salida": return translateFn("exitHour")
      case "descansoEntrada": return translateFn("breakStart")
      case "descansoSalida": return translateFn("breakEnd")
      default: return translateFn("entryHour")
    }
  }

  //calls the alert when trying to delete entry, exit or break time
  const showAlert = () => {
    Alert.alert(
      '',
      translateFn("timeDeleteAlert"),
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

  //sets the date picker mode
  const datePickerMode = () => {
    switch (timeType) {
      case "entrada": return "time"
      case "salida": return "datetime"
      case "descansoEntrada": return exit && exit.getDate() === pressedDate.getDate() ? "time" : "datetime"
      case "descansoSalida": return exit && exit.getDate() === pressedDate.getDate() ? "time" : "datetime"
      default: return "time"
    }
  }

  //sets the minimum date for date picker
  const minDate = () => {
    switch (timeType) {
      case "salida": return entry || pressedDate
      case "descansoEntrada": return entry || entryBreak || pressedDate
      case "descansoSalida": return entryBreak || (entry || pressedDate)
      default: return undefined
    }
  }

  //sets the maximum date for date picker
  const maxDate = () => {
    switch (timeType) {
      case "entrada": return exit || new Date(pressedDate.getFullYear(), pressedDate.getMonth(), pressedDate.getDate() + 2, 23, 59)
      case "salida": return new Date(pressedDate.getFullYear(), pressedDate.getMonth(), pressedDate.getDate() + 2, 23, 59)
      case "descansoEntrada": return exit || undefined
      case "descansoSalida": return exit || new Date(pressedDate.getFullYear(), pressedDate.getMonth(), pressedDate.getDate() + 2, 23, 59)
      default: return undefined
    }
  }

  //takes the new time when changing entry, exit or break. and sets the new data
  const changeConfigInfo = (newDate: Date | null) => {
    if (timeType === "entrada") {
      setEntry(newDate)
    }
    if (timeType === "salida") {
      setExit(newDate)

      if (newDate !== null && newDate.getDate() === entry!.getDate() && (newDate.getHours() < entry!.getHours() || (newDate.getHours() === entry!.getHours() && newDate.getMinutes() < entry!.getMinutes()))) {
        setEntry(null)
      }
    }
    if (timeType === "descansoEntrada") {
      setEntryBreak(newDate)
    }
    if (timeType === "descansoSalida") {
      setExitBreak(newDate)
    }
    setTimeType("")
  }


  if (modalOpen) return (
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
            mode={datePickerMode()}
            minimumDate={minDate()}
            maximumDate={maxDate()}
            locale={lenguage}
            date={date || pressedDate}
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
  )
}

const styles = StyleSheet.create({
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
  modalButtons: {
    flexDirection: "row",
    gap: 28,
    alignSelf: "flex-end"
  },
  modalButton: {
    fontSize: theme.fontSizes.F18
  },
})
