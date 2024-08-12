import React from 'react'
import { StyleSheet, View, Text, StyleProp, ViewStyle } from 'react-native'
import { Link } from 'react-router-native'

type TransparentButtonProps = {
  children: React.ReactNode
  link: string,
  style?: StyleProp<ViewStyle>
}

export default function TransparentButton({children, link, style}: TransparentButtonProps) {
  return (
    <Link style={style} to={link} underlayColor="none">
      <View style={styles.flexRow}>
        {children}
      </View>
    </Link>
  )
}

const styles = StyleSheet.create({
  flexRow: {
    flexDirection: "row",
    gap: 4,
    alignItems: "center"  
  }
})
