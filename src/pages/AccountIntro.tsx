import React from 'react'
import { Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Platform } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'

import useCalendar from '@/hooks/useCalendar'
import theme from '@/theme/theme'
import { translate } from '@/utils'
import { RootStackParamList } from '@/types'

export default function AccountIntro() {
  const {setCompanysInfo, setLenguage, setConfigInfo, setShifts, setUserInfo} = useCalendar()
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>()
  const params = navigation.getState().routes[navigation.getState().index].params as {lg: string}
  const lenguage = params.lg
  
  //gets variable heigth for the screen without statusbar
  const insets = useSafeAreaInsets()
  const noFooterNoHeaderHeight = theme.heigth.screenHeight - insets.top - Math.max(insets.bottom, theme.heigth.bottomSystemBar) - theme.heigth.noFooterNoHeader
  

  //this way avoid of calling useCalendar in utils and translate can be used inside if functions
  function translateFn(text: string) {
    return translate({ text, lenguage })
  }

  const showAlert = () => {
      Alert.alert(
        '',
        `${translateFn("continueAlert")}`,
        [
          {
            text: translateFn("cancel"),
            style: 'cancel'
          },
          {
            text: translateFn("continue"),
            onPress: () => {  
              setLenguage(lenguage)
              setShifts([])
              setUserInfo({
                userName: "",
                mail: "",
                lastBackUp: null,
                premium: false
              })
              setConfigInfo({
                baseColor: theme.colors.verdeBase, 
                buttonsColor: theme.colors.verdeBoton, 
                configBreakEntry: null, 
                configBreakExit: null, 
                entry: null, 
                exit: null
              })
              setCompanysInfo([])
              navigation.replace("Calendar")
            },
            style: 'cancel'
          },
        ],
        {
          cancelable: true
        }
      )
    }

  return (
    <ScrollView 
      showsVerticalScrollIndicator={false} 
      contentContainerStyle={[styles.contentContainer, {height: noFooterNoHeaderHeight}]} 
    >
      <Text style={styles.firstTitle}>{translateFn("titleAccountIntro")}</Text>

      <TouchableOpacity activeOpacity={0.9} style={[styles.button]} onPress={() => navigation.navigate("Login", { lg: lenguage, type: "1" })}>
        <Text style={styles.buttonText}>{translateFn("login")}</Text>
      </TouchableOpacity>

      <TouchableOpacity activeOpacity={0.9} style={[styles.button]} onPress={() => navigation.navigate("CreateAccount", { lg: lenguage, type: "1" })}>
        <Text style={styles.buttonText}>{translateFn("createAccount")}</Text>
      </TouchableOpacity>

      <Text style={styles.o}>{translateFn("o")}</Text>
      
      <Text style={{width: "60%", textAlign: "center"}}>{translateFn("continueWithoutAccountTitle")}</Text>

      <TouchableOpacity activeOpacity={0.9} style={[styles.button]} onPress={() => showAlert()}>
        <Text style={styles.buttonText}>{translateFn("continueWithoutAccount")}</Text>
      </TouchableOpacity>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  contentContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: Platform.OS === 'ios' ? -40 : -120,
    gap: 12,
    backgroundColor: theme.colors.blanco,
    flex: 1
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
    fontWeight: "500",
    color: theme.colors.negro
  },
  firstTitle: {
    width: "60%", 
    marginBottom: 20, 
    fontSize: 18,
    color: theme.colors.negro
  },
  o: {
    width: "60%", 
    marginVertical: -8, 
    textAlign: "center", 
    textDecorationLine: 'underline',
    color: theme.colors.negro
  }
})