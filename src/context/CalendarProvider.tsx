import React, { useState, createContext, useEffect } from "react"
import { MobileAds } from 'react-native-google-mobile-ads';
import AsyncStorage from "@react-native-async-storage/async-storage"
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { CalendarContextProps, ConfigInfo, EmployerProps, ShiftProps, UserInfo } from "@/types"
import theme from "@/theme/theme";
import { getUserInfo, saveUserInfo } from "@/api/UserInfoAPI";

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
    premium: false
  }
  
  const [userInfo, setUserInfo] = useState<UserInfo>(initialUserInfo)
  const [configInfo, setConfigInfo] = useState<ConfigInfo>(initialCompanysInfo)
  const [companysInfo, setCompanysInfo] = useState<EmployerProps[]>([])
  const [shifts, setShifts] = useState<ShiftProps[]>([])
  const [lenguage, setLenguage] = useState<string>("en")
  const [addsInitialized, setAddsInitialized] = useState(false)
  const [lastShiftCreated, setLastShiftCreated] = useState<Date>(new Date(new Date().getFullYear(), new Date().getMonth() - 1))

  //Initializes adds
  const addsInit = async () => {
    try {
      await MobileAds().initialize()
      setAddsInitialized(true)
    } catch (error) {
      console.log(error)
    }
  }   
  
  //Saves user Information in db
  const { mutate } = useMutation({
    mutationFn: saveUserInfo,
    onError: (error) => {
      console.log(error)
    },
    onSuccess: (data) => {
      console.log(data)
    }
  })

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
    const userData = {userInfo, configInfo, companysInfo, shifts, lenguage, lastUpdate: Date.now(), lastShiftCreated}
    AsyncStorage.setItem("userData", JSON.stringify(userData))

    //If User is premium saves in db
    //if a change is made without connection will be saved in asyncstorage, next time app is open it will take data from storage and update
    //the states, this useEffect will be activated and save the data in the db, so no need of extra functions
    if(userInfo.premium) {
      const saveData = { configInfo, employers: companysInfo, lenguage, shifts }
      mutate(saveData)
    }
  }, [userInfo, configInfo, companysInfo, shifts, lenguage])
  
  return (
    <CalendarContext.Provider
      value={{
        userInfo,
        configInfo,
        companysInfo,
        shifts,
        lenguage,
        lastShiftCreated,
        addsInitialized,
        setUserInfo,
        setConfigInfo,
        setCompanysInfo,
        setShifts,
        setLenguage,
        setLastShiftCreated
      }}
    >
      {children}
    </CalendarContext.Provider>
  )
}

export { CalendarProvider }

export default CalendarContext