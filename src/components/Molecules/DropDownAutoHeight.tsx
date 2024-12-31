import React, { useRef, useState } from 'react'
import { Text, Animated, TouchableOpacity, StyleSheet, StyleProp, ViewStyle } from 'react-native';

import theme from '../../theme/theme';
import Icon from 'react-native-vector-icons/AntDesign';

type DropDownAutoHeightProps = {
  children: JSX.Element | JSX.Element[]
  title: string
  textRight?: string
  arrowColor?: string
  duration: number
  maxHeight: number
  titleContainerStyle?: StyleProp<ViewStyle>
  isOpen: boolean
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>
}

export default function DropDownAutoHeight({ isOpen, setIsOpen, children, textRight, title, arrowColor, duration, maxHeight, titleContainerStyle }: DropDownAutoHeightProps) {

  //manage the break animations
  const value = useRef(new Animated.Value(isOpen ? 1 : 0)).current
  const handlePress = () => {
    Animated.parallel([
      Animated.timing(value, {
        toValue: isOpen ? 0 : 1,
        duration: duration,
        useNativeDriver: false,
      })
    ]).start();
    setIsOpen(!isOpen);
  }
  const heightChange = {
    maxHeight: value.interpolate({
      inputRange: [0, 1],
      outputRange: [0, maxHeight]
    })
  }
  const rotateArrow = {
    transform: [
      {
        rotate: value.interpolate({
          inputRange: [0, 1],
          outputRange: ["-90deg", "0deg"]
        })
      }
    ]
  }
  return (
    <>
      <TouchableOpacity
        activeOpacity={0.8}
        style={[styles.lineCenter, titleContainerStyle]}
        onPress={() => handlePress()}
      >
        <Animated.View style={[rotateArrow]}>
          <Icon
            name="caretdown"
            color={arrowColor || theme.colors.verdeBase}
            size={20}
          />
        </Animated.View>
        <Text style={styles.textLine}>{title}</Text>
        <Text style={styles.textRight}>{textRight}</Text>
      </TouchableOpacity>
      <Animated.View style={[styles.heightAuto, heightChange]}>
        {children}
      </Animated.View>

    </>
  )
}

const styles = StyleSheet.create({
  lineCenter: {
    position: "relative",
    paddingHorizontal: 15,
    paddingVertical: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    borderBottomWidth: 1,
    borderColor: theme.colors.grisClaro,
    gap: 12
  },
  textLine: {
    fontSize: theme.fontSizes.F18,
    fontWeight: '400',
    textAlign: "right"
  },
  textRight: {
    position: "absolute",
    right: 14,
    fontSize: theme.fontSizes.F18,
    fontWeight: '400'
  },
  heightAuto: {
    height: "auto",
    overflow: "hidden"
  },
})