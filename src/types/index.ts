
export type EmployerProps = {
    name: string,
    short: string,
    wage: number,
    color: string,
}

export type ShiftProps = {
    shiftEntry: Date,
    shiftExit: Date,
    shiftBreak: number,
    employer: string
}

export type ConfigInfo = {
    entry: Date | null,
    exit: Date | null,
    configBreak: number
}

export type CalendarContextProps = {   
    configInfo: ConfigInfo | {},
    companysInfo: EmployerProps[],
    shifts: ShiftProps[],
    editEmployer: EmployerProps | {},
    setConfigInfo: React.Dispatch<React.SetStateAction<ConfigInfo>>,
    setCompanysInfo: React.Dispatch<React.SetStateAction<EmployerProps[]>>,
    setShifts: React.Dispatch<React.SetStateAction<ShiftProps[]>>,
    setEditEmployer: React.Dispatch<React.SetStateAction<{} | EmployerProps>>
}

