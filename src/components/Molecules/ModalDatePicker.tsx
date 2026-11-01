import React, { useState } from 'react'
import { Modal, Text, View, StyleSheet, Platform, TouchableOpacity, Alert, ScrollView } from 'react-native'
import DatePicker from 'react-native-date-picker'
import Icon from 'react-native-vector-icons/AntDesign'
import Constants from "expo-constants"

import useCalendar from '@/hooks/useCalendar'
import theme from '@/theme/theme'
import { formattedMinutes, translate } from '@/utils'
import { minutesOfDay } from '@/utils/datesCompare'

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

//height of each row of the default times list
const PRESETS_ROW_HEIGHT = 44

/**
 * Modal to pick the entry, exit or break times of a shift. It only picks a clock time: the form is in
 * charge of putting it on the right day. When the field has several default times, the modal shows
 * a "default" tab to pick one of them and an "other time" tab with the wheel.
 */
export default function ModalDatePicker(modalDatePickerPorps: modalDatePickerPorps) {
  const { lenguage = 'en', configInfo } = useCalendar() || {}
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
  const [tab, setTab] = useState<"presets" | "manual">("presets")
  //position in the default times list of the selected one, null if none is selected
  const [selectedPreset, setSelectedPreset] = useState<number | null>(null)

  //this way avoid of calling useCalendar in utils and translate can be used inside if functions
  function translateFn(text: string) {
    return translate({ text, lenguage })
  }

  //default times of the field being edited
  const presetTimes = () => {
    switch (timeType) {
      case "entrada": return configInfo.entry ?? []
      case "salida": return configInfo.exit ?? []
      case "descansoEntrada": return configInfo.configBreakEntry ?? []
      case "descansoSalida": return configInfo.configBreakExit ?? []
      default: return []
    }
  }

  //time the field being edited has right now
  const currentTime = () => {
    switch (timeType) {
      case "entrada": return entry
      case "salida": return exit
      case "descansoEntrada": return entryBreak
      case "descansoSalida": return exitBreak
      default: return null
    }
  }

  const presets = presetTimes()
  //with only one default time the form fills it by itself, so the tabs are only for several
  const hasPresets = presets.length > 1
  const showPresets = hasPresets && tab === "presets"

  const formattedTime = (time: Date) => `${time.getHours()}:${formattedMinutes(time)}`

  //called when pressing on entry, exit or break. Sets data to open de correct modal and edit the correct info
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

    //opens on the default times, unless the current time is not one of them
    const current = currentTime()
    const matchIndex = current ? presets.findIndex(preset => minutesOfDay(preset) === minutesOfDay(current)) : -1
    setSelectedPreset(matchIndex >= 0 ? matchIndex : null)
    setTab(current && matchIndex < 0 ? "manual" : "presets")
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

  //takes the new time when changing entry, exit or break. and sets the new data
  //the form rearranges the days of all the times when they change
  const changeConfigInfo = (newDate: Date | null) => {
    if (timeType === "entrada") {
      setEntry(newDate)
    }
    if (timeType === "salida") {
      setExit(newDate)
    }
    if (timeType === "descansoEntrada") {
      setEntryBreak(newDate)
    }
    if (timeType === "descansoSalida") {
      setExitBreak(newDate)
    }
    setTimeType("")
  }

  const selectPreset = (index: number) => {
    setSelectedPreset(index)
    setDate(presets[index])
  }

  const saveDisabled = showPresets && selectedPreset === null

  const save = () => {
    setModalOpen(false)
    changeConfigInfo(showPresets ? presets[selectedPreset!] : date)
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

          {hasPresets && (
            <View style={styles.tabs}>
              <TouchableOpacity
                activeOpacity={0.8}
                style={[styles.tab, styles.tabLeft, tab === "presets" && styles.tabSelected]}
                accessibilityRole="tab"
                accessibilityState={{ selected: tab === "presets" }}
                onPress={() => setTab("presets")}
              >
                <Text style={[styles.tabText, tab === "presets" && styles.tabTextSelected]}>{translateFn("defaultTimes")}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.8}
                style={[styles.tab, styles.tabRight, tab === "manual" && styles.tabSelected]}
                accessibilityRole="tab"
                accessibilityState={{ selected: tab === "manual" }}
                onPress={() => setTab("manual")}
              >
                <Text style={[styles.tabText, tab === "manual" && styles.tabTextSelected]}>{translateFn("otherTime")}</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* the wheel always sets the size of this area, the list is placed over it so the modal does not jump between tabs */}
          <View style={styles.pickerArea}>
            <View
              style={[styles.pickerPanel, showPresets && styles.panelHidden]}
              pointerEvents={showPresets ? "none" : "auto"}
              aria-hidden={showPresets}
            >
              <DatePicker
                theme='light'
                mode="time"
                locale={lenguage}
                date={date || pressedDate}
                onDateChange={setDate}
                dividerColor={theme.colors.verdeBase}
                is24hourSource="device"
              />
            </View>

            {hasPresets && (
              <ScrollView
                style={[styles.presetsPanel, !showPresets && styles.panelHidden]}
                pointerEvents={showPresets ? "auto" : "none"}
                aria-hidden={!showPresets}
                showsVerticalScrollIndicator={false}
              >
                {presets.map((preset, index) => (
                  <TouchableOpacity
                    key={`${preset.getHours()}:${preset.getMinutes()}`}
                    activeOpacity={0.8}
                    style={[styles.presetRow, selectedPreset === index && styles.presetRowSelected]}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: selectedPreset === index }}
                    onPress={() => selectPreset(index)}
                  >
                    <View style={[styles.radio, selectedPreset === index && styles.radioSelected]}>
                      <View style={[styles.radioDot, selectedPreset === index && styles.radioDotSelected]} />
                    </View>
                    <Text style={[styles.presetText, selectedPreset === index && styles.presetTextSelected]}>{formattedTime(preset)}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>

          <View style={styles.modalButtons}>
            <TouchableOpacity activeOpacity={0.7} onPress={() => { setModalOpen(false), setTimeType("") }}>
              <Text style={styles.modalButton}>{translateFn("cancel")}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.7}
              disabled={saveDisabled}
              accessibilityState={{ disabled: saveDisabled }}
              onPress={save}
            >
              <Text style={[styles.modalButton, saveDisabled && styles.modalButtonDisabled]}>{translateFn("save")}</Text>
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
    fontSize: 24,
    color: theme.colors.negro
  },
  delete: {
    position: "relative",
    top: 7
  },
  tabs: {
    flexDirection: "row",
    alignSelf: "stretch",
    marginTop: 12,
    marginBottom: 4
  },
  tab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: theme.colors.grisClaro
  },
  tabLeft: {
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12
  },
  tabRight: {
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12
  },
  tabSelected: {
    backgroundColor: theme.colors.azulClaro
  },
  tabText: {
    fontSize: theme.fontSizes.F16,
    color: theme.colors.negro
  },
  tabTextSelected: {
    fontWeight: "700"
  },
  pickerArea: {
    alignSelf: "stretch",
    alignItems: "center"
  },
  pickerPanel: {
    alignItems: "center"
  },
  presetsPanel: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: theme.colors.blanco
  },
  panelHidden: {
    opacity: 0
  },
  presetRow: {
    height: PRESETS_ROW_HEIGHT,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderColor: theme.colors.grisClaro
  },
  presetRowSelected: {
    backgroundColor: theme.colors.azulClaro
  },
  presetText: {
    fontSize: theme.fontSizes.F20,
    color: theme.colors.negro
  },
  presetTextSelected: {
    fontWeight: "700"
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: theme.colors.grisMedio,
    alignItems: "center",
    justifyContent: "center"
  },
  radioSelected: {
    borderColor: theme.colors.verdeBase
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "transparent"
  },
  radioDotSelected: {
    backgroundColor: theme.colors.verdeBase
  },
  modalButtons: {
    flexDirection: "row",
    gap: 28,
    alignSelf: "flex-end"
  },
  modalButton: {
    fontSize: theme.fontSizes.F18,
    color: theme.colors.negro
  },
  modalButtonDisabled: {
    opacity: 0.4
  },
})
