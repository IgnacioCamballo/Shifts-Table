import React from 'react'
import { Platform, StyleSheet, View } from 'react-native'
import { Picker } from '@react-native-picker/picker'
import Icon from 'react-native-vector-icons/AntDesign'

import useCalendar from '@/hooks/useCalendar'
import { OvertimeRateType } from '@/types'
import theme from '@/theme/theme'
import { translate } from '@/utils'

import IosPickerModal from '@/components/Molecules/IosPickerModal'

type OvertimeRateTypePickerProps = {
  value: OvertimeRateType,
  onChange: (value: OvertimeRateType) => void
}

//background of the selector on both platforms
const SELECTOR_BACKGROUND = "white"
const ARROW_COLOR = theme.colors.gris
const ARROW_SIZE = 16

//Android: width of the visible selector (symbol + arrow). Make it smaller to bring the arrow closer to the symbol
const ANDROID_SELECTOR_WIDTH = 46
//Android: the native dropdown is drawn wider than the selector and the extra part is cut off, so its own arrow is hidden
const ANDROID_PICKER_WIDTH = 100
//Android: moves the native text to the left (negative) or to the right (positive) inside the selector
const ANDROID_TEXT_SHIFT = -4
//Android: negative value pulls the number input closer to the selector (the space between them is set by the parent)
const ANDROID_PULL_INPUT_CLOSER = -6

/**
 * Selector to choose how an overtime hour is paid: "$" (fixed amount per hour) or "%" (percentage of the wage).
 * Same look on both platforms: white background, the symbol and a small arrow right next to it. It is only as wide as
 * the symbol and the arrow. A modal wheel on iOS and the native dropdown on Android.
 */
export default function OvertimeRateTypePicker({ value, onChange }: OvertimeRateTypePickerProps) {
  const { lenguage } = useCalendar()
  const title = translate({ text: "overtimeWage", lenguage }) || ""

  if (Platform.OS === 'ios') {
    return (
      <View style={styles.pickerContainerIos}>
        <IosPickerModal
          value={value}
          onValueChange={newValue => onChange(newValue as OvertimeRateType)}
          items={[
            { label: "$", value: "amount" },
            { label: "%", value: "percent" }
          ]}
          inputStyle={styles.pickerInput}
          modalTitle={title}
          arrowColor={ARROW_COLOR}
        />
      </View>
    )
  }

  return (
    <View style={styles.pickerContainer}>
      <Picker
        selectedValue={value}
        onValueChange={newValue => onChange(newValue)}
        style={styles.picker}
        itemStyle={styles.pickerItem}
        dropdownIconColor="transparent"
        accessibilityLabel={title}
        mode='dropdown'
      >
        <Picker.Item style={styles.pickerItem} label="$" value="amount" />
        <Picker.Item style={styles.pickerItem} label="%" value="percent" />
      </Picker>

      {/* own arrow, the native one is hidden so it can sit next to the symbol; it lets the touches through to the picker */}
      <View style={styles.arrowContainer} pointerEvents="none">
        <Icon name="caret-down" size={ARROW_SIZE} color={ARROW_COLOR} />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  pickerContainer: {
    width: ANDROID_SELECTOR_WIDTH,
    height: 30,
    justifyContent: "center",
    overflow: "hidden",
    backgroundColor: SELECTOR_BACKGROUND,
    marginRight: ANDROID_PULL_INPUT_CLOSER
  },
  pickerContainerIos: {
    height: 20,
    justifyContent: "center",
    shadowOffset: { width: 2, height: 2 },
    shadowColor: theme.colors.negro,
    shadowOpacity: 0.6,
    shadowRadius: 2,
    elevation: 4,
    borderColor: theme.colors.grisClaro,
    borderWidth: Platform.OS === "android" ? 1 : 0
  },
  picker: {
    width: ANDROID_PICKER_WIDTH,
    marginLeft: ANDROID_TEXT_SHIFT,
    backgroundColor: SELECTOR_BACKGROUND
  },
  pickerItem: {
    fontSize: 18,
    color: "black",
    textAlign: 'center',
    backgroundColor: SELECTOR_BACKGROUND
  },
  arrowContainer: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: "center",
    alignItems: "flex-end",
    paddingRight: 6
  },
  //iOS: same look as the employer selector but white, without its minimum width, with room on the right for the arrow
  pickerInput: {
    fontSize: theme.fontSizes.F20,
    backgroundColor: SELECTOR_BACKGROUND,
    height: 28,
    minWidth: 10,
    paddingLeft: 12,
    paddingRight: 26,
    color: 'black',
    textAlign: 'center',
    textDecorationColor: "black",
    borderRadius: 12
  }
})
