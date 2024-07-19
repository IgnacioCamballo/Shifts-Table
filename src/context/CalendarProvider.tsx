import { useState, createContext, useEffect } from "react"
import { CalendarContextProps, ConfigInfo, EmployerProps, ShiftProps } from "../types"
import AsyncStorage from "@react-native-async-storage/async-storage"

interface props {
    children: JSX.Element | JSX.Element[]
}

const CalendarContext = createContext<CalendarContextProps>({} as CalendarContextProps)

const CalendarProvider = ({children}: props) => {
    const [configInfo, setConfigInfo] = useState<ConfigInfo>({entry: null, exit: null, configBreak: 0})
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
                    configBreak: parsed.break
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
                const shifts = storagedShifts ? JSON.parse(storagedShifts) : []
                setShifts(shifts) 
            }           
        } catch (error) {
            console.log(error)
        }
    }

    useEffect(()=> {
        getConfigStorage()
        getCompanysStorage()
        getShiftsStorage()
    },[])

    useEffect(()=> {
        AsyncStorage.setItem("config", JSON.stringify(configInfo))
    },[configInfo])

    useEffect(() => {
        AsyncStorage.setItem("companys", JSON.stringify(companysInfo))
    },[companysInfo])

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

export {CalendarProvider}

export default CalendarContext