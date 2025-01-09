import React, { useState, createContext, useEffect } from "react"
import { MobileAds } from 'react-native-google-mobile-ads';
import AsyncStorage from "@react-native-async-storage/async-storage"
import { useQuery, useQueryClient } from '@tanstack/react-query';

import { CalendarContextProps, ConfigInfo, EmployerProps, ShiftProps, UserInfo } from "@/types"
import theme from "@/theme/theme";
import { getUserInfo } from "@/api/UserInfoAPI";

interface props {
  children: JSX.Element | JSX.Element[]
}

const CalendarContext = createContext<CalendarContextProps>({} as CalendarContextProps)

const CalendarProvider = ({ children }: props) => {
  const queryClient = useQueryClient()
  queryClient.invalidateQueries({ queryKey: ["UserInfoDB"] })
  
  const [userInfo, setUserInfo] = useState<UserInfo>({} as UserInfo)
  const [configInfo, setConfigInfo] = useState<ConfigInfo>({} as ConfigInfo)
  const [companysInfo, setCompanysInfo] = useState<EmployerProps[]>([])
  const [shifts, setShifts] = useState<ShiftProps[]>([])
  const [lenguage, setLenguage] = useState<string>("es")
  const [addsInitialized, setAddsInitialized] = useState(false)
  
  //Initializes adds
  const addsInit = async () => {
    try {
      await MobileAds().initialize()
      setAddsInitialized(true)
    } catch (error) {
      console.log(error)
    }
  }   
     
  //gets UserInfo when login in
  const getUserQuery = useQuery({
    queryKey: ["UserInfoDB"],
    queryFn: getUserInfo,
    enabled: false
  })
  
  const getStoragedInfo = async () => {
    try {
      const storagedData = await AsyncStorage.getItem("userData")

      if(storagedData !== null) {
        const parsed = await JSON.parse(storagedData)
        
        //Sets storaged CompanysInfo
        setCompanysInfo(parsed.companysInfo)

        //Sets storaged Lenguage
        setLenguage(parsed.lenguage)
        
        //Sets storaged UserInfo
        const parsedUserInfo: UserInfo = parsed.userInfo
        const userInformation: UserInfo = {
          userName: parsedUserInfo.userName || "",
          mail: parsedUserInfo.mail || "",
          premium: parsedUserInfo.premium || false,
          lastBackUp: parsedUserInfo.lastBackUp || null,
          usedWithoutConnection: parsedUserInfo.usedWithoutConnection || false
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

        //si modificado sin coneccion es verdadero ver si es premium , si no poner en false, si si guardar en db
      }
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    addsInit()
    getStoragedInfo()
  }, [])

  useEffect(() => {
    const userData = {userInfo, configInfo, companysInfo, shifts, lenguage, lastUpdate: Date.now()}
    AsyncStorage.setItem("userData", JSON.stringify(userData))
    //si es premium revisar si el equipo tiene coneccion a internet, caso que no, guardar que se modifico algo sin coneccion y 
    //al abrir devuelta el programa si ese state es true y el equipo tiene internet, que guarde los datos en la db
  }, [userInfo, configInfo, companysInfo, shifts, lenguage])
  
  return (
    <CalendarContext.Provider
      value={{
        userInfo,
        configInfo,
        companysInfo,
        shifts,
        lenguage,
        addsInitialized,
        setUserInfo,
        setConfigInfo,
        setCompanysInfo,
        setShifts,
        setLenguage
      }}
    >
      {children}
    </CalendarContext.Provider>
  )
}

export { CalendarProvider }

export default CalendarContext