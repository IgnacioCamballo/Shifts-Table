import { useState, createContext, useEffect } from "react"
import { CalendarContextProps, ConfigInfo, EmployerProps, ShiftProps } from "../types"
import mobileAds, { MobileAds } from 'react-native-google-mobile-ads';
import AsyncStorage from "@react-native-async-storage/async-storage"

interface props {
  children: JSX.Element | JSX.Element[]
}

const CalendarContext = createContext<CalendarContextProps>({} as CalendarContextProps)

const CalendarProvider = ({ children }: props) => {
  const [configInfo, setConfigInfo] = useState<ConfigInfo>({ entry: null, exit: null, configBreak: null })
  const [companysInfo, setCompanysInfo] = useState<EmployerProps[]>([])
  const [shifts, setShifts] = useState<ShiftProps[]>([])
  const [lenguage, setLenguage] = useState<string>("es")
  const [addsInitialized, setAddsInitialized] = useState(false)

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

  const getConfigStorage = async () => {
    try {
      const storagedConfig = await AsyncStorage.getItem("config")
      if (storagedConfig !== null) {
        const parsed = JSON.parse(storagedConfig)
        const config: ConfigInfo = {
          entry: parsed.entry === null ? null : new Date(parsed.entry),
          exit: parsed.exit === null ? null : new Date(parsed.exit),
          configBreak: parsed.configBreak === null ? null : new Date(parsed.configBreak)
        }
        setConfigInfo(config)
      }
    } catch (error) {
      console.log(error)
    }
  }

  const getCompanysStorage = async () => {
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
  
  const getShiftsStorage = async () => {
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

  const getLenguageStorage = async () => {
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
  
  useEffect(() => {
    getLenguageStorage()
    getConfigStorage()
    getCompanysStorage()
    getShiftsStorage()
  }, [])

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
        configInfo,
        companysInfo,
        shifts,
        lenguage,
        addsInitialized,
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