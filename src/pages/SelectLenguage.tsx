import React, { useState } from 'react'
import { Text, View, StyleSheet } from 'react-native'
import { TouchableOpacity } from 'react-native-gesture-handler'

import useCalendar from '@/hooks/useCalendar'
import theme from '@/theme/theme'
import { useNavigate } from 'react-router-native'

export default function SelectLenguage() {
  const {setLenguage} = useCalendar()
  const navigate = useNavigate()

  const [lenguageSelected, setLenguageSelected] = useState("")
  const [error, setError] = useState(false)

  const handleContinue = () => {
    if(lenguageSelected === "") {
      setError(true)
    } else {
      setLenguage(lenguageSelected)
      navigate("/account")
    }
  }
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select Lenguage</Text>

      <TouchableOpacity activeOpacity={0.9} style={[styles.button, lenguageSelected === "en" && styles.selected]} onPress={() => {setError(false), setLenguageSelected("en")}}>
        <Text style={styles.buttonText}>English</Text>
      </TouchableOpacity>

      <TouchableOpacity activeOpacity={0.9} style={[styles.button, lenguageSelected === "es" && styles.selected]} onPress={() => {setError(false), setLenguageSelected("es")}}>
        <Text style={styles.buttonText}>Español</Text>
      </TouchableOpacity>
      
      <TouchableOpacity activeOpacity={0.9} style={[styles.button, lenguageSelected === "pt" && styles.selected]} onPress={() => {setError(false), setLenguageSelected("pt")}}>
        <Text style={styles.buttonText}>Português</Text>
      </TouchableOpacity>
      
      {error &&
        <Text style={styles.textAlert}>Select lenguage</Text>
      }

      <View style={styles.contContinue}>
        <TouchableOpacity disabled={lenguageSelected === ""} activeOpacity={0.9} style={[styles.continue, lenguageSelected === "" && {borderColor: theme.colors.grisMasClaro}]} onPress={() => handleContinue()}>
          <Text style={[styles.continueText, lenguageSelected === "" && {color: theme.colors.grisMasClaro}]}>Continue</Text>
        </TouchableOpacity>
      </View>
    
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    height: theme.heigth.noFooterNoHeader, 
    alignItems: "center",
    justifyContent: "center",
    gap: 12
  },
  title: {
    fontSize: theme.fontSizes.F20,
    fontWeight: "700",
    marginBottom: 20,
    color: theme.colors.verdeBase
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
  },
  selected: {
    backgroundColor: theme.colors.azulClaro
  },
  contContinue: {
    minWidth: "60%",
    alignItems: "flex-end",
    marginTop: 16
  },
  continue: {
    borderWidth: 1,
    borderColor: theme.colors.grisClaro,
    paddingHorizontal: 8,
    paddingVertical: 2
  },
  continueText: {
    fontSize: theme.fontSizes.F18
  },
  textAlert: {
    fontSize: theme.fontSizes.F18,
    fontWeight: "500",
    textTransform: "uppercase",
    color: theme.colors.rojoBin,
    backgroundColor: theme.colors.rojoClaro,
    paddingVertical: 10,
    marginHorizontal: 20,
    marginTop: -10,
    marginBottom: 10,
    height: "auto",
    textAlign: "center",
    textAlignVertical: "center"
  },
})
