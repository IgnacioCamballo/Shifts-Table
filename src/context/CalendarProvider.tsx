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

  const initialCompanysInfo = {
    baseColor: theme.colors.verdeBase, 
    buttonsColor: theme.colors.verdeBoton, 
    configBreakEntry: null, 
    configBreakExit: null, 
    entry: null, 
    exit: null
  }

  const initialUserInfo = {
    userName: "",
    mail: "",
    lastBackUp: null,
    premium: false,
    usedWithoutConnection: false
  }
  
  const [userInfo, setUserInfo] = useState<UserInfo>(initialUserInfo)
  const [configInfo, setConfigInfo] = useState<ConfigInfo>(initialCompanysInfo)
  const [companysInfo, setCompanysInfo] = useState<EmployerProps[]>([])
  const [shifts, setShifts] = useState<ShiftProps[]>([])
  const [lenguage, setLenguage] = useState<string>("en")
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
  const getUserInfoQuery = useQuery({
    queryKey: ["UserInfoDB"],
    queryFn: getUserInfo,
    enabled: false
  })

  useEffect(() => {
    addsInit()
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
        setLenguage,
      }}
    >
      {children}
    </CalendarContext.Provider>
  )
}

export { CalendarProvider }

export default CalendarContext