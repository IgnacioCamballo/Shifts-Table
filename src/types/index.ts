
export type EmployerProps = {
    name: string,
    short: string,
    wage: number,
    color: string,
}

export type ShiftProps = {
    key: string,
    employer: string,
    short: string,
    shiftEntry: Date,
    shiftExit: Date | null,
    shiftBreak: Date | null,
    workedHours: number | null,
    workedMinutes: number | null,
    paid: boolean,
    salary: number | null,
    color: string,
    note: string | null
}

export type ConfigInfo = {
    entry: Date | null,
    exit: Date | null,
    configBreak: Date | null
}

export type DayProps = {
    key: string, 
    day: number, 
    isCurrentDay: boolean,
    shadowed: boolean
  }

export type CalendarContextProps = {   
    configInfo: ConfigInfo,
    companysInfo: EmployerProps[],
    shifts: ShiftProps[],
    lenguage: string,
    addsInitialized: boolean,
    setConfigInfo: React.Dispatch<React.SetStateAction<ConfigInfo>>,
    setCompanysInfo: React.Dispatch<React.SetStateAction<EmployerProps[]>>,
    setShifts: React.Dispatch<React.SetStateAction<ShiftProps[]>>,
    setLenguage: React.Dispatch<React.SetStateAction<string>>
}

