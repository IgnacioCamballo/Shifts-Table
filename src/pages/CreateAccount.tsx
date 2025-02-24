import React, { useEffect, useState } from 'react'
import { Text, View, StyleSheet, ScrollView } from 'react-native'
import { TextInput, TouchableOpacity } from 'react-native-gesture-handler'
import { useMutation } from '@tanstack/react-query'
import { useNavigate, useParams } from 'react-router-native'
import Icon from 'react-native-vector-icons/Feather'
import IconArrow from 'react-native-vector-icons/AntDesign'
import isEmail from 'validator/lib/isEmail'

import useCalendar from '@/hooks/useCalendar'
import theme from '@/theme/theme'
import { translate } from '@/utils'
import { createUser, createValidationToken } from '@/api/UserAPI'

import ButtonSmall from '@/components/Atoms/Buttons/ButtonSmall'
import TransparentButton from '@/components/Atoms/Buttons/ButtonTransparent'
import Spinner from '@/components/Atoms/Spinner'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

export default function CreateAccount() {
  const { setUserInfo, setLenguage } = useCalendar()
  const params = useParams()
  const lenguage = params.lg!
  const type = params.type!
  
  const navigate = useNavigate()

  //gets variable heigth for the screen without statusbar
  const insets = useSafeAreaInsets()
  const noFooterNoHeaderHeight = theme.heigth.screenHeight - insets.top - insets.bottom - theme.heigth.noFooterNoHeader
  

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
  const [token, setToken] = useState("")
  const [inputToken, setInputToken] = useState("")
  const [creatingLoader, setCreatingLoader] = useState(false)

  //query to send validation token by mail
  const { mutate, isPending } = useMutation({
    mutationFn: createValidationToken,
    onError: (error) => {
      if (error.message === "used mail") {
        setRepeatedMail(true)
      }
    },
    onSuccess: (data) => {
      setToken(data.code)
      setTokenId(data.tokenid)
    }
  })

  //query to create user
  const createUserQuery = useMutation({
    mutationFn: createUser,
    onError: (error) => {
      console.log(error)
      setCreatingLoader(false)
      setTokenId("")
      setToken("")
    },
    onSuccess: () => {
      const userInfo = { userName, mail, lastBackUp: null, premium: false }
      setUserInfo(userInfo)
      setLenguage(lenguage)
      navigate("/calendar")
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

  useEffect(() => {
    if (inputToken && inputToken === token) {
      const { mutate } = createUserQuery
      const formData = { userName, password, mail, tokenId }
      mutate(formData)
      setCreatingLoader(true)
    }
  }, [inputToken])

  return (
    <ScrollView 
      showsVerticalScrollIndicator={false} 
      contentContainerStyle={[styles.contentContainer, {height: noFooterNoHeaderHeight}]} 
      style={[styles.container, {    maxHeight: noFooterNoHeaderHeight,
      }]}
    >
      {!tokenId && 
        <TransparentButton link={type === "2" ? "/account/prePurchaseLogin" : `/account/${lenguage}`} style={styles.arrow}>
          <IconArrow
            name="doubleleft"
            color={theme.colors.negro}
            size={20}
          />
        </TransparentButton>
      }

      {!tokenId ? 
        <>
          <Text style={styles.title}>{translateFn("createAccount")}</Text>

          <View style={styles.inputContainer}>
            <Text style={styles.text}>{translateFn("userName")}</Text>
            <TextInput
              style={styles.input}
              onChangeText={setUserName}
              value={userName}
              maxLength={25}
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
              maxLength={25}
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
              style={[styles.input, { zIndex: 0 }]}
              secureTextEntry={!showPass}
              onChangeText={setPassword}
              value={password}
              maxLength={25}
              placeholder={translateFn("password")}
              placeholderTextColor={theme.colors.grisMedio}
              pointerEvents='none'
            />

            <TouchableOpacity activeOpacity={0.9} onPressIn={() => setShowPass(!showPass)} style={styles.eye}>
              <Icon
                name={showPass ? "eye" : "eye-off"}
                size={20}
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
          {!creatingLoader ? 
          <>
            <Text style={styles.title}>{translateFn("validationCode")}</Text>
            <Text style={styles.textValidation}>{translateFn("validationText")}</Text>
            <TextInput 
              style={[styles.input, styles.vfyCode]}
              keyboardType='numeric'
              onChangeText={setInputToken}
              value={inputToken}
            />
          </> 
          : <>
              <Spinner style={{marginTop: 60}} size={50} borderWidth={10}/>
              <Text>{translateFn("creatingAccount")}</Text>
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
  text: {
    fontSize: theme.fontSizes.F18,
    marginLeft: 4
  },
  textValidation: {
    fontSize: theme.fontSizes.F16,
    marginHorizontal: 16
  },
  textButton: {
    fontSize: theme.fontSizes.F20,
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
  },
  vfyCode: {
    fontSize: 24,
    fontWeight: "600", 
    textAlign: "center", 
    letterSpacing: 4,
    minWidth: 180
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
    bottom: 12,
    right: 12,
    zIndex: 1
  },
  error: {
    color: theme.colors.rojo,
    marginVertical: -2,
    marginLeft: 4
  }
})