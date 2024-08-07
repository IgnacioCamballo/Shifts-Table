import React, { useRef } from 'react'
import { Animated, TouchableOpacity, StyleSheet } from 'react-native';
import theme from '../theme';

type ValueProps = {
  value: boolean,
  setValue: React.Dispatch<React.SetStateAction<boolean>> | ((value: boolean) => void)
}

export default function Slider({value, setValue}: ValueProps) {
  const animatedValue = useRef(new Animated.Value(value ? 1 : 0)).current
  const animatedValue2 = useRef(new Animated.Value(value ? 1 : 0)).current
  
  const handlePress = () => {

    Animated.parallel([
      Animated.timing(animatedValue, {
        toValue: value ? 0 : 1,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(animatedValue2, {
        toValue: value ? 0 : 1,
        duration: 150,
        useNativeDriver: true,
      })
    ]).start();
    setValue(!value);
  }

  const animatedStyles = {
    backgroundColor: animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [theme.colors.grisClaro, theme.colors.slider]
    })
  }

  const animatedStyles2 = {
    transform: [
      {
        translateX: animatedValue2.interpolate({
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
      <Animated.View style={[styles.slide_exterior, animatedStyles]}>
        <Animated.View style={[styles.slide_interior, animatedStyles2]}></Animated.View>
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
