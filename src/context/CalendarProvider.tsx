import { useState, createContext, useEffect } from "react"
import { CalendarContextProps, ConfigInfo, EmployerProps, ShiftProps } from "../types"
import AsyncStorage from "@react-native-async-storage/async-storage"

interface props {
  children: JSX.Element | JSX.Element[]
}

const CalendarContext = createContext<CalendarContextProps>({} as CalendarContextProps)

const CalendarProvider = ({ children }: props) => {
  const [configInfo, setConfigInfo] = useState<ConfigInfo>({ entry: null, exit: null, configBreak: null })
  const [companysInfo, setCompanysInfo] = useState<EmployerProps[]>([])
  const [shifts, setShifts] = useState<ShiftProps[]>([])

  const [editEmployer, setEditEmployer] = useState<EmployerProps | {}>({})

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
            shiftEntry: new Date(shift.shiftEntry),
            shiftExit: shift.shiftExit ? new Date(shift.shiftExit) : null,
            shiftBreak: shift.shiftBreak ? new Date(shift.shiftBreak) : null,
            workedHours: shift.workedHours,
            workedMinutes: shift.workedMinutes,
            paid: shift.paid,
            note: shift.note
          }
          return (item)
        })
        setShifts(maped)
      }
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
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
    console.log(shifts)
  }, [shifts])

  return (
    <CalendarContext.Provider
      value={{
        configInfo,
        companysInfo,
        shifts,
        editEmployer,
        setConfigInfo,
        setCompanysInfo,
        setShifts,
        setEditEmployer
      }}
    >
      {children}
    </CalendarContext.Provider>
  )
}

export { CalendarProvider }

export default CalendarContext