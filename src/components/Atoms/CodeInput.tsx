import React, { useEffect, useRef, useState } from 'react'
import { Animated, Easing, Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import Svg, { Rect } from 'react-native-svg'

import theme from '@/theme/theme'

type CodeInputProps = {
  value: string,
  onChange: (value: string) => void,
  length?: number,
  error?: boolean,
  loading?: boolean,
  success?: boolean
}

const AnimatedRect = Animated.createAnimatedComponent(Rect)

const BOX_WIDTH = 44
const BOX_HEIGHT = 52
const BOX_RADIUS = 10
const LOADER_WIDTH = 1.5
const LOADER_COLOR = "#085f85"

// the stroke is centered, so the rect is inset by half of its width to stay inside the box
const RECT_WIDTH = BOX_WIDTH - LOADER_WIDTH
const RECT_HEIGHT = BOX_HEIGHT - LOADER_WIDTH
const RECT_RADIUS = BOX_RADIUS - LOADER_WIDTH / 2
const PERIMETER = 2 * (RECT_WIDTH + RECT_HEIGHT) - (8 - 2 * Math.PI) * RECT_RADIUS
const SEGMENT = PERIMETER * 0.3

export default function CodeInput({ value, onChange, length = 6, error = false, loading = false, success = false }: CodeInputProps) {
  const inputRef = useRef<TextInput>(null)
  const [focused, setFocused] = useState(false)
  const visibility = useRef(new Animated.Value(0)).current
  const progress = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.timing(visibility, {
      toValue: loading ? 1 : 0,
      duration: 150,
      useNativeDriver: false
    }).start()

    if (!loading) return

    progress.setValue(0)
    const loop = Animated.loop(
      Animated.timing(progress, {
        toValue: 1,
        duration: 1200,
        easing: Easing.linear,
        useNativeDriver: false
      })
    )
    loop.start()

    return () => loop.stop()
  }, [loading, visibility, progress])

  const dashOffset = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -PERIMETER]
  })

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
              error && styles.boxError,
              success && styles.boxSuccess
            ]}
          >
            <Text style={styles.digit}>{value[i] ?? ""}</Text>

            <Animated.View pointerEvents='none' style={[styles.loader, { opacity: visibility }]}>
              <Svg width={BOX_WIDTH} height={BOX_HEIGHT}>
                <AnimatedRect
                  x={LOADER_WIDTH / 2}
                  y={LOADER_WIDTH / 2}
                  width={RECT_WIDTH}
                  height={RECT_HEIGHT}
                  rx={RECT_RADIUS}
                  ry={RECT_RADIUS}
                  fill='none'
                  stroke={LOADER_COLOR}
                  strokeWidth={LOADER_WIDTH}
                  strokeLinecap='round'
                  strokeDasharray={[SEGMENT, PERIMETER - SEGMENT]}
                  strokeDashoffset={dashOffset}
                />
              </Svg>
            </Animated.View>
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
        editable={!loading && !success}
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
    width: BOX_WIDTH,
    height: BOX_HEIGHT,
    borderRadius: BOX_RADIUS,
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
  boxSuccess: {
    borderColor: theme.colors.verdeBoton,
    borderWidth: 1.5
  },
  boxError: {
    borderColor: theme.colors.rojo
  },
  loader: {
    position: "absolute",
    top: -1,
    left: -1
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
