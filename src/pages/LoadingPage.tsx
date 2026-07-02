import React, { useEffect, useRef } from 'react'
import { Animated, Image, StyleSheet, View } from 'react-native'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'

import useCalendar from '@/hooks/useCalendar'
import { UserInfo, ConfigInfo, ShiftProps, RootStackParamList } from '@/types'
import { getUserInfo } from '@/api/UserInfoAPI'
import theme from '@/theme/theme'

export default function LoadingPage() {
  const {
    setCompanysInfo, 
    setConfigInfo, 
    setLenguage, 
    setShifts, 
    setUserInfo, 
    setLastShiftCreated, 
    setLastBackup,
    syncPremiumStatus
  } = useCalendar()
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>()

  const queryClient = useQueryClient()
  const logoTranslateY = useRef(new Animated.Value(-theme.heigth.screenHeight * 0.35)).current
  const logoRotate = useRef(new Animated.Value(-45)).current
  const logoOpacity = useRef(new Animated.Value(0)).current

  //gets variable heigth for the screen without statusbar
  const insets = useSafeAreaInsets()
  const noFooterNoHeaderHeight = theme.heigth.screenHeight - insets.top - Math.max(insets.bottom, theme.heigth.bottomSystemBar) - theme.heigth.noFooterNoHeader

  //gets UserInfo when login in
  const getUserInfoQuery = useQuery({
    queryKey: ["UserInfoDB"],
    queryFn: getUserInfo,
    enabled: false
  })

  const startIntroAnimation = () => {
    return new Promise<void>((resolve) => {
      Animated.sequence([
        Animated.parallel([
          Animated.timing(logoTranslateY, {
            toValue: 28,
            duration: 702,
            useNativeDriver: true,
          }),
          Animated.timing(logoRotate, {
            toValue: 0,
            duration: 648,
            useNativeDriver: true,
          }),
          Animated.timing(logoOpacity, {
            toValue: 1,
            duration: 264,
            useNativeDriver: true,
          })
        ]),
        Animated.spring(logoTranslateY, {
          toValue: 0,
          velocity: 2.8,
          tension: 40,
          friction: 5.8,
          useNativeDriver: true,
        })
      ]).start(() => resolve())
    })
  }
  
  const getStoragedInfo = async () => {
    try {
      const storagedData = await AsyncStorage.getItem("userData")
      //if there is data in the movil storage =>
      if(storagedData) {
        const token = await AsyncStorage.getItem("userToken")
        const parsed = JSON.parse(storagedData)
        
        //Sets storaged CompanysInfo
        setCompanysInfo(parsed.companysInfo)

        //Sets storaged Lenguage
        setLenguage(parsed.lenguage)

        //Sets last shift created
        setLastShiftCreated(parsed.lastShiftCreated)
        
        //Sets last backup
        setLastBackup(parsed.lastBackup)
        
        //Sets storaged UserInfo
        const parsedUserInfo: UserInfo = parsed.userInfo
        const userInformation: UserInfo = {
          userName: parsedUserInfo.userName,
          mail: parsedUserInfo.mail,
          premium: parsedUserInfo.premium,
          lastBackUp: parsedUserInfo.lastBackUp
        } 
        setUserInfo(userInformation)
        
        //Sets storaged ConfigInfo
        const parsedConfigInfo: ConfigInfo = parsed.configInfo
        const config: ConfigInfo = {
          baseColor: parsedConfigInfo.baseColor || theme.colors.verdeBase,
          buttonsColor: parsedConfigInfo.buttonsColor || theme.colors.verdeBoton,
          entry: parsedConfigInfo.entry === null ? null : new Date(parsedConfigInfo.entry),
          exit: parsedConfigInfo.exit === null ? null : new Date(parsedConfigInfo.exit),
          configBreakEntry: parsedConfigInfo.configBreakEntry === null ? null : new Date(parsedConfigInfo.configBreakEntry),
          configBreakExit: parsedConfigInfo.configBreakExit === null ? null : new Date(parsedConfigInfo.configBreakExit)
        }
        setConfigInfo(config)

        //Sets storaged Shifts
        const parsedShifts: ShiftProps[] = parsed.shifts
        const maped = parsedShifts.map(shift => {
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
            wage: shift.wage || parsed.companysInfo.find((company: { key: number }) => company.key === shift.employer)?.wage || 0,
            paid: shift.paid,
            salary: shift.salary,
            note: shift.note,
            color: shift.color
          }
          return (item)
        })
        setShifts(maped)

        if(token) {
          syncPremiumStatus(parsed.lenguage)
        }

        return "Calendar"
        //if there is not data in the movil storage => 
      } else {
        const token = await AsyncStorage.getItem("userToken")
        //if there is a token storaged but not data in the movile storage => 
        if(token) {
          await queryClient.invalidateQueries({queryKey: ["UserInfoDB"]})
          const { refetch } = getUserInfoQuery
          const result = await refetch()

          if(result.error) {
            console.log(result.error)
            return "SelectLenguage"
          }

          if(result.data) {
            const data = result.data
            setCompanysInfo(data.userInformation.employers)
            setLenguage(data.userInformation.lenguage)
            setShifts(data.userInformation.shifts)
            setConfigInfo(data.userInformation.configInfo)
            setUserInfo({
              userName: data.userName,
              mail: data.mail,
              lastBackUp: data.userInformation.updatedAt,
              premium: data.premiumEnds !== null ? true : false
            })
            return "Calendar"
          }
          //if there is not data nither token in the movil storage => 
        } else {
          return "SelectLenguage"
        }
      }
    } catch (error) {
      console.log(error)
    }

    return "SelectLenguage"
  }

  useEffect(() => {
    const initializeApp = async () => {
      const [route] = await Promise.all([getStoragedInfo(), startIntroAnimation()])
      navigation.replace(route)
    }

    initializeApp()
  }, [])

  return (
    <View style={[styles.container, {height: noFooterNoHeaderHeight}]}> 
      <Animated.View
        style={[
          styles.logoWrapper,
          {
            opacity: logoOpacity,
            transform: [
              { translateY: logoTranslateY },
              {
                rotate: logoRotate.interpolate({
                  inputRange: [-45, 0],
                  outputRange: ['-45deg', '0deg']
                })
              }
            ]
          }
        ]}
      >
        <Image source={require('../../assets/icon.png')} style={styles.logo} resizeMode='contain' />
      </Animated.View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white"
  },
  logoWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 150,
    height: 150,
  },
})