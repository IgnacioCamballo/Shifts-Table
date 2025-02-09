import React from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { useNavigate } from 'react-router-native'
import Icon from 'react-native-vector-icons/AntDesign'

import useCalendar from '@/hooks/useCalendar'
import { translate } from '@/utils'
import theme from '@/theme/theme'

import TransparentButton from '@/components/Atoms/Buttons/ButtonTransparent'

export default function PrePurchaseLogin() {
  const { lenguage } = useCalendar()

  const navigate = useNavigate()

  //this way avoid of calling useCalendar in utils and translate can be used inside if functions
  function translateFn(text: string) {
    return translate({ text, lenguage })
  }

  return (
    <View style={styles.container}>
      <TransparentButton link="/calendar" style={styles.link}>
        <Icon 
          name="doubleleft" 
          color={theme.colors.negro} 
          size={17}
        />
        <Text style={styles.textLine}>{translateFn("back")}</Text>
      </TransparentButton>
      
      <Text style={styles.firstTitle}>{translateFn("titleAccountPrePurchase")}</Text>

      <TouchableOpacity activeOpacity={0.9} style={[styles.button]} onPress={() => navigate(`/account/${lenguage}/login/2`)}>
        <Text style={styles.buttonText}>{translateFn("login")}</Text>
      </TouchableOpacity>

      <TouchableOpacity activeOpacity={0.9} style={[styles.button]} onPress={() => navigate(`/account/${lenguage}/createAccount/2`)}>
        <Text style={styles.buttonText}>{translateFn("createAccount")}</Text>
      </TouchableOpacity>

    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    height: theme.heigth.noFooterNoHeader,
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
