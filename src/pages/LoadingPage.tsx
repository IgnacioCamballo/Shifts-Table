import React, { useEffect } from 'react'
import { Text, StyleSheet, View } from 'react-native'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import AsyncStorage from '@react-native-async-storage/async-storage'

import useCalendar from '@/hooks/useCalendar'
import { UserInfo, ConfigInfo, ShiftProps } from '@/types'
import { getUserInfo } from '@/api/UserInfoAPI'
import theme from '@/theme/theme'
import { useNavigate } from 'react-router-native'
import Spinner from '@/components/Atoms/Spinner'

export default function LoadingPage() {
  const {setCompanysInfo, setConfigInfo, setLenguage, setShifts, setUserInfo, setLastShiftCreated} = useCalendar()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  
  //gets UserInfo when login in
  const getUserInfoQuery = useQuery({
    queryKey: ["UserInfoDB"],
    queryFn: getUserInfo,
    enabled: false
  })
  
  const getStoragedInfo = async () => {
    try {
      const storagedData = await AsyncStorage.getItem("userData")
      //if there is data in the movil storage =>
      if(storagedData) {
        const parsed = await JSON.parse(storagedData)
        
        //Sets storaged CompanysInfo
        setCompanysInfo(parsed.companysInfo)

        //Sets storaged Lenguage
        setLenguage(parsed.lenguage)

        //Sets last shift created
        setLastShiftCreated(parsed.lastShiftCreated)
        
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
            paid: shift.paid,
            salary: shift.salary,
            note: shift.note,
            color: shift.color
          }
          return (item)
        })
        setShifts(maped)
        navigate("/calendar")
        //if there is not data in the movil storage => 
      } else {
        const token = await AsyncStorage.getItem("userToken")
        //if there is a token storaged but not data in the movile storage => 
        if(token) {
          await queryClient.invalidateQueries({queryKey: ["UserInfoDB"]})
          const {data, refetch, error} = getUserInfoQuery
          await refetch()
          if(error) {
            console.log(error) 
            navigate("/account/lenguage")
          }

          if(data) {
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
            navigate("/calendar")
          }
          //if there is not data nither token in the movil storage => 
        } else {
          navigate("/account/lenguage")
        }
      }
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    getStoragedInfo()
  }, [])

  return (
    <View style={styles.container}>
      <Spinner size={50} borderWidth={10}/>
      <Text>Loading Data</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    height: theme.heigth.noFooterNoHeader,
    alignItems: "center",
    justifyContent: "center",
    gap: 12
  },
})