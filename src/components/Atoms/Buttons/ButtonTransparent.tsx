import React from 'react'
import { StyleSheet, View, StyleProp, ViewStyle, TouchableOpacity } from 'react-native'

import { RootStackParamList } from '@/types'

type TransparentButtonProps = {
  children: React.ReactNode
  onPress: () => void,
  style?: StyleProp<ViewStyle>
}

export default function TransparentButton({children, onPress, style}: TransparentButtonProps) {
  
  return (
    <TouchableOpacity style={style} onPress ={onPress}>
      <View style={styles.flexRow}>
        {children}
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  flexRow: {
    flexDirection: "row",
    gap: 4,
    alignItems: "center"  
  }
})
