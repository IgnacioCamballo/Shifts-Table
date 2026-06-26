import React from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import Icon from 'react-native-vector-icons/AntDesign'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'

import useCalendar from '@/hooks/useCalendar'
import { translate } from '@/utils'
import theme from '@/theme/theme'
import { RootStackParamList } from '@/types'

import TransparentButton from '@/components/Atoms/Buttons/ButtonTransparent'

export default function PrePurchaseLogin() {
  const { lenguage } = useCalendar()

  //gets variable heigth for the screen without statusbar
  const insets = useSafeAreaInsets()
  const noFooterNoHeaderHeight = theme.heigth.screenHeight - insets.top - Math.max(insets.bottom, theme.heigth.bottomSystemBar) - theme.heigth.noFooterNoHeader

  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>()

  //this way avoid of calling useCalendar in utils and translate can be used inside if functions
  function translateFn(text: string) {
    return translate({ text, lenguage })
  }

  return (
    <View style={[styles.container, {height: noFooterNoHeaderHeight}]}>
      <TransparentButton onPress={() => navigation.reset({index: 0, routes: [{ name: "Calendar" }]})} style={styles.link}>
        <Icon 
          name="doubleleft" 
          color={theme.colors.negro} 
          size={17}
        />
        <Text style={styles.textLine}>{translateFn("back")}</Text>
      </TransparentButton>
      
      <Text style={styles.firstTitle}>{translateFn("titleAccountPrePurchase")}</Text>

      <TouchableOpacity activeOpacity={0.9} style={[styles.button]} onPress={() => navigation.navigate("Login", { lg:lenguage, type: "2" })}>
        <Text style={styles.buttonText}>{translateFn("login")}</Text>
      </TouchableOpacity>

      <TouchableOpacity activeOpacity={0.9} style={[styles.button]} onPress={() => navigation.navigate("CreateAccount", { lg:lenguage, type: "2" })}>
        <Text style={styles.buttonText}>{translateFn("createAccount")}</Text>
      </TouchableOpacity>

    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: -60,
    gap: 12
  },
  button: {
    minWidth: "60%",
    alignItems: "center",
    borderColor: theme.colors.grisClaro,
    borderWidth: 2,
    padding: 8
  },
  buttonText: {
    fontSize: theme.fontSizes.F18,
    fontWeight: "500"
  },
  firstTitle: {
    width: "60%",
    marginBottom: 20,
    fontSize: 18
  },
  link: {
    position: "absolute",
    top: 80,
    left: 20
  },
  textLine: {
    fontSize: theme.fontSizes.F18,
    fontWeight: '500'
  },
})
