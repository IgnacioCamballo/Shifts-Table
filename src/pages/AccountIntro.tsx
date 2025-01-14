import React from 'react'
import { Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native'

import theme from '@/theme/theme'
import { translate } from '@/utils'
import useCalendar from '@/hooks/useCalendar'
import { useNavigate } from 'react-router-native'

export default function AccountIntro() {
  const {lenguage, setNavig} = useCalendar()
  const navigate = useNavigate()

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
              //To avoid a loop and allow to start app without storaged data
              setNavig(false),
              navigate("/calendar")
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
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.contentContainer} style={styles.container}>
      <Text style={styles.firstTitle}>{translateFn("titleAccountIntro")}</Text>

      <TouchableOpacity activeOpacity={0.9} style={[styles.button]} onPress={() => navigate("/account/login")}>
        <Text style={styles.buttonText}>{translateFn("login")}</Text>
      </TouchableOpacity>

      <TouchableOpacity activeOpacity={0.9} style={[styles.button]} onPress={() => navigate("/account/createAccount")}>
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
    maxHeight: theme.heigth.noFooterNoHeader,
  },
  contentContainer: {
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
  o: {
    width: "60%", 
    marginVertical: -8, 
    textAlign: "center", 
    textDecorationLine: 'underline'
  }
})