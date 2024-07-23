
export type EmployerProps = {
    name: string,
    short: string,
    wage: number,
    color: string,
}

export type ShiftProps = {
    key: string,
    employer: string,
    shiftEntry: Date,
    shiftExit: Date | null,
    shiftBreak: Date | null,
    workedHours: number | null,
    workedMinutes: number | null,
    paid: boolean,
    note: string | null
}

export type ConfigInfo = {
    entry: Date | null,
    exit: Date | null,
    configBreak: Date | null
}

export type CalendarContextProps = {   
    configInfo: ConfigInfo,
    companysInfo: EmployerProps[],
    shifts: ShiftProps[],
    editEmployer: EmployerProps | {},
    setConfigInfo: React.Dispatch<React.SetStateAction<ConfigInfo>>,
    setCompanysInfo: React.Dispatch<React.SetStateAction<EmployerProps[]>>,
    setShifts: React.Dispatch<React.SetStateAction<ShiftProps[]>>,
    setEditEmployer: React.Dispatch<React.SetStateAction<{} | EmployerProps>>
}

