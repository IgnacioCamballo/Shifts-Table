import React, { useState, createContext, useEffect } from "react"
import { MobileAds } from 'react-native-google-mobile-ads';
import AsyncStorage from "@react-native-async-storage/async-storage"

import { CalendarContextProps, ConfigInfo, EmployerProps, ShiftProps, UserInfo } from "../types"
import theme from "../theme/theme";
import { useQuery } from "@tanstack/react-query";
import { getUser } from "../api/UserAPI";

interface props {
  children: JSX.Element | JSX.Element[]
}

const CalendarContext = createContext<CalendarContextProps>({} as CalendarContextProps)

const CalendarProvider = ({ children }: props) => {
  const [userInfo, setUserInfo] = useState<UserInfo>({} as UserInfo)
  const [configInfo, setConfigInfo] = useState<ConfigInfo>({} as ConfigInfo)
  const [companysInfo, setCompanysInfo] = useState<EmployerProps[]>([])
  const [shifts, setShifts] = useState<ShiftProps[]>([])
  const [lenguage, setLenguage] = useState<string>("es")
  const [addsInitialized, setAddsInitialized] = useState(false)

  //Initializes adds
  useEffect(() => {
    const addsInit = async () => {
      try {
        await MobileAds().initialize()
        setAddsInitialized(true)
      } catch (error) {
        console.log(error)
      }
    }
    addsInit()
  }, [])  

  const getUserInfo = async () => {
    try {
      const storagedConfig = await AsyncStorage.getItem("userInfo")
      if(storagedConfig !== null) {
        const parsed: UserInfo = JSON.parse(storagedConfig)
        const userInformation: UserInfo = {
          userName: parsed.userName || "",
          mail: parsed.mail || "",
          premium: parsed.premium || false,
          lastBackUp: parsed.lastBackUp || null,
          usedWithoutConnection: parsed.usedWithoutConnection || false
        } 
        setUserInfo(userInformation)
      }
    } catch (error) {
      console.log(error)
    }
  }

  const getConfigStoraged = async () => {
    try {
      const storagedConfig = await AsyncStorage.getItem("config")
      if (storagedConfig !== null) {
        const parsed: ConfigInfo = JSON.parse(storagedConfig)
        const config: ConfigInfo = {
          baseColor: parsed.baseColor || theme.colors.verdeBase,
          buttonsColor: parsed.buttonsColor || theme.colors.verdeBoton,
          entry: parsed.entry === null ? null : new Date(parsed.entry),
          exit: parsed.exit === null ? null : new Date(parsed.exit),
          configBreakEntry: parsed.configBreakEntry === null ? null : new Date(parsed.configBreakEntry),
          configBreakExit: parsed.configBreakExit === null ? null : new Date(parsed.configBreakExit)
        }
        setConfigInfo(config)
      }
    } catch (error) {
      console.log(error)
    }
  }

  const getCompanysStoraged = async () => {
    try {
      const storagedCompanys = await AsyncStorage.getItem('companys')
      if (storagedCompanys !== null) {
        const parsed = await JSON.parse(storagedCompanys)
        setCompanysInfo(parsed)
      }
    } catch (error) {
      console.log(error)
    }
  }
  
  const getShiftsStoraged = async () => {
    try {
      const storagedShifts = await AsyncStorage?.getItem('shifts')
      if (storagedShifts !== null) {
        const parsedShifts: ShiftProps[] = await JSON.parse(storagedShifts)
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
      }
    } catch (error) {
      console.log(error)
    }
  }

  const getLenguageStoraged = async () => {
    try {
      const storagedLenguage = await AsyncStorage.getItem('lenguage')
      if (storagedLenguage !== null) {
        const parsed = await JSON.parse(storagedLenguage)
        setLenguage(parsed)
      } else {
        setLenguage("es")
      }
    } catch (error) {
      console.log(error)
    }
  }
  
  const {data } = useQuery({
    queryKey: ["User"],
    queryFn: getUser
  })
  console.log(data)

  useEffect(() => {
    getUserInfo()
    getConfigStoraged()
    getCompanysStoraged()
    getShiftsStoraged()
    getLenguageStoraged()
  }, [])

  useEffect(() => {
    AsyncStorage.setItem("userInfo", JSON.stringify(userInfo))
  }, [userInfo])

  useEffect(() => {
    AsyncStorage.setItem("config", JSON.stringify(configInfo))
  }, [configInfo])

  useEffect(() => {
    AsyncStorage.setItem("companys", JSON.stringify(companysInfo))
  }, [companysInfo])

  useEffect(() => {
    AsyncStorage.setItem("shifts", JSON.stringify(shifts))
  }, [shifts])

  useEffect(() => {
    AsyncStorage.setItem("lenguage", JSON.stringify(lenguage))
  }, [lenguage])

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