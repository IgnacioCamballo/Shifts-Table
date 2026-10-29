import React, { useRef, useState } from 'react'
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native'

import theme from '@/theme/theme'

type CodeInputProps = {
  value: string,
  onChange: (value: string) => void,
  length?: number,
  error?: boolean
}

export default function CodeInput({ value, onChange, length = 6, error = false }: CodeInputProps) {
  const inputRef = useRef<TextInput>(null)
  const [focused, setFocused] = useState(false)

  function handleChange(text: string) {
    onChange(text.replace(/\D/g, "").slice(0, length))
  }

  return (
    <Pressable onPress={() => inputRef.current?.focus()} style={styles.container}>
      {Array.from({ length }, (_, i) => {
        const isActive = focused && i === Math.min(value.length, length - 1)

        return (
          <View
            key={i}
            style={[
              styles.box,
              isActive && styles.boxActive,
              error && styles.boxError
            ]}
          >
            <Text style={styles.digit}>{value[i] ?? ""}</Text>
          </View>
        )
      })}

      {/* hidden input that receives the keyboard, paste and sms autofill */}
      <TextInput
        ref={inputRef}
        style={styles.hiddenInput}
        value={value}
        onChangeText={handleChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        keyboardType='number-pad'
        textContentType='oneTimeCode'
        autoComplete='sms-otp'
        maxLength={length}
        caretHidden
      />
    </Pressable>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8
  },
  box: {
    width: 44,
    height: 52,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: theme.colors.gris,
    backgroundColor: theme.colors.blanco,
    alignItems: "center",
    justifyContent: "center"
  },
  boxActive: {
    borderColor: theme.colors.verdeBase,
    borderWidth: 2
  },
  boxError: {
    borderColor: theme.colors.rojo
  },
  digit: {
    fontSize: theme.fontSizes.F24,
    fontWeight: "600",
    color: theme.colors.negro
  },
  hiddenInput: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    opacity: 0
  }
})
