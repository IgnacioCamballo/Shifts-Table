import React, { useState } from 'react'
import { Modal, View, TouchableOpacity, Text, StyleSheet, Platform } from 'react-native'
import ColorPicker, { Preview, Panel1, HueSlider } from 'reanimated-color-picker'
import Constants from "expo-constants"

import useCalendar from '@/hooks/useCalendar'
import theme from '@/theme/theme'
import { translate } from '@/utils'

type ModalColorPickerProps = {
  isOpen: boolean,
  initialColor: string,
  onCancel: () => void,
  onConfirm: (col: string) => void,
  resetColorButtonTo?: string
}

export default function ModalColorPicker({ isOpen, initialColor, onCancel, onConfirm, resetColorButtonTo }: ModalColorPickerProps) {
  const { lenguage } = useCalendar()
  const [tempColor, setTempColor] = useState(initialColor)

  //this way avoid of calling useCalendar in utils and translate can be used inside if functions
  function translateFn(text: string) {
    return translate({ text, lenguage })
  }

  return (
    <Modal
      visible={isOpen}
      transparent={true}
      animationType='fade'
    >
      <View style={styles.modalContainer}>
        <View style={styles.modal}>
          <ColorPicker
            style={styles.colorPicker}
            value={initialColor}
            onComplete={color => setTempColor(color.hex)} 
          >
            <Preview hideText={true} hideInitialColor={false} />
            <Panel1 />
            <HueSlider />
          </ColorPicker>

          {resetColorButtonTo && <TouchableOpacity
            style={[styles.boton, styles.botonReset]}
            activeOpacity={0.7}
            onPress={() => onConfirm(resetColorButtonTo)}
          >
            <Text style={styles.botonText}>{translateFn("resetColor")}</Text>
          </TouchableOpacity>}

          <View style={styles.botones}>
            <TouchableOpacity
              style={styles.boton}
              activeOpacity={0.7}
              onPress={() => onCancel()}
            >
              <Text style={styles.botonText}>{translateFn("cancel")}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.boton}
              activeOpacity={0.7}
              onPress={() => onConfirm(tempColor)}
            >
              <Text style={styles.botonText}>{translateFn("save")}</Text>
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
    width: "80%",
    alignItems: "center",
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10
  },
  colorPicker: {
    width: '100%',
    gap: 20
  },
  botones: {
    width: "100%",
    marginTop: 20,
    flexDirection: "row",
    justifyContent: "space-around"
  },
  boton: {
    backgroundColor: theme.colors.grisClaro,
    alignItems: "center",
    width: 100,
    paddingVertical: 4,
    borderRadius: 8,
    shadowOffset: { width: 2, height: 2 },
    shadowColor: theme.colors.negro,
    shadowOpacity: 0.6,
    shadowRadius: 2,
    elevation: 10,
    borderColor: theme.colors.grisMedio,
    borderWidth: Platform.OS === "android" ? 1 : 0,
  },
  botonReset: {
    width: "auto",
    paddingHorizontal: 12,
    marginTop: 20
  },
  botonText: {
    fontSize: theme.fontSizes.F20
  }
})