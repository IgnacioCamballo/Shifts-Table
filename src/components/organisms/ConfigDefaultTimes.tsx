import React, { useState } from 'react'
import { Alert, View, Text, TouchableOpacity, StyleSheet, Modal, Platform } from 'react-native'
import Constants from "expo-constants"
import DatePicker from 'react-native-date-picker'
import Icon from 'react-native-vector-icons/AntDesign'

import useCalendar from '@/hooks/useCalendar'
import theme from '@/theme/theme'
import { formattedMinutes, translate } from '@/utils'
import { MAX_DEFAULT_TIMES, sortedUniqueTimes } from '@/utils/datesCompare'

import DropDownAutoHeight from '@/components/Molecules/DropDownAutoHeight'

type TimeKey = "entry" | "exit" | "configBreakEntry" | "configBreakExit"

const TIME_FIELDS: { key: TimeKey, title: string }[] = [
  { key: "entry", title: "entryHour" },
  { key: "exit", title: "exitHour" },
  { key: "configBreakEntry", title: "breakStart" },
  { key: "configBreakExit", title: "breakEnd" },
]

//the dropdowns animate up to a max height, so it is calculated from the rows each one can show
const ROW_HEIGHT = 44
const TITLE_HEIGHT = 48

export default function ConfigDefaultTimes() {
  const { lenguage, configInfo, setConfigInfo } = useCalendar()

  const [hoursOpen, setHoursOpen] = useState(false)
  const [openFields, setOpenFields] = useState<Record<TimeKey, boolean>>({
    entry: false,
    exit: false,
    configBreakEntry: false,
    configBreakExit: false
  })
  const [timeType, setTimeType] = useState<TimeKey | null>(null)
  //position of the time being edited, null when a new time is being added
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [date, setDate] = useState(new Date())
  const [modalOpen, setModalOpen] = useState(false)

  //this way avoid of calling useCalendar in utils and translate can be used inside if functions
  function translateFn(text: string) {
    return translate({ text, lenguage })
  }

  //builds the setter a dropdown needs for the open state of one field
  const setFieldOpen = (key: TimeKey): React.Dispatch<React.SetStateAction<boolean>> => (value) => {
    setOpenFields(previous => ({ ...previous, [key]: typeof value === "function" ? value(previous[key]) : value }))
  }

  const formattedTime = (time: Date) => `${time.getHours()}:${formattedMinutes(time)}`

  //max height of the main dropdown: every field title plus the rows of the fields that are open
  const hoursMaxHeight = TIME_FIELDS.reduce((total, field) => (
    total + TITLE_HEIGHT + (openFields[field.key] ? ((configInfo[field.key]?.length ?? 0) + 1) * ROW_HEIGHT : 0)
  ), 0)

  //opens the modal to add a new time (index null) or to edit the one in that position
  const openModal = (key: TimeKey, index: number | null) => {
    setTimeType(key)
    setEditingIndex(index)
    setDate(index !== null && configInfo[key] ? configInfo[key][index] : new Date())
    setModalOpen(true)
  }

  //saves the list of one field, it is stored as null when it has no times left
  const saveTimes = (key: TimeKey, times: Date[]) => {
    setConfigInfo({ ...configInfo, [key]: times.length > 0 ? sortedUniqueTimes(times) : null })
  }

  //adds the new time or replaces the edited one, the list is always kept sorted
  const saveModalTime = () => {
    if (timeType) {
      const current = configInfo[timeType] ?? []
      saveTimes(timeType, editingIndex === null ? [...current, date] : current.map((time, index) => index === editingIndex ? date : time))
    }
    setModalOpen(false)
    setTimeType(null)
  }

  //alert called when deleting a default time
  const showAlert = (key: TimeKey, index: number) => {
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
          onPress: () => saveTimes(key, (configInfo[key] ?? []).filter((_, position) => position !== index)),
          style: 'cancel'
        },
      ],
      {
        cancelable: true
      }
    )
  }

  const modalTitle = () => translateFn(TIME_FIELDS.find(field => field.key === timeType)?.title ?? "entryHour")

  return (
    <View style={styles.configGeneral}>
      <DropDownAutoHeight
        duration={300}
        isOpen={hoursOpen}
        setIsOpen={setHoursOpen}
        maxHeight={hoursMaxHeight}
        title={translateFn("defaultHours")!}
        titleStyle={styles.textoConf}
        titleContainerStyle={styles.tituloConf}
        arrowColor={configInfo.baseColor}
      >
        <View>
          {TIME_FIELDS.map(field => {
            const times = configInfo[field.key] ?? []
            const isFull = times.length >= MAX_DEFAULT_TIMES

            return (
              <DropDownAutoHeight
                key={field.key}
                duration={250}
                isOpen={openFields[field.key]}
                setIsOpen={setFieldOpen(field.key)}
                maxHeight={(times.length + 1) * ROW_HEIGHT}
                title={translateFn(field.title)!}
                textRight={`${times.length}`}
                textRightStyle={styles.countPill}
                titleContainerStyle={styles.fieldTitle}
                arrowColor={configInfo.baseColor}
              >
                <View>
                  {times.map((time, index) => (
                    <View key={`${time.getHours()}:${time.getMinutes()}`} style={styles.timeRow}>
                      <TouchableOpacity
                        activeOpacity={0.8}
                        style={styles.timeButton}
                        accessibilityRole="button"
                        onPress={() => openModal(field.key, index)}
                      >
                        <Text style={styles.textLine}>{formattedTime(time)}</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        activeOpacity={0.7}
                        style={styles.deleteButton}
                        accessibilityRole="button"
                        accessibilityLabel={`${translateFn("deleteTime")} ${formattedTime(time)}`}
                        onPress={() => showAlert(field.key, index)}
                      >
                        <Icon name='delete' color={theme.colors.rojoBin} size={20} />
                      </TouchableOpacity>
                    </View>
                  ))}

                  <TouchableOpacity
                    activeOpacity={0.8}
                    disabled={isFull}
                    style={[styles.timeRow, styles.addRow, isFull && styles.addRowDisabled]}
                    accessibilityRole="button"
                    accessibilityState={{ disabled: isFull }}
                    onPress={() => openModal(field.key, null)}
                  >
                    <Text style={[styles.textLine, styles.addText]}>+ {translateFn("addTime")}</Text>
                  </TouchableOpacity>
                </View>
              </DropDownAutoHeight>
            )
          })}
        </View>
      </DropDownAutoHeight>

      <Modal
        visible={modalOpen}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modal}>
            <View style={styles.modalTitleContainer}>
              <Text style={styles.modalTitle}>{modalTitle()}</Text>
            </View>

            <DatePicker
              theme='light'
              mode='time'
              locale='es'
              date={date}
              onDateChange={setDate}
              dividerColor={theme.colors.verdeBase}
              is24hourSource="device"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity activeOpacity={0.7} onPress={() => { setModalOpen(false), setTimeType(null) }}>
                <Text style={styles.modalButton}>{translateFn("cancel")}</Text>
              </TouchableOpacity>
              <TouchableOpacity activeOpacity={0.7} onPress={saveModalTime}>
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
    borderColor: theme.colors.negro,
    width: "100%",
    gap: 12,
    paddingVertical: 4,
    marginTop: 20
  },
  textoConf: {
    alignSelf: "center",
    color: theme.colors.grisOscuro,
    fontWeight: '800',
    fontSize: theme.fontSizes.F20,
    marginBottom: 3
  },
  fieldTitle: {
    justifyContent: "flex-start",
    height: TITLE_HEIGHT,
    paddingVertical: 8
  },
  //light blue pill with the number of saved times, as in the approved design
  countPill: {
    minWidth: 24,
    paddingHorizontal: 8,
    paddingVertical: 1,
    overflow: "hidden",
    borderRadius: 12,
    backgroundColor: theme.colors.azulClaro,
    fontSize: theme.fontSizes.F14,
    fontWeight: "700",
    textAlign: "center",
    color: theme.colors.negro
  },
  timeRow: {
    height: ROW_HEIGHT,
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 44,
    paddingRight: 8,
    borderBottomWidth: 1,
    borderColor: theme.colors.grisClaro
  },
  timeButton: {
    flex: 1,
    height: "100%",
    justifyContent: "center"
  },
  deleteButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center"
  },
  addRow: {
    paddingRight: 15
  },
  addRowDisabled: {
    opacity: 0.4
  },
  addText: {
    color: theme.colors.verdeBase,
    fontWeight: '600'
  },
  textLine: {
    fontSize: theme.fontSizes.F20,
    fontWeight: '400',
    color: theme.colors.negro
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
    fontSize: 24,
    color: theme.colors.negro
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
})
