import React from 'react'
import { Text, StyleSheet, ImageBackground } from 'react-native'

import useCalendar from '@/hooks/useCalendar'
import { translate } from '@/utils'
import theme from '@/theme/theme'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

export default function PremiumPurchaseSuccess() {
  const { lenguage } = useCalendar()

  //gets variable heigth for the screen without statusbar
  const insets = useSafeAreaInsets()
  const noFooterNoHeaderHeight = theme.heigth.screenHeight - insets.top - Math.max(insets.bottom, theme.heigth.bottomSystemBar) - theme.heigth.noFooterNoHeader
  
  //this way avoid of calling useCalendar in utils and translate can be used inside if functions
  function translateFn(text: string) {
    return translate({ text, lenguage })
  }
  
  return (
    <ImageBackground
      source={require("@/../assets/congratsBg.webp")}
      style={[styles.background, {height: noFooterNoHeaderHeight}]}
    >
      <Text style={styles.text1}>{translateFn("congrats")}</Text>
      <Text style={styles.text2}>{translateFn("purchaseSuccess")}</Text>
      <Text style={styles.text3}>{translateFn("successMessage")}</Text>
    </ImageBackground>
  )
}

const styles = StyleSheet.create({
  background: {
    padding: 52,
    justifyContent: "center",
    alignItems: "center"
  },
  text1: {
    fontSize: theme.fontSizes.F24, 
    fontWeight: "700",
    marginTop: -60,
    marginBottom: 20
  },
  text2: {
    fontSize: theme.fontSizes.F20, 
    fontWeight: "500",
    marginBottom: 20
  },
  text3: {
    fontSize: theme.fontSizes.F20, 
    textAlign: "center"
  }
})
