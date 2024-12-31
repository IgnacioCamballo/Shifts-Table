

export type EmployerProps = {
    key: number,
    name: string,
    short: string,
    wage: number,
    color: string,
}

export type ShiftProps = {
    key: string,
    employer: number,
    short: string,
    shiftEntry: Date,
    shiftExit: Date | null,
    shiftBreak: Date | null,
    shiftBreakEntry: Date | null,
    shiftBreakExit: Date | null,
    workedHours: number | null,
    workedMinutes: number | null,
    isHourlyRate?: boolean,
    wage?: number | null,
    paid: boolean,
    salary: number | null,
    color: string,
    note: string | null
}

export type ConfigInfo = {
    entry: Date | null,
    exit: Date | null,
    configBreakEntry: Date | null,
    configBreakExit: Date | null
}

export type User = {
    _id: string,
    userName: string,
    password: string,
    baseColor: string,
    buttonsColor: string,
    configInfo: ConfigInfo,
    employers: EmployerProps[],
    shifts: ShiftProps[]
}

// Used isinde front-end 
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

