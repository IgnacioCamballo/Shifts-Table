import React, { useState } from 'react'
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { useNavigate, useParams } from 'react-router-native'
import { useMutation } from '@tanstack/react-query'
import { isEmail } from 'validator'
import IconArrow from 'react-native-vector-icons/AntDesign'
import Icon from 'react-native-vector-icons/Feather'

import theme from '@/theme/theme'
import { translate } from '@/utils'
import { changePassword, createPassRecoveryToken } from '@/api/UserAPI'

import TransparentButton from '@/components/Atoms/Buttons/ButtonTransparent'
import Spinner from '@/components/Atoms/Spinner'
import ButtonSmall from '@/components/Atoms/Buttons/ButtonSmall'

export default function PassRecover() {
  const params = useParams()
  const lenguage = params.lg!
  const navigate = useNavigate()

  //this way avoid of calling useCalendar in utils and translate can be used inside if functions
  function translateFn(text: string) {
    return translate({ text, lenguage })
  }

  const [mail, setMail] = useState("")
  const [code, setCode] = useState("")
  const [newPass, setNewPass] = useState("")
  const [showPass, setShowPass] = useState(false)
  const [tokenId, setTokenId] = useState("")
  const [loader, setLoader] = useState(false)
  const [error, setError] = useState(false)
  const [invalidUser, setInvalidUser] = useState(false)
  const [invalidCode, setInvalidCode] = useState(false)

  const { mutate } = useMutation({
    mutationFn: createPassRecoveryToken,
    onError: (error) => {
      console.log(error.message)
      if (error.message.toString() === "404") {
        setInvalidUser(true)
      }
    },
    onSuccess: (data) => {
      setInvalidUser(false)
      setLoader(false)
      setTokenId(data.tokenid)
    }
  })

  //query to change password
    const changePassQuery = useMutation({
      mutationFn: changePassword,
      onError: (error) => {
        if (error.message.toString() === "401") {
          setInvalidCode(true)
        }
        setLoader(false)
        setError(true)
      },
      onSuccess: () => {
        navigate(`/account/${lenguage}/login`)
      }
    })

  const handleSendPassRestoreCode = () => {
    if (!mail || !isEmail(mail)) {
      setError(true)
    } else {
      setError(false)
      setInvalidUser(false)
      setLoader(true)
      const formData = { mail, lenguage }
      mutate(formData)
    }
  }

  const handleChangePassword = () => {
    if (!code || code.length !== 6 || !newPass || newPass.length < 8) {
      setError(true)
    } else {
      setError(false)
      setInvalidCode(false)
      const {mutate} = changePassQuery
      const formData = { mail, code, tokenId, newPass }
      mutate(formData)
      setLoader(true)
    }
  }

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.contentContainer} style={styles.container}>

      {loader ?
        <>
          <Spinner size={50} borderWidth={10} style={{ marginTop: 60 }} />
          <Text>{tokenId ? translateFn("changingPass") : translateFn("sendingCode")}</Text>
        </>
        :
        <>
          <TransparentButton link={`/account/${lenguage}`} style={styles.arrow}>
            <IconArrow
              name="doubleleft"
              color={theme.colors.negro}
              size={20}
            />
          </TransparentButton>


          {!tokenId ?
            <>
              <Text style={styles.title}>{translateFn("recoverPass")}</Text>
              
              <View style={styles.inputContainer}>
                <Text style={styles.text}>{translateFn("mail")}</Text>
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
              </View>

              <Text style={styles.text2} onPress={() => handleSendPassRestoreCode()}>{translateFn("sendRestoreCode")}</Text>
            </>
            :
            <>
              <Text style={styles.title}>{translateFn("changePass")}</Text>

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

              <View style={styles.inputContainer}>
                <Text style={styles.text}>{translateFn("newPassword")}</Text>

                <TextInput
                  style={[styles.input, { zIndex: 0 }]}
                  secureTextEntry={!showPass}
                  onChangeText={setNewPass}
                  value={newPass}
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

                {error && newPass === "" && <Text style={styles.error}>{translateFn("errorPassword")}</Text>}
                {newPass.length < 8 && <Text style={[styles.lowerText, error && 0 < newPass.length && { color: theme.colors.rojo }]}>{translateFn("min8")}</Text>}
              </View>

              <TouchableOpacity activeOpacity={0.9} onPress={() => handleChangePassword()}>
              <ButtonSmall color={theme.colors.grisMasClaro} buttonStyles={styles.button}>
                <Text style={styles.textButton}>{translateFn("changePass")}</Text>
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
    maxHeight: theme.heigth.noFooterNoHeader,
    position: "relative",
  },
  contentContainer: {
    height: theme.heigth.noFooterNoHeader,
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
    top: 36,
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