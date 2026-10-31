import React, { useEffect, useRef, useState } from 'react'
import { Text, View, StyleSheet, ScrollView, Platform, TouchableOpacity } from 'react-native'
import { TextInput } from 'react-native-gesture-handler'
import { useMutation } from '@tanstack/react-query'
import Icon from 'react-native-vector-icons/Feather'
import IconArrow from 'react-native-vector-icons/AntDesign'
import isEmail from 'validator/lib/isEmail'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'

import useCalendar from '@/hooks/useCalendar'
import { RootStackParamList } from '@/types'
import theme from '@/theme/theme'
import { translate } from '@/utils'
import { createUser, createValidationToken } from '@/api/UserAPI'

import ButtonSmall from '@/components/Atoms/Buttons/ButtonSmall'
import CodeInput from '@/components/Atoms/CodeInput'
import TransparentButton from '@/components/Atoms/Buttons/ButtonTransparent'
import Spinner from '@/components/Atoms/Spinner'

export default function CreateAccount() {
  const { setUserInfo, setLenguage } = useCalendar()

  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>()
  const params = navigation.getState().routes[navigation.getState().index].params as { lg: string, type: string }
  const lenguage = params.lg
  const type = params.type
  //gets variable heigth for the screen without statusbar
  const insets = useSafeAreaInsets()
  const noFooterNoHeaderHeight = theme.heigth.screenHeight - insets.top - Math.max(insets.bottom, theme.heigth.bottomSystemBar) - theme.heigth.noFooterNoHeader


  //this way avoid of calling useCalendar in utils and translate can be used inside if functions
  function translateFn(text: string) {
    return translate({ text, lenguage })
  }

  const [userName, setUserName] = useState("")
  const [mail, setMail] = useState("")
  const [password, setPassword] = useState("")
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState(false)
  const [repeatedMail, setRepeatedMail] = useState(false)
  const [tokenId, setTokenId] = useState("")
  const [code, setCode] = useState("")
  const [creatingLoader, setCreatingLoader] = useState(false)
  const [codeError, setCodeError] = useState(false)
  const [codeSuccess, setCodeSuccess] = useState(false)
  const redirectTimeout = useRef<ReturnType<typeof setTimeout>>(undefined)
  const [invalidCode, setInvalidCode] = useState(false)
  const [expiredCode, setExpiredCode] = useState(false)
  //translation key of the generic error (network, too many requests, unexpected)
  const [serverError, setServerError] = useState("")

  //sets the generic error message according to the error received from the api
  function handleServerError(message: string) {
    if (message === "network") setServerError("connectionError")
    else if (message === "429") setServerError("tooManyRequests")
    else setServerError("unexpectedError")
  }

  //query to send validation token by mail
  const { mutate, isPending } = useMutation({
    mutationFn: createValidationToken,
    onError: (error) => {
      if (error.message === "used mail") {
        setRepeatedMail(true)
      }
    },
    onSuccess: (data) => {
      setTokenId(data.tokenid)
    }
  })

  //query to create user
  const createUserQuery = useMutation({
    mutationFn: createUser,
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
      setCreatingLoader(false)
    },
    onSuccess: () => {
      //shows the code as correct for 2s before redirecting
      setCreatingLoader(false)
      setCodeSuccess(true)
      redirectTimeout.current = setTimeout(() => {
        const userInfo = { userName, mail, lastBackUp: null, premium: false }
        setUserInfo(userInfo)
        setLenguage(lenguage as "es" | "en" | "pt")
        if (type === "2") {
          navigation.goBack()
        } else {
          navigation.reset({
            index: 0,
            routes: [{ name: "Calendar" }]
          })
        }
      }, 2000)
    }
  })

  //manage onPress to create user
  const handlePress = async () => {
    setRepeatedMail(false)
    if (!userName || !mail || !password || password.length < 8 || !isEmail(mail)) {
      setError(true)
    } else {
      setError(false)
      const formData = { mail, lenguage }
      mutate(formData)
    }
  }

  useEffect(() => () => clearTimeout(redirectTimeout.current), [])

  useEffect(() => {
    if (code.length === 6) {
      handleCreateUser()
    } else if (code.length > 0) {
      //clears the previous code errors while the user is typing a new code
      setCodeError(false)
      setInvalidCode(false)
      setExpiredCode(false)
      setServerError("")
    }
  }, [code])

  const handleCreateUser = () => {
    if (code.length !== 6) return

    const { mutate } = createUserQuery

    setCodeError(false)
    setInvalidCode(false)
    setExpiredCode(false)
    setServerError("")
    const formData = { userName, password, mail, tokenId, code }
    mutate(formData)
    setCreatingLoader(true)
  }

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={[styles.contentContainer, { height: noFooterNoHeaderHeight }]}
      style={[styles.container, {
        maxHeight: noFooterNoHeaderHeight,
      }]}
    >
      <TransparentButton
        onPress={() => navigation.goBack()} style={styles.arrow}>
        <IconArrow
          name="double-left"
          color={theme.colors.negro}
          size={20}
        />
      </TransparentButton>

      {!tokenId ?
        <>
          <Text style={styles.title}>{translateFn("createAccount")}</Text>

          <View style={styles.inputContainer}>
            <Text style={styles.text}>{translateFn("userName")}</Text>
            <TextInput
              style={styles.input}
              onChangeText={setUserName}
              value={userName}
              maxLength={30}
              placeholder={translateFn("placeholderName")}
              placeholderTextColor={theme.colors.grisMedio}
            />
            {error && userName === "" && <Text style={styles.error}>{translateFn("errorName")}</Text>}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.text}>{translateFn("mail")}</Text>
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
            {repeatedMail && <Text style={styles.error}>{translateFn("repeatedMail")}</Text>}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.text}>{translateFn("password")}</Text>

            <TextInput
              style={[styles.input, styles.passwordInput, { zIndex: 0 }]}
              secureTextEntry={!showPass}
              onChangeText={setPassword}
              value={password}
              maxLength={30}
              placeholder={translateFn("password")}
              placeholderTextColor={theme.colors.grisMedio}
            />

            <TouchableOpacity activeOpacity={0.9} onPressIn={() => setShowPass(!showPass)} style={styles.eye}>
              <Icon
                name={showPass ? "eye" : "eye-off"}
                size={20}
                color={theme.colors.negro}
              />
            </TouchableOpacity>

            {error && password === "" && <Text style={styles.error}>{translateFn("errorPassword")}</Text>}
            {password.length < 8 && <Text style={[styles.lowerText, error && 0 < password.length && { color: theme.colors.rojo }]}>{translateFn("min8")}</Text>}
          </View>

          {isPending ?
            <Spinner borderWidth={6} size={28} />
            :
            <TouchableOpacity activeOpacity={0.9} onPress={() => handlePress()}>
              <ButtonSmall color={theme.colors.grisMasClaro} buttonStyles={styles.button}>
                <Text style={styles.textButton}>{translateFn("createAccount")}</Text>
              </ButtonSmall>
            </TouchableOpacity>
          }
        </> :
        <>
          <Text style={styles.title}>{translateFn("validationCode")}</Text>
          <Text style={styles.textValidation}>{translateFn("validationText")}</Text>
          <View style={{ minWidth: 180, gap: 4 }}>
            <CodeInput
              value={code}
              onChange={setCode}
              error={codeError}
              loading={creatingLoader}
              success={codeSuccess}
            />
            {codeError && <Text style={styles.error}>{translateFn(expiredCode ? "expiredCode" : "invalidCode")}</Text>}
            {serverError !== "" && <Text style={styles.error}>{translateFn(serverError)}</Text>}
          </View>
          {creatingLoader && <Text>{translateFn("creatingAccount")}</Text>}
        </>
      }
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
    backgroundColor: theme.colors.blanco
  },
  contentContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: Platform.OS === 'ios' ? 0 : -50,
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
  text: {
    fontSize: theme.fontSizes.F18,
    marginLeft: 4,
    color: theme.colors.negro
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
  inputContainer: {
    position: "relative",
    gap: 4
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
  passwordInput: {
    backgroundColor: theme.colors.blanco,
    color: theme.colors.negro,
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
  },
  eye: {
    position: "absolute",
    top: Platform.OS === "ios" ? 31 : 36,
    right: 12,
    zIndex: 1
  },
  error: {
    color: theme.colors.rojo,
    marginVertical: -2,
    marginLeft: 4
  }
})