import React, { useMemo, useState } from 'react'
import {
  Modal,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle
} from 'react-native'
import { Picker } from '@react-native-picker/picker'
import Icon from 'react-native-vector-icons/AntDesign'

import theme from '@/theme/theme'

type PickerItem = {
  label: string
  value: string | number
  key?: string | number
}

type IosPickerModalProps = {
  value: string | number
  onValueChange: (value: string | number) => void
  items: PickerItem[]
  placeholderLabel?: string
  inputStyle?: StyleProp<TextStyle>
  modalTitle?: string
  closeOnValues?: (string | number)[] //values that close the modal as soon as they are selected
  arrowColor?: string //when given, a small arrow is drawn on the right of the selector (leave room with paddingRight in inputStyle)
}

export default function IosPickerModal({
  value,
  onValueChange,
  items,
  placeholderLabel,
  inputStyle,
  modalTitle,
  closeOnValues,
  arrowColor
}: IosPickerModalProps) {
  const [open, setOpen] = useState(false)

  const handleValueChange = (newValue: string | number) => {
    if (closeOnValues?.includes(newValue)) {
      setOpen(false)
    }
    onValueChange(newValue)
  }

  const selectedLabel = useMemo(() => {
    const selected = items.find(item => item.value === value)
    return selected?.label || placeholderLabel || ''
  }, [items, placeholderLabel, value])

  return (
    <>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => setOpen(true)}
        style={styles.touchable}
      >
        <Text style={[styles.inputText, inputStyle]} numberOfLines={1}>
          {selectedLabel}
        </Text>
        {arrowColor &&
          <View style={styles.arrowContainer} pointerEvents="none">
            <Icon name="caret-down" size={16} color={arrowColor} />
          </View>
        }
      </TouchableOpacity>

      <Modal
        visible={open}
        transparent
        animationType='fade'
        onRequestClose={() => setOpen(false)}
      >
        <TouchableOpacity
          activeOpacity={1}
          style={styles.overlay}
          onPress={() => setOpen(false)}
        />

        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.title}>{modalTitle || ''}</Text>
            <TouchableOpacity activeOpacity={0.8} onPress={() => setOpen(false)}>
              <Text style={styles.done}>Done</Text>
            </TouchableOpacity>
          </View>

          <Picker
            selectedValue={value}
            onValueChange={handleValueChange}
            style={styles.picker}
          >
            {items.map(item => (
              <Picker.Item
                key={item.key?.toString() || `${item.label}-${item.value}`}
                label={item.label}
                value={item.value}
              />
            ))}
          </Picker>
        </View>
      </Modal>
    </>
  )
}

const styles = StyleSheet.create({
  touchable: {
    justifyContent: 'center'
  },
  //the arrow floats over the right end of the selector and lets the touches through
  arrowContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingRight: 6
  },
  inputText: {
    fontSize: theme.fontSizes.F20,
    backgroundColor: theme.colors.grisClaro,
    height: 28,
    minWidth: 116,
    color: theme.colors.negro,
    textAlign: 'center',
    borderRadius: 12,
    paddingHorizontal: 8,
    textAlignVertical: 'center'
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.35)'
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    paddingBottom: 20
  },
  header: {
    height: 48,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.grisClaro,
    paddingHorizontal: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  title: {
    fontSize: theme.fontSizes.F16,
    color: theme.colors.grisOscuro
  },
  done: {
    fontSize: theme.fontSizes.F18,
    color: theme.colors.verdeBase,
    fontWeight: '600'
  },
  picker: {
    height: 220
  }
})
