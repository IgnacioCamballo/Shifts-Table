import React, { useState } from 'react'
import { Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, View } from 'react-native'
import { useNavigate } from 'react-router-native'
import { useMutation } from '@tanstack/react-query'
import Icon from 'react-native-vector-icons/Feather'
import IconArrow from 'react-native-vector-icons/AntDesign'
import { isEmail } from 'validator'

import useCalendar from '@/hooks/useCalendar'
import theme from '@/theme/theme'
import { translate } from '@/utils'
import { logIn } from '@/api/UserAPI'

import ButtonSmall from '@/components/Atoms/Buttons/ButtonSmall'
import TransparentButton from '@/components/Atoms/Buttons/ButtonTransparent'

export default function Login() {
  const {lenguage, setCompanysInfo, setConfigInfo, setLenguage, setShifts, setUserInfo} = useCalendar()
  const navigate = useNavigate()

  //this way avoid of calling useCalendar in utils and translate can be used inside if functions
  function translateFn(text: string) {
    return translate({ text, lenguage })
  }

  const [mail, setMail] = useState("")
  const [password, setPassword] = useState("")
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState(false)

  //query to create user
  const { mutate } = useMutation({
    mutationFn: logIn,
    onError: (error) => {
      console.log(error.message)
    },
    onSuccess: (data) => {
      const userInfo = {
        userName: data.userName, 
        mail, 
        lastBackUp: data.userInfo.updatedAt, 
        premium: data.premiumEnds ? data.premiumEnds > Date.now() : false, 
        usedWithoutConnection: false
      }
      setUserInfo(userInfo),
      setCompanysInfo(data.userInfo.employers)
      setLenguage(data.userInfo.lenguage)
      setShifts(data.userInfo.shifts)
      setConfigInfo(data.userInfo.configInfo)
      navigate("/calendar")
    }
  })

  //manage onPress to create user
  const handlePress = async () => {
    if( !mail || !password || password.length < 8 || !isEmail(mail)) {
      setError(true)
    } else {
      setError(false)
      const formData = {mail, password}
      mutate(formData)
    }
  }
  
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.contentContainer} style={styles.container}>
      <TransparentButton link='/account' style={styles.arrow}>
        <IconArrow
          name="doubleleft"
          color={theme.colors.negro}
          size={20}
        />
      </TransparentButton>

      <Text style={styles.title}>{translateFn("login")}</Text>

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

      <TouchableOpacity activeOpacity={0.9} onPress={() => handlePress()}>
        <ButtonSmall color={theme.colors.grisMasClaro} buttonStyles={styles.button}>
          <Text style={styles.textButton}>{translateFn("login")}</Text>
        </ButtonSmall>
      </TouchableOpacity>
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
  text: {
    fontSize: theme.fontSizes.F18,
    marginLeft: 4
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