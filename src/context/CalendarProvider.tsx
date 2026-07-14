import React, { useState, createContext, useEffect } from "react"
import { Alert, Linking, Modal, Platform, StyleSheet, Text, View } from "react-native";
import { MobileAds } from 'react-native-google-mobile-ads';
import AsyncStorage from "@react-native-async-storage/async-storage"
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import * as Application from 'expo-application';

import { CalendarContextProps, ConfigInfo, EmployerProps, ShiftProps, UserInfo, RootStackParamList } from "@/types"
import theme from "@/theme/theme";
import { getUserInfo, saveUserInfo } from "@/api/UserInfoAPI";
import { translate } from "@/utils";

interface props {
  children: React.ReactNode
  routeName: keyof RootStackParamList
}

const CalendarContext = createContext<CalendarContextProps>({} as CalendarContextProps)

const CalendarProvider = ({ children, routeName }: props) => {
  const queryClient = useQueryClient()
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>()

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
  const [lenguage, setLenguage] = useState<"es" | "en" | "pt">("en")
  const [addsInitialized, setAddsInitialized] = useState(false)
  const [lastShiftCreated, setLastShiftCreated] = useState<Date>(new Date(new Date().getFullYear(), new Date().getMonth() - 1))
  const [lastBackup, setLastBackup] = useState<Date | null>()
  const [showMaintenanceAlert, setShowMaintenanceAlert] = useState(false)
  const [showUpdateAlert, setShowUpdateAlert] = useState(false)
  const [modalMessage, setModalMessage] = useState("")
  const [animateReturnToCalendar, setAnimateReturnToCalendar] = useState(false)

  //Syncs premium status with the server, in case the user has renewed or lost premium status on another device
  //Called in loadingPage when there is storagedData in device
  const syncPremiumStatus = async (lg: typeof lenguage) => {
    try {
      const data = await getUserInfo()
      if (!data) return

      //If maintenance is active, shows alert with maintenance message and stops the function
      if (data.version && data.version.maintenance.isActive) {
        setModalMessage(data.version.maintenance.message[lg])
        setShowMaintenanceAlert(true)
        return
      }

      //If the installed version is not the lastone, shows alert to update the app
      if (data.version[Platform.OS] && data.version[Platform.OS].latestVersion > Application.nativeBuildVersion!) {
        setModalMessage(data.version[Platform.OS].message[lg])
        setShowUpdateAlert(true)
        return
      }

      if (typeof data.premiumEnds === 'undefined') return

      //If premiumEnds exist or a date in the future, user is premium and updates local storage
      const isPremium = data.premiumEnds !== null && data.premiumEnds > Date.now()
      setUserInfo(previous => ({
        ...previous,
        premium: isPremium,
        lastBackUp: data.userInformation?.updatedAt || previous.lastBackUp
      }))
    } catch (error) {
      // network or unexpected errors: skip silently
      console.log(error)
    }
  }

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
      if (data.endPremium || (data.premiumEnds < Date.now() && userInfo.premium)) {
        setUserInfo({ ...userInfo, premium: false })
        queryClient.invalidateQueries({ queryKey: ["UserInfoDB"] })

        Alert.alert(
          `${translateFn("importantMessage")}`,
          `${translateFn("premiumEndsMessage")}`,
          [
            { text: translateFn("renew"), onPress: () => navigation.navigate("PremiumPurchase"), style: "cancel" },
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
    const userData = { userInfo, configInfo, companysInfo, shifts, lenguage, lastUpdate: Date.now(), lastShiftCreated, lastBackup }
    AsyncStorage.setItem("userData", JSON.stringify(userData))

    //If User is premium saves in db
    //if a change is made without connection will be saved in asyncstorage, next time app is open it will take data from storage and update
    //the states, this useEffect will be activated and save the data in the db, so no need of extra functions
    if (userInfo.premium) {
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
        addsInitialized,
        animateReturnToCalendar,
        setLastBackup,
        setUserInfo,
        setConfigInfo,
        setCompanysInfo,
        setShifts,
        setLenguage,
        setLastShiftCreated,
        syncPremiumStatus,
        setAnimateReturnToCalendar,
      }}
    >
      <Modal
        visible={showMaintenanceAlert && routeName !== "LoadingPage"}
        transparent
        animationType="fade"
      >
        <View style={styles.maintenanceOverlay}>
          <View style={styles.maintenanceCard}>
            <Text style={styles.maintenanceTitle}>{translateFn("maintenance")}</Text>
            <Text style={styles.maintenanceMessage}>{modalMessage}</Text>
          </View>
        </View>
      </Modal>
      <Modal
        visible={showUpdateAlert && routeName !== "LoadingPage"}
        transparent
        animationType="fade"
      >
        <View style={styles.maintenanceOverlay}>
          <View style={styles.maintenanceCard}>
            <Text style={styles.maintenanceTitle}>{translateFn("update")}</Text>
            <Text style={styles.maintenanceMessage}>{modalMessage}</Text>
            <View style={styles.buttons}>
              <Text 
                style={styles.buttonText} 
                onPress={() => {
                  if (Platform.OS === "ios") Linking.openURL("")
                  else Linking.openURL("https://play.google.com/store/apps/details?id=com.shiftstable")
                }}
              >{translateFn("update")}</Text>
              <Text style={[styles.buttonText, { color: theme.colors.gris }]} onPress={() => setShowUpdateAlert(false)}>{translateFn("skip")}</Text>
            </View>
          </View>
        </View>
      </Modal>
      {children}
    </CalendarContext.Provider>
  )
}

export { CalendarProvider }

export default CalendarContext

const styles = StyleSheet.create({
  maintenanceOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.55)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  maintenanceCard: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 24
  },
  maintenanceTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 12,
    color: theme.colors.negro
  },
  maintenanceMessage: {
    fontSize: 16,
    lineHeight: 22,
    color: theme.colors.negro
  },
  buttons: {
    flexDirection: "row", 
    justifyContent: "flex-end", 
    gap: 20,
    marginTop: 20
  },
  buttonText: {
    color: theme.colors.verdeBoton,
    fontWeight: "700",
  }
})