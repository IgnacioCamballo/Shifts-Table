import React, { useState } from 'react'
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { useNavigate } from 'react-router-native'
import { useMutation } from '@tanstack/react-query'
import { isEmail } from 'validator'
import IconArrow from 'react-native-vector-icons/AntDesign'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import AsyncStorage from '@react-native-async-storage/async-storage'

import useCalendar from '@/hooks/useCalendar'
import theme from '@/theme/theme'
import { translate } from '@/utils'
import { createDeleteToken, deletePassword } from '@/api/UserAPI'

import TransparentButton from '@/components/Atoms/Buttons/ButtonTransparent'
import Spinner from '@/components/Atoms/Spinner'
import ButtonSmall from '@/components/Atoms/Buttons/ButtonSmall'

export default function DeleteAccount() {
  const navigate = useNavigate()
  const { lenguage } = useCalendar()

  //gets variable heigth for the screen without statusbar
  const insets = useSafeAreaInsets()
  const noFooterNoHeaderHeight = theme.heigth.screenHeight - insets.top - insets.bottom - theme.heigth.noFooterNoHeader  

  //this way avoid of calling useCalendar in utils and translate can be used inside if functions
  function translateFn(text: string) {
    return translate({ text, lenguage })
  }

  const [mail, setMail] = useState("")
  const [code, setCode] = useState("")
  const [tokenId, setTokenId] = useState("")
  const [loader, setLoader] = useState(false)
  const [error, setError] = useState(false)
  const [invalidUser, setInvalidUser] = useState(false)
  const [diferentUser, setDiferentUser] = useState(false)
  const [invalidCode, setInvalidCode] = useState(false)

  const { mutate } = useMutation({
    mutationFn: createDeleteToken,
    retry: 0,
    onError: (error) => {
      console.log(error.message)
      setLoader(false)
      if (error.message.toString() === "404") {
        setInvalidUser(true)
      }
      if (error.message.toString() === "403") {
        setDiferentUser(true)
      }
    },
    onSuccess: (data) => {
      setInvalidUser(false)
      setDiferentUser(false)
      setLoader(false)
      setTokenId(data.tokenid)
    }
  })

  //query to change password
    const deleteAccountQuery = useMutation({
      mutationFn: deletePassword,
      retry: 0,
      onError: (error) => {
        if (error.message.toString() === "401") {
          setInvalidCode(true)
        }
        setLoader(false)
        setError(true)
      },
      onSuccess: () => {
        Alert.alert(
          '',
          `${translateFn("deleteSuccess")}`,
          [
            {
              text: 'OK',
              onPress: async () => {             
                await AsyncStorage.multiRemove(["userData", "userToken"])
                navigate("/")
              },
              style: 'cancel'
            },
          ]
        )
        
      }
    })

  const handleSendDeleteCode = () => {
    if (!mail || !isEmail(mail)) {
      setError(true)
    } else {
      setError(false)
      setInvalidUser(false)
      setDiferentUser(false)
      setLoader(true)
      const formData = { mail, lenguage }
      mutate(formData)
    }
  }

  const handleDeleteAccount = () => {
    if (!code || code.length !== 6) {
      setError(true)
    } else {
      setError(false)
      setInvalidCode(false)
      const {mutate} = deleteAccountQuery
      const formData = { mail, code, tokenId }
      mutate(formData)
      setLoader(true)
    }
  }

  return (
    <ScrollView 
      showsVerticalScrollIndicator={false} 
      contentContainerStyle={[styles.contentContainer, {height: noFooterNoHeaderHeight}]} 
      style={[styles.container, {maxHeight: noFooterNoHeaderHeight}]}
    >

      {loader ?
        <>
          <Spinner size={50} borderWidth={10} style={{ marginTop: 60 }} />
          <Text>{tokenId ? translateFn("deletingAccount") : translateFn("sendingCode")}</Text>
        </>
        :
        <>
          <TransparentButton link={`/config`} style={styles.arrow}>
            <IconArrow
              name="doubleleft"
              color={theme.colors.negro}
              size={20}
            />
          </TransparentButton>


          {!tokenId ?
            <>
              <Text style={styles.title}>{translateFn("deleteAccount")}</Text>
              
              <View style={styles.inputContainer}>
                <Text style={styles.text}>{translateFn("confirmMail")}</Text>
                <TextInput
                  textContentType='emailAddress'
                  style={styles.input}
                  onChangeText={setMail}
                  value={mail}
                  maxLength={25}
                  placeholder={translateFn("placeholderMail")}
                  placeholderTextColor={theme.colors.grisMedio}
                />
                {error && mail === "" && <Text style={styles.error}>{translateFn("errorMail")}</Text>}
                {error && mail && !isEmail(mail) && <Text style={styles.error}>{translateFn("invalidMail")}</Text>}
                {invalidUser && <Text style={styles.error}>{translateFn("userNotExist")}</Text>}
                {diferentUser && <Text style={styles.error}>{translateFn("diferentUser")}</Text>}
              </View>

              <Text style={styles.text2} onPress={() => handleSendDeleteCode()}>{translateFn("sendConfirmCode")}</Text>
            </>
            :
            <>
              <Text style={styles.title}>{translateFn("deleteAccount")}</Text>

              <Text style={styles.text}>{mail}</Text>

              <Text style={styles.textValidation}>{translateFn("validationText")}</Text>
              <View style={{minWidth: 180, gap: 4}}>
                <TextInput
                  style={[styles.input, styles.vfyCode]}
                  keyboardType='numeric'
                  onChangeText={setCode}
                  value={code}
                  />
                {error && (code === "" || code.length !== 6 || invalidCode) && <Text style={styles.error}>{translateFn("invalidCode")}</Text>}
              </View>

              <TouchableOpacity activeOpacity={0.9} onPress={() => handleDeleteAccount()}>
              <ButtonSmall color={theme.colors.grisMasClaro} buttonStyles={styles.button}>
                <Text style={styles.textButton}>{translateFn("deleteAccount")}</Text>
              </ButtonSmall>
            </TouchableOpacity>
            </>
          }
        </>

      }
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
  },
  contentContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: -60,
    gap: 12
  },
  arrow: {
    position: "absolute",
    top: 80,
    left: 20
  },
  title: {
    fontSize: theme.fontSizes.F24,
    fontWeight: "500",
    color: theme.colors.verdeBase
  },
  inputContainer: {
    position: "relative",
    gap: 4
  },
  text: {
    fontSize: theme.fontSizes.F18,
    marginLeft: 4
  },
  text2: {
    fontSize: theme.fontSizes.F18,
    marginTop: 16,
    color: theme.colors.grisOscuro,
    textDecorationLine: "underline"
  },
  textValidation: {
    fontSize: theme.fontSizes.F16,
    marginHorizontal: 16
  },
  textButton: {
    fontSize: theme.fontSizes.F20,
  },
  input: {
    minWidth: "70%",
    borderColor: theme.colors.negro,
    borderWidth: 1,
    fontSize: theme.fontSizes.F18,
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  error: {
    color: theme.colors.rojo,
    marginVertical: -2,
    marginLeft: 4
  },
  vfyCode: {
    fontSize: 24,
    fontWeight: "600",
    textAlign: "center",
    letterSpacing: 4,
    minWidth: 180
  },
  eye: {
    position: "absolute",
    top: 32,
    right: 12,
    zIndex: 1
  },
  lowerText: {
    marginLeft: 4,
    color: theme.colors.grisOscuro
  },
  button: {
    marginTop: 12,
    paddingTop: 2,
    paddingBottom: 4,
    paddingHorizontal: 20
  }
})