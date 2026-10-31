import React from 'react'
import { Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native'
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
              setLenguage(lenguage as "es" | "en" | "pt")
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
      contentContainerStyle={styles.contentContainer}
      style={styles.container}
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
  container: {
    flex: 1,
    //footer is absolute, so the margin makes the screen end where the footer starts
    marginBottom: theme.heigth.footer
  },
  contentContainer: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    backgroundColor: theme.colors.blanco
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