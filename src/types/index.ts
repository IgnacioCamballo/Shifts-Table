
export type EmployerProps = {
    name: String,
    wage: Number,
    Color: String,
} | {}

export type ShiftProps = {
    entry: Date,
    exit: Date,
    break: Number,
    Employer: String
} | {}

export type ConfigInfo = {
    entry: Date | null,
    exit: Date | null,
    break: Number
}

export type CalendarContextProps = {   
    configInfo: ConfigInfo | {},
    companysInfo: EmployerProps[],
    shifts: ShiftProps[],
    setConfigInfo: React.Dispatch<React.SetStateAction<ConfigInfo>>,
    setCompanysInfo: React.Dispatch<React.SetStateAction<EmployerProps[]>>,
    setShifts: React.Dispatch<React.SetStateAction<ShiftProps[]>>,
}

