import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import theme from '../theme'
import BotonChico from './BotonChico'

type SwiftArrowsProps = {
  text: string,
  leftAction: () => void,
  rightAction: () => void
}

export default function SwiftArrows({text, leftAction, rightAction}: SwiftArrowsProps) {
  return (
    <View style={styles.arrows}>
        <TouchableOpacity activeOpacity={0.7} onPress={leftAction}>
          <BotonChico color={theme.colors.grisMedio} text='' icon='left'/>
        </TouchableOpacity>

        <Text style={styles.monthText}>{text}</Text>
        
        <TouchableOpacity activeOpacity={0.7} onPress={rightAction}>
        <BotonChico color={theme.colors.grisMedio} text='' icon='right'/>
        </TouchableOpacity>
      </View>
  )
}

const styles = StyleSheet.create({
  arrows: {
    height: 28,
    flexDirection: 'row',
    justifyContent: "space-between",
    paddingHorizontal: 48
  },
  monthText: {
    fontSize: theme.fontSizes.F20,
    fontWeight: 'bold'
  }
})
