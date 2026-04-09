import React, { useState, createContext, useEffect } from "react"
import { MobileAds } from 'react-native-google-mobile-ads';
import AsyncStorage from "@react-native-async-storage/async-storage"
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { CalendarContextProps, ConfigInfo, EmployerProps, ShiftProps, UserInfo } from "@/types"
import theme from "@/theme/theme";
import { saveUserInfo } from "@/api/UserInfoAPI";
import { Alert } from "react-native";
import { useNavigate } from "react-router-native";
import { translate } from "@/utils";

interface props {
  children: React.ReactNode
}

const CalendarContext = createContext<CalendarContextProps>({} as CalendarContextProps)

const CalendarProvider = ({ children }: props) => {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  //this way avoid of calling useCalendar in utils and translate can be used inside if functions
  function translateFn(text: string) {
    return translate({ text, lenguage })
  }

  const initialConfigInfo = {
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
  const [configInfo, setConfigInfo] = useState<ConfigInfo>(initialConfigInfo)
  const [companysInfo, setCompanysInfo] = useState<EmployerProps[]>([])
  const [shifts, setShifts] = useState<ShiftProps[]>([])
  const [lenguage, setLenguage] = useState<string>("en")
  const [addsInitialized, setAddsInitialized] = useState(false)
  const [lastShiftCreated, setLastShiftCreated] = useState<Date>(new Date(new Date().getFullYear(), new Date().getMonth() - 1))
  const [lastBackup, setLastBackup] = useState<Date | null>()

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
      //if premium finishes sets userinfo as not premium and shows an alert and ask if the user wants to renew the premium
      if(data.endPremium || (data.premiumEnds < Date.now() && userInfo.premium)) {
        setUserInfo({...userInfo, premium: false})
        queryClient.invalidateQueries({ queryKey: ["UserInfoDB"] })

        Alert.alert(
          `${translateFn("importantMessage")}`, 
          `${translateFn("premiumEndsMessage")}`,
          [
            { text: translateFn("renew"), onPress: () => navigate("/premium-purchase"), style: "cancel"},
            { text: translateFn("close"), style: "cancel" }
          ]
        )
      }
    }
  })

  useEffect(() => {
    addsInit()
  }, [])

  useEffect(() => {
    //saves any change in the phone storage
    const userData = {userInfo, configInfo, companysInfo, shifts, lenguage, lastUpdate: Date.now(), lastShiftCreated, lastBackup}
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
        lastBackup,
        setLastBackup,
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