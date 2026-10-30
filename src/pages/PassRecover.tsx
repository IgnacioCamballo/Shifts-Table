import React, { useEffect, useState } from 'react'
import { Alert, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { useMutation } from '@tanstack/react-query'
import { isEmail } from 'validator'
import IconArrow from 'react-native-vector-icons/AntDesign'
import Icon from 'react-native-vector-icons/Feather'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'

import theme from '@/theme/theme'
import { RootStackParamList } from '@/types'
import { translate } from '@/utils'
import { changePassword, createPassRecoveryToken, validateCode } from '@/api/UserAPI'

import TransparentButton from '@/components/Atoms/Buttons/ButtonTransparent'
import Spinner from '@/components/Atoms/Spinner'
import ButtonSmall from '@/components/Atoms/Buttons/ButtonSmall'
import CodeInput from '@/components/Atoms/CodeInput'

export default function PassRecover() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>()
  const params = navigation.getState().routes[navigation.getState().index].params as { lg: string }
  const lenguage = params.lg

  //gets variable heigth for the screen without statusbar
  const insets = useSafeAreaInsets()
  const noFooterNoHeaderHeight = theme.heigth.screenHeight - insets.top - Math.max(insets.bottom, theme.heigth.bottomSystemBar) - theme.heigth.noFooterNoHeader  

  //this way avoid of calling useCalendar in utils and translate can be used inside if functions
  function translateFn(text: string) {
    return translate({ text, lenguage })
  }

  const [mail, setMail] = useState("")
  const [code, setCode] = useState("")
  const [newPass, setNewPass] = useState("")
  const [repeatPass, setRepeatPass] = useState("")
  const [showPass, setShowPass] = useState(false)
  const [showRepeatPass, setShowRepeatPass] = useState(false)
  const [isTokenSended, setIsTokenSended] = useState(false)
  const [tokenId, setTokenId] = useState("")
  const [loader, setLoader] = useState(false)
  const [validatingCodeLoader, setValidatingCodeLoader] = useState(false)
  const [error, setError] = useState(false)
  const [invalidUser, setInvalidUser] = useState(false)
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

  //query to send code
  const { mutate } = useMutation({
    mutationFn: createPassRecoveryToken,
    retry: 0,
    onError: (error) => {
      if (error.message.toString() === "404") {
        setInvalidUser(true)
      } else {
        handleServerError(error.message.toString())
      }
      setLoader(false)
    },
    onSuccess: (data) => {
      setInvalidUser(false)
      setLoader(false)
      setIsTokenSended(data.tokenSend)
    }
  })
  //query to validate code
  const validateCodeQuery = useMutation({
    mutationFn: validateCode,
    retry: 0,
    onError: (error) => {
      if (error.message.toString() === "410") {
        setExpiredCode(true)
        setError(true)
      } else if (error.message.toString() === "401") {
        setInvalidCode(true)
        setError(true)
      } else {
        handleServerError(error.message.toString())
      }
      setValidatingCodeLoader(false)
    },
    onSuccess: (data) => {
      setValidatingCodeLoader(false)
      setError(false)
      setInvalidCode(false)
      setExpiredCode(false)
      setServerError("")
      setTokenId(data)
    }
  })
  //query to change password
  const changePassQuery = useMutation({
    mutationFn: changePassword,
    retry: 0,
    onError: (error) => {
      if (error.message.toString() === "410" || error.message.toString() === "401") {
        //the code is no longer valid, goes back to the code step to enter a new one
        error.message.toString() === "410" ? setExpiredCode(true) : setInvalidCode(true)
        setError(true)
        setTokenId("")
        setCode("")
        setNewPass("")
        setRepeatPass("")
      } else {
        handleServerError(error.message.toString())
      }
      setLoader(false)
    },
    onSuccess: () => {
      Alert.alert(
        '',
        translateFn("passChangedSuccess"),
        [{ text: 'OK', onPress: () => navigation.goBack() }],
        { cancelable: false }
      )
    }
  })

  useEffect(() => {
    if (code.length === 6) {
      handleValidateCode()
    } else if (code.length > 0) {
      //clears the previous code errors while the user is typing a new code
      setError(false)
      setInvalidCode(false)
      setExpiredCode(false)
      setServerError("")
    }
  }, [code])


  const handleSendPassRestoreCode = () => {
    if (!mail || !isEmail(mail)) {
      setError(true)
    } else {
      setError(false)
      setInvalidUser(false)
      setServerError("")
      setLoader(true)
      const lowerCaseMail = mail.toLowerCase()
      const formData = { mail: lowerCaseMail, lenguage }
      mutate(formData)
    }
  }

  const handleValidateCode = () => {
    if (code.length !== 6) return
    
    const {mutate} = validateCodeQuery

    setError(false)
    setInvalidCode(false)
    setExpiredCode(false)
    setServerError("")
    const lowerCaseMail = mail.toLowerCase()
    const formData = {mail: lowerCaseMail, code}
    mutate(formData)
    setValidatingCodeLoader(true)
  }

  const handleChangePassword = () => {
    if (!code || code.length !== 6 || !newPass || newPass.length < 8 || newPass !== repeatPass) {
      setError(true)
    } else {
      setError(false)
      setInvalidCode(false)
      setExpiredCode(false)
      setServerError("")
      const {mutate} = changePassQuery
      const lowerCaseMail = mail.toLowerCase()
      const formData = { mail: lowerCaseMail, code, tokenId, newPass }
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
          <Text>{tokenId ? translateFn("changingPass") : translateFn("sendingCode")}</Text>
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

          {!isTokenSended ?
            <>
              <Text style={styles.title}>{translateFn("recoverPass")}</Text>
              
              <View style={styles.inputContainer}>
                <Text style={styles.text}>{translateFn("mail")}</Text>
                <TextInput
                  textContentType='emailAddress'
                  style={styles.input}
                  onChangeText={value => setMail(value.trim().toLowerCase())}
                  value={mail}
                  maxLength={50}
                  placeholder={translateFn("placeholderMail")}
                  placeholderTextColor={theme.colors.grisMedio}
                />
                {error && mail === "" && <Text style={styles.error}>{translateFn("errorMail")}</Text>}
                {error && mail && !isEmail(mail) && <Text style={styles.error}>{translateFn("invalidMail")}</Text>}
                {invalidUser && <Text style={styles.error}>{translateFn("userNotExist")}</Text>}
                {serverError !== "" && <Text style={styles.error}>{translateFn(serverError)}</Text>}
              </View>

              <Text style={styles.text2} onPress={() => handleSendPassRestoreCode()}>{translateFn("sendRestoreCode")}</Text>
            </>
            :
            <>
              <Text style={styles.title}>{translateFn("changePass")}</Text>

              <Text style={styles.text}>{mail}</Text>
              {!tokenId ? 
                <>
                  <Text style={styles.textValidation}>{translateFn("validationText")}</Text>
                  <View style={{minWidth: 180, gap: 4}}>
                    <CodeInput
                      value={code}
                      onChange={setCode}
                      error={error && (code === "" || code.length !== 6 || invalidCode || expiredCode)}
                    />
                    {error && (code === "" || code.length !== 6 || invalidCode || expiredCode) && <Text style={styles.error}>{translateFn(expiredCode ? "expiredCode" : "invalidCode")}</Text>}
                    {serverError !== "" && <Text style={styles.error}>{translateFn(serverError)}</Text>}
                  </View>
                </> :
                <>
                  <View style={styles.inputContainer}>
                    <Text style={styles.text}>{translateFn("newPassword")}</Text>

                    <TextInput
                      style={[styles.input, styles.passwordInput, { zIndex: 0 }]}
                      secureTextEntry={!showPass}
                      onChangeText={setNewPass}
                      value={newPass}
                      maxLength={30}
                      placeholder={translateFn("password")}
                      placeholderTextColor={theme.colors.grisMedio}
                      pointerEvents='none'
                    />

                    <TouchableOpacity activeOpacity={0.9} onPressIn={() => setShowPass(!showPass)} style={styles.eye}>
                      <Icon
                        name={showPass ? "eye" : "eye-off"}
                        size={20}
                        color={theme.colors.negro}
                      />
                    </TouchableOpacity>

                    {error && newPass === "" && <Text style={styles.error}>{translateFn("errorPassword")}</Text>}
                    {newPass.length < 8 && <Text style={[styles.lowerText, error && 0 < newPass.length && { color: theme.colors.rojo }]}>{translateFn("min8")}</Text>}
                  </View>

                  <View style={styles.inputContainer}>
                    <Text style={styles.text}>{translateFn("repeatPassword")}</Text>

                    <TextInput
                      style={[styles.input, styles.passwordInput, { zIndex: 0 }]}
                      secureTextEntry={!showRepeatPass}
                      onChangeText={setRepeatPass}
                      value={repeatPass}
                      maxLength={30}
                      placeholder={translateFn("repeatPassword")}
                      placeholderTextColor={theme.colors.grisMedio}
                      pointerEvents='none'
                    />

                    <TouchableOpacity activeOpacity={0.9} onPressIn={() => setShowRepeatPass(!showRepeatPass)} style={styles.eye}>
                      <Icon
                        name={showRepeatPass ? "eye" : "eye-off"}
                        size={20}
                        color={theme.colors.negro}
                      />
                    </TouchableOpacity>

                    {error && repeatPass !== newPass && <Text style={styles.error}>{translateFn("passwordsDontMatch")}</Text>}
                  </View>

                  {serverError !== "" && <Text style={styles.error}>{translateFn(serverError)}</Text>}

                  <TouchableOpacity activeOpacity={0.9} onPress={() => handleChangePassword()}>
                    <ButtonSmall color={theme.colors.grisMasClaro} buttonStyles={styles.button}>
                      <Text style={styles.textButton}>{translateFn("changePass")}</Text>
                    </ButtonSmall>
                  </TouchableOpacity> 
                </>
              }
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
    backgroundColor: "white"
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
  passwordInput: {
    backgroundColor: theme.colors.blanco,
    color: theme.colors.negro,
  },
  error: {
    color: theme.colors.rojo,
    marginVertical: -2,
    marginLeft: 4
  },
  eye: {
    position: "absolute",
    top: Platform.OS === 'ios' ? 32 : 38,
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