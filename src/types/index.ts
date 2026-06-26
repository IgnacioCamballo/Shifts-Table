import {z} from "zod"

export const UserInfoSchema = z.object({
    userName: z.string(),
    mail: z.string(),
    lastBackUp: z.date().nullable(),
    premium: z.boolean()
})
export type UserInfo = z.infer<typeof UserInfoSchema>

export const UserDBSchema = z.object({
    _id: z.string(),
    userName: z.string(),
    mail: z.string(),
    premiumEnds: z.number().nullable(),
    lastPayment: z.string(),
    userInfo: z.string()
})
export type UserDB = z.infer<typeof UserDBSchema>
export const UserDbArraySchema = z.array(UserDBSchema)

export type ConfigInfo = {
    baseColor: string,
    buttonsColor: string,
    entry: Date | null,
    exit: Date | null,
    configBreakEntry: Date | null,
    configBreakExit: Date | null
}

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

export type User = {
    userInfo: UserInfo,
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

//Son los types de las distintas paginas, se usan para el navigation y para el useParams, se pueden agregar mas paginas y sus parametros aca
export type RootStackParamList = {
  LoadingPage: undefined

  Calendar: undefined
  Shifts: { date: string }
  NewShift: { date: string }
  EditShift: { date: string; shift: string }

  Config: undefined
  NewEmployer: { date?: string } | undefined
  EditEmployer: { employer: number }

  Totals: { month: string }
  MonthDetail: { month: string; employer: number }

  AccountIntro: { lg: string }
  SelectLenguage: undefined
  Login: { lg: string; type: '1' | '2' }
  PassRecover: { lg: string }
  CreateAccount: { lg: string; type: '1' | '2' }
  PrePurchaseLogin: undefined
  DeleteAccount: undefined

  PremiumPurchase: undefined
  PremiumPurchaseSuccess: undefined
}

export type CalendarContextProps = {   
    userInfo: UserInfo,
    configInfo: ConfigInfo,
    companysInfo: EmployerProps[],
    shifts: ShiftProps[],
    lenguage: string,
    lastShiftCreated: Date,
    lastBackup: Date | null | undefined,
    addsInitialized: boolean,
    setUserInfo: React.Dispatch<React.SetStateAction<UserInfo>>,
    setConfigInfo: React.Dispatch<React.SetStateAction<ConfigInfo>>,
    setCompanysInfo: React.Dispatch<React.SetStateAction<EmployerProps[]>>,
    setShifts: React.Dispatch<React.SetStateAction<ShiftProps[]>>,
    setLenguage: React.Dispatch<React.SetStateAction<string>>,
    setLastShiftCreated: React.Dispatch<React.SetStateAction<Date>>,
    setLastBackup: React.Dispatch<React.SetStateAction<Date | null | undefined>>,
    syncPremiumStatus: () => Promise<void>
}

