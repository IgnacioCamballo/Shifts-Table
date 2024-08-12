import React, { useRef } from 'react'
import { Animated, TouchableOpacity, StyleSheet } from 'react-native';
import theme from '../../theme/theme';

type ValueProps = {
  value: boolean,
  setValue: React.Dispatch<React.SetStateAction<boolean>> | ((value: boolean) => void)
}

export default function Slider({value, setValue}: ValueProps) {
  const bgColorStylesValue = useRef(new Animated.Value(value ? 1 : 0)).current
  const translateStylesValue = useRef(new Animated.Value(value ? 1 : 0)).current
  
  const handlePress = () => {
    Animated.parallel([
      Animated.timing(bgColorStylesValue, {
        toValue: value ? 0 : 1,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(translateStylesValue, {
        toValue: value ? 0 : 1,
        duration: 150,
        useNativeDriver: true,
      })
    ]).start();
    setValue(!value);
  }

  const BgColorStyles = {
    backgroundColor: bgColorStylesValue.interpolate({
      inputRange: [0, 1],
      outputRange: [theme.colors.grisClaro, theme.colors.slider]
    })
  }

  const translateStyles = {
    transform: [
      {
        translateX: translateStylesValue.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 14]
        })
      }
    ]
  }

  return (
    <TouchableOpacity
      activeOpacity={1} 
      onPress={() => handlePress()}
    >
      <Animated.View style={[styles.slide_exterior, BgColorStyles]}>
        <Animated.View style={[styles.slide_interior, translateStyles]}></Animated.View>
      </Animated.View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create ({ 
  slide_exterior: {
    flexDirection:"row",
    borderRadius: 15,
    width: 40,
    height: 26,
    alignItems: "center",
    position: "relative",
    top: 1,
  },
  slide_interior: {
    backgroundColor: "#fff",
    borderColor: theme.colors.grisMasClaro,
    borderWidth: 1,
    width: 22,
    height: 22,
    borderRadius: 12,
    margin: 2
  }
})
