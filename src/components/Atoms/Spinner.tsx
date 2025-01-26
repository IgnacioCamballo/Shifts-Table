import theme from '@/theme/theme'
import React, { useRef } from 'react'
import { View, Animated, StyleSheet, Easing, StyleProp, TextStyle } from 'react-native'

type SpinnerProps = {
  size: number,
  borderWidth: number,
  style?: StyleProp<TextStyle>
}

export default function Spinner({size, borderWidth, style}: SpinnerProps) {
const refValue = useRef(new Animated.Value(0)).current

  Animated.loop(Animated.timing(refValue,
    {
      toValue: 1,
      duration: 800,
      easing: Easing.linear,
      useNativeDriver: true
    }
)).start()

const rotate = {
  transform: [
    {
      rotate: refValue.interpolate({
        inputRange: [0, 1],
        outputRange: ["-0deg", "360deg"]
      })
    }
  ]
}

  return (
    <View style={[styles.container, {height: size, width: size}, style]}>
      <View style={[styles.back, {height: size, width: size, borderRadius: size / 2, borderWidth: borderWidth}]}/>
      <Animated.View style={[styles.front, {height: size, width: size, borderRadius: size / 2, borderWidth: borderWidth}, rotate]}/>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
  },
  front: {
    position: "absolute",
    borderColor: "rgba(60, 129, 154, 0.05)",
    borderBlockStartColor: theme.colors.verdeBase,
  },
  back: {
    borderColor: theme.colors.verdeBase,
    opacity: 0.5,
  }
})