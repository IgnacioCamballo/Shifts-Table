import React from 'react'
import { StyleSheet, View, Text, StyleProp, ViewStyle } from 'react-native'
import { Link } from 'react-router-native'
import theme from '../theme/theme'
import Icon from 'react-native-vector-icons/AntDesign'

type TransparentButtonProps = {
  nameIconLeft?: string,
  text?: string,
  nameIconRigth?: string,
  link: string,
  style?: StyleProp<ViewStyle>
}

export default function TransparentButton({nameIconLeft, text, nameIconRigth, link, style}: TransparentButtonProps) {
  return (
    <Link style={style} to={link} underlayColor="none">
      <View style={styles.flexRow}>
        <Icon 
          name={nameIconLeft || ""} 
          color={theme.colors.negro} 
          size={18}
        />

        <Text style={styles.textLine}>{text || ""}</Text>

        <Icon 
          name={nameIconRigth || ""} 
          color={theme.colors.negro} 
          size={18}
        />
      </View>
    </Link>
  )
}

const styles = StyleSheet.create({
  textLine: {
    fontSize: theme.fontSizes.F18,
    fontWeight: '500'
  },
  flexRow: {
    flexDirection: "row",
    gap: 4,
    alignItems: "center"  
  }
})
