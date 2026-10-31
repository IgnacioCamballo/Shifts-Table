import React, { useEffect, useRef, useState } from 'react'
import { Alert, Animated, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { useMutation } from '@tanstack/react-query'
import { isEmail } from 'validator'
import IconArrow from 'react-native-vector-icons/AntDesign'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'

import useCalendar from '@/hooks/useCalendar'
import useKeyboardBottomSpace from '@/hooks/useKeyboardBottomSpace'
import theme from '@/theme/theme'
import { translate } from '@/utils'
import { createDeleteToken, deletePassword, validateCode } from '@/api/UserAPI'
import { RootStackParamList } from '@/types'

import TransparentButton from '@/components/Atoms/Buttons/ButtonTransparent'
import Spinner from '@/components/Atoms/Spinner'
import ButtonSmall from '@/components/Atoms/Buttons/ButtonSmall'
import CodeInput from '@/components/Atoms/CodeInput'

export default function DeleteAccount() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>()
  const { lenguage, setShifts, setCompanysInfo, setUserInfo, setConfigInfo, setLastBackup } = useCalendar()

  //bottom space follows the keyboard, the footer is absolute so its height is the minimum space kept
  const { ref: bottomSpaceRef, style: bottomSpaceStyle } = useKeyboardBottomSpace(theme.heigth.footer)

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
  const [expiredCode, setExpiredCode] = useState(false)
  const [codeError, setCodeError] = useState(false)
  const [validatingCode, setValidatingCode] = useState(false)
  const [codeSuccess, setCodeSuccess] = useState(false)
  const successTimeout = useRef<ReturnType<typeof setTimeout>>(undefined)
  //token returned when the code is verified, needed to delete the account
  const [validatedTokenId, setValidatedTokenId] = useState("")
  //translation key of the generic error (network, too many requests, unexpected)
  const [serverError, setServerError] = useState("")

  //sets the generic error message according to the error received from the api
  function handleServerError(message: string) {
    if (message === "network") setServerError("connectionError")
    else if (message === "429") setServerError("tooManyRequests")
    else setServerError("unexpectedError")
  }

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

  //query to validate code
  const validateCodeQuery = useMutation({
    mutationFn: validateCode,
    retry: 0,
    onError: (error) => {
      if (error.message.toString() === "410") {
        setExpiredCode(true)
        setCodeError(true)
      } else if (error.message.toString() === "401") {
        setInvalidCode(true)
        setCodeError(true)
      } else {
        handleServerError(error.message.toString())
      }
      setValidatingCode(false)
    },
    onSuccess: (data) => {
      setValidatingCode(false)
      setCodeError(false)
      setInvalidCode(false)
      setExpiredCode(false)
      setServerError("")
      //shows the code as correct for 2s before replacing the input and the message with the delete button
      setCodeSuccess(true)
      successTimeout.current = setTimeout(() => setValidatedTokenId(data), 2000)
    }
  })

  //query delete account
    const deleteAccountQuery = useMutation({
      mutationFn: deletePassword,
      retry: 0,
      onError: (error) => {
        if (error.message.toString() === "410" || error.message.toString() === "401") {
          //the code is no longer valid, goes back to the code step to enter a new one
          error.message.toString() === "410" ? setExpiredCode(true) : setInvalidCode(true)
          setCodeError(true)
          setValidatedTokenId("")
          setCodeSuccess(false)
          setCode("")
        } else {
          handleServerError(error.message.toString())
        }
        setLoader(false)
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
                setShifts([])
                setCompanysInfo([])
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
                setLastBackup(null)
                navigation.replace("AccountIntro", { lg: lenguage })
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

  useEffect(() => () => clearTimeout(successTimeout.current), [])

  useEffect(() => {
    if (code.length === 6) {
      handleValidateCode()
    } else if (code.length > 0) {
      //clears the previous code errors while the user is typing a new code
      setCodeError(false)
      setInvalidCode(false)
      setExpiredCode(false)
      setServerError("")
    }
  }, [code])

  const handleValidateCode = () => {
    if (code.length !== 6) return

    const {mutate} = validateCodeQuery

    setCodeError(false)
    setInvalidCode(false)
    setExpiredCode(false)
    setServerError("")
    const formData = { mail, code }
    mutate(formData)
    setValidatingCode(true)
  }

  const handleDeleteAccount = () => {
    if (!validatedTokenId) return

    Alert.alert(
      '',
      translateFn("deleteAccountConfirm"),
      [
        {
          text: translateFn("cancel"),
          style: 'cancel'
        },
        {
          text: 'OK',
          onPress: () => {
            setServerError("")
            const {mutate} = deleteAccountQuery
            const formData = { mail, code, tokenId: validatedTokenId }
            mutate(formData)
            setLoader(true)
          }
        }
      ]
    )
  }

  return (
    <Animated.View ref={bottomSpaceRef} style={[styles.keyboardAvoiding, bottomSpaceStyle]}>
    <ScrollView
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={styles.contentContainer}
      style={styles.container}
    >

      {loader ?
        <>
          <Spinner size={50} borderWidth={10} style={{ marginTop: 60 }} />
          <Text>{tokenId ? translateFn("deletingAccount") : translateFn("sendingCode")}</Text>
        </>
        :
        <>
          <TransparentButton onPress={() => navigation.goBack()} style={styles.arrow}>
            <IconArrow
              name="double-left"
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
                  onChangeText={value => setMail(value.toLowerCase())}
                  value={mail}
                  maxLength={50}
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

              {!validatedTokenId ?
                <>
                  <Text style={styles.textValidation}>{translateFn("validationText")}</Text>
                  <View style={{minWidth: 180, gap: 4}}>
                    <CodeInput
                      value={code}
                      onChange={setCode}
                      error={codeError}
                      loading={validatingCode}
                      success={codeSuccess}
                    />
                    {codeError && <Text style={styles.error}>{translateFn(expiredCode ? "expiredCode" : "invalidCode")}</Text>}
                    {serverError !== "" && <Text style={styles.error}>{translateFn(serverError)}</Text>}
                    {codeSuccess && <Text style={styles.success}>{translateFn("correctCode")}</Text>}
                  </View>
                </>
                :
                <>
                  {serverError !== "" && <Text style={styles.error}>{translateFn(serverError)}</Text>}

                  <TouchableOpacity activeOpacity={0.9} onPress={() => handleDeleteAccount()}>
                    <ButtonSmall color={theme.colors.grisMasClaro} buttonStyles={styles.button}>
                      <Text style={styles.textButton}>{translateFn("deleteAccount")}</Text>
                    </ButtonSmall>
                  </TouchableOpacity>
                </>
              }
            </>
          }
        </>

      }
    </ScrollView>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  keyboardAvoiding: {
    flex: 1,
    backgroundColor: theme.colors.blanco
  },
  container: {
    flex: 1,
    position: "relative",
    backgroundColor: theme.colors.blanco
  },
  contentContainer: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
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
    marginLeft: 4,
    color: theme.colors.negro
  },
  text2: {
    fontSize: theme.fontSizes.F18,
    marginTop: 16,
    color: theme.colors.grisOscuro,
    textDecorationLine: "underline"
  },
  textValidation: {
    fontSize: theme.fontSizes.F16,
    marginHorizontal: 16,
    color: theme.colors.negro
  },
  textButton: {
    fontSize: theme.fontSizes.F20,
    color: theme.colors.negro,
  },
  input: {
    minWidth: "70%",
    borderColor: theme.colors.negro,
    borderWidth: 1,
    fontSize: theme.fontSizes.F18,
    paddingHorizontal: 16,
    paddingVertical: 4,
    color: theme.colors.negro,
  },
  error: {
    color: theme.colors.rojo,
    marginVertical: -2,
    marginLeft: 4
  },
  success: {
    fontSize: theme.fontSizes.F18,
    color: theme.colors.verdeBoton
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