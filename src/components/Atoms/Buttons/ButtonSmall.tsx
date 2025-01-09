import React from 'react'
import { View, StyleSheet, ColorValue, StyleProp, ViewStyle } from 'react-native'
import { Platform } from 'react-native';
import theme from '@/theme/theme';

interface ButtonProps {
  children: React.ReactNode
  color: ColorValue
  buttonStyles?: StyleProp<ViewStyle>
}

export default function ButtonSmall({ children, color, buttonStyles }: ButtonProps) {
  let customeStyle = {
    boton: {
      ...styles.boton,
      backgroundColor: color,
    }
  }

  return (
    <View style={[customeStyle.boton, buttonStyles]}>
      {children}
    </View>
  )
}

const styles = StyleSheet.create({
  boton: {
    paddingVertical: 2,
    paddingHorizontal: 10,
    width: "auto",
    borderRadius: 15,
    shadowOffset: { width: 2, height: 2 },
    shadowColor: theme.colors.negro,
    shadowOpacity: 0.6,
    shadowRadius: 2,
    elevation: 5,
    borderColor: theme.colors.grisMedio,
    borderWidth: Platform.OS === "android" ? 1 : 0,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row"
  }
})