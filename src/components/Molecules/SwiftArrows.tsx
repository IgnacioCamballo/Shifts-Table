import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import Icon from 'react-native-vector-icons/AntDesign';
import theme from '../../theme/theme'
import ButtonSmall from '../Atoms/Buttons/ButtonSmall';

type SwiftArrowsProps = {
  text: string,
  leftAction: () => void,
  rightAction: () => void
}

export default function SwiftArrows({text, leftAction, rightAction}: SwiftArrowsProps) {
  return (
    <View style={styles.arrows}>
        <TouchableOpacity activeOpacity={0.7} onPress={leftAction}>
          <ButtonSmall color={theme.colors.grisMedio}>
          <Icon 
            name="left" 
            color={theme.colors.negro} 
            size={18}
          />
          </ButtonSmall>
        </TouchableOpacity>

        <Text style={styles.monthText}>{text}</Text>
        
        <TouchableOpacity activeOpacity={0.7} onPress={rightAction}>
        <ButtonSmall color={theme.colors.grisMedio}>
          <Icon 
            name="right" 
            color={theme.colors.negro} 
            size={18}
          />
        </ButtonSmall>
        </TouchableOpacity>
      </View>
  )
}

const styles = StyleSheet.create({
  arrows: {
    height: 28,
    flexDirection: 'row',
    justifyContent: "space-between",
    paddingHorizontal: 68
  },
  monthText: {
    fontSize: theme.fontSizes.F20,
    fontWeight: 'bold'
  }
})
