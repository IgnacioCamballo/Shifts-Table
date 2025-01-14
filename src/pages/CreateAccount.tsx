import React, { useState } from 'react'
import { Text, View, StyleSheet, ScrollView } from 'react-native'
import { TextInput, TouchableOpacity } from 'react-native-gesture-handler'
import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-native'
import Icon from 'react-native-vector-icons/Feather'
import IconArrow from 'react-native-vector-icons/AntDesign'
import isEmail from 'validator/lib/isEmail'

import useCalendar from '@/hooks/useCalendar'
import theme from '@/theme/theme'
import { translate } from '@/utils'
import { createUser } from '@/api/UserAPI'

import ButtonSmall from '@/components/Atoms/Buttons/ButtonSmall'
import TransparentButton from '@/components/Atoms/Buttons/ButtonTransparent'

export default function CreateAccount() {
  const {lenguage, setUserInfo} = useCalendar()
  const navigate = useNavigate()

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

  //query to create user
  const { mutate } = useMutation({
    mutationFn: createUser,
    onError: (error) => {
      console.log(error.message)
      if(error.message === "used mail") {
        setRepeatedMail(true)
      }
    },
    onSuccess: () => {
      const userInfo = {userName, mail, lastBackUp: null, premium: false, usedWithoutConnection: false}
      setUserInfo(userInfo)
      navigate("/calendar")
    }
  })

  //manage onPress to create user
  const handlePress = async () => {
    setRepeatedMail(false)
    if(!userName || !mail || !password || password.length < 8 || !isEmail(mail)) {
      setError(true)
    } else {
      setError(false)
      const formData = {userName, mail, password}
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
          onChangeText={setMail}
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
          style={[styles.input, {zIndex: 0}]}
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
        {password.length < 8 && <Text style={[styles.lowerText, error && 0 < password.length && {color: theme.colors.rojo}]}>{translateFn("min8")}</Text>}
      </View>  

      <TouchableOpacity activeOpacity={0.9} onPress={() => handlePress()}>
        <ButtonSmall color={theme.colors.grisMasClaro} buttonStyles={styles.button}>
          <Text style={styles.textButton}>{translateFn("createAccount")}</Text>
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