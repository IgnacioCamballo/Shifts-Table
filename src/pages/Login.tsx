import React, { useState } from 'react'
import { Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, View, Platform } from 'react-native'
import { useMutation } from '@tanstack/react-query'
import Icon from 'react-native-vector-icons/Feather'
import IconArrow from 'react-native-vector-icons/AntDesign'
import { isEmail } from 'validator'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'

import useCalendar from '@/hooks/useCalendar'
import theme from '@/theme/theme'
import { translate } from '@/utils'
import { logIn } from '@/api/UserAPI'
import { RootStackParamList, ShiftProps } from '@/types'

import ButtonSmall from '@/components/Atoms/Buttons/ButtonSmall'
import TransparentButton from '@/components/Atoms/Buttons/ButtonTransparent'
import Spinner from '@/components/Atoms/Spinner'

export default function Login() {
  const {setCompanysInfo, setConfigInfo, setLenguage, setShifts, setUserInfo} = useCalendar()
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>()
  const params = navigation.getState().routes[navigation.getState().index].params as {lg: string, type: string}
  const lenguage = params.lg
  const type = params.type

  //gets variable heigth for the screen without statusbar
  const insets = useSafeAreaInsets()
  const noFooterNoHeaderHeight = theme.heigth.screenHeight - insets.top - Math.max(insets.bottom, theme.heigth.bottomSystemBar) - theme.heigth.noFooterNoHeader

  //this way avoid of calling useCalendar in utils and translate can be used inside if functions
  function translateFn(text: string) {
    return translate({ text, lenguage })
  }

  const [mail, setMail] = useState("")
  const [password, setPassword] = useState("")
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState(false)
  const [errorCode, seterrorCode] = useState("")

  //query to login
  const { mutate, isPending } = useMutation({
    mutationFn: logIn,
    retry: 0,
    onError: (error) => {
      seterrorCode(error.message)
    },
    onSuccess: (data) => {
      //sets userInfo
      const userInfo = {
        userName: data.userName, 
        mail, 
        lastBackUp: data.userInfo.updatedAt, 
        premium: data.premiumEnds ? data.premiumEnds > Date.now() : false
      }
      setUserInfo(userInfo),
      setCompanysInfo(data.userInfo.employers)
      setLenguage(data.userInfo.lenguage)
      //Sets storaged Shifts
      const parsedShifts = data.userInfo.shifts
      const maped = parsedShifts.map((shift: ShiftProps) => {
        const item = {
          key: shift.key,
          employer: shift.employer,
          short: shift.short,
          shiftEntry: new Date(shift.shiftEntry),
          shiftExit: shift.shiftExit ? new Date(shift.shiftExit) : null,
          shiftBreak: shift.shiftBreak ? new Date(shift.shiftBreak) : null,
          shiftBreakEntry: shift.shiftBreakEntry ? new Date(shift.shiftBreakEntry) : null,
          shiftBreakExit: shift.shiftBreakExit ? new Date(shift.shiftBreakExit) : null,
          workedHours: shift.workedHours,
          workedMinutes: shift.workedMinutes,
          isHourlyRate: shift.isHourlyRate === false ? false : true,
          wage: shift.wage || data.userInfo.employers.find((company: { key: number }) => company.key === shift.employer)?.wage || 0,
          paid: shift.paid,
          salary: shift.salary,
          note: shift.note,
          color: shift.color
        }
        return (item)
      })
      setShifts(maped)
      //Sets configInfo
      const parsedConfigInfo = data.userInfo.configInfo
      const config = {
        baseColor: parsedConfigInfo.baseColor || theme.colors.verdeBase,
        buttonsColor: parsedConfigInfo.buttonsColor || theme.colors.verdeBoton,
        entry: parsedConfigInfo.entry === null ? null : new Date(parsedConfigInfo.entry),
        exit: parsedConfigInfo.exit === null ? null : new Date(parsedConfigInfo.exit),
        configBreakEntry: parsedConfigInfo.configBreakEntry === null ? null : new Date(parsedConfigInfo.configBreakEntry),
        configBreakExit: parsedConfigInfo.configBreakExit === null ? null : new Date(parsedConfigInfo.configBreakExit)
      }
      setConfigInfo(config)

      if (type === "2" && !userInfo.premium) {
        navigation.reset({
          index: 0,
          routes: [{ name: "PremiumPurchase" }]
        })
      } else {
        navigation.reset({
          index: 0,
          routes: [{ name: "Calendar" }]
        })
      }
    }
  })

  //manage onPress to create user
  const handlePress = () => {
    if( !mail || !password || password.length < 8 || !isEmail(mail)) {
      setError(true)
    } else {
      setError(false)
      seterrorCode("")
      const formData = {mail, password}
      mutate(formData)
    }
  }
  
  return (
    <ScrollView 
      showsVerticalScrollIndicator={false} 
      contentContainerStyle={[styles.contentContainer, {height: noFooterNoHeaderHeight}]} 
      style={[styles.container, {maxHeight: noFooterNoHeaderHeight}]}
    >
      <TransparentButton onPress={() => navigation.goBack()} style={styles.arrow}>
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
          onChangeText={value => setMail(value.toLowerCase())}
          value={mail}
          maxLength={50}
          placeholder={translateFn("placeholderMail")}
          placeholderTextColor={theme.colors.grisMedio}
        />
        {error && mail === "" && <Text style={styles.error}>{translateFn("errorMail")}</Text>}
        {error && mail && !isEmail(mail) && <Text style={styles.error}>{translateFn("invalidMail")}</Text>}
        {errorCode === "404" && <Text style={styles.error}>{translateFn("mailNoExist")}</Text>}
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
          />
        </TouchableOpacity>

        {error && password === "" && <Text style={styles.error}>{translateFn("errorPassword")}</Text>}
        {password.length < 8 && <Text style={[styles.lowerText, error && 0 < password.length && { color: theme.colors.rojo }]}>{translateFn("min8")}</Text>}
        {errorCode === "401" && <Text style={styles.error}>{translateFn("incorrectPassword")}</Text>}
      </View>

      {isPending ?
        <Spinner borderWidth={6} size={28} />
        :
        <>
          <TouchableOpacity activeOpacity={0.9} onPress={() => handlePress()}>
            <ButtonSmall color={theme.colors.grisMasClaro} buttonStyles={styles.button}>
              <Text style={styles.textButton}>{translateFn("login")}</Text>
            </ButtonSmall>
          </TouchableOpacity>
          <Text style={{marginTop: 12, color: theme.colors.gris}} onPress={() => navigation.navigate("PassRecover", { lg: lenguage })}>{translateFn("forgotPass")}</Text>
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
    top: Platform.OS === 'ios' ? 32 : 36,
    right: 12,
    zIndex: 1
  },
  error: {
    color: theme.colors.rojo,
    marginVertical: -2,
    marginLeft: 4
  }
})