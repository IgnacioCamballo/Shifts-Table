import { isAxiosError } from "axios"
import api from "@/lib/axios"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { ConfigInfo, EmployerProps, ShiftProps } from "@/types"
import { CURRENT_TIME_FORMAT, configForSaving, shiftsForSaving } from "@/utils/savedTimes"

export async function getUserInfo() {
  const token = await AsyncStorage.getItem("userToken")

  try {
    const {data} = await api("/usersInfo/getUserInfo", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    return data
  } catch (error) {
    if(isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error)
    }
    throw error
  }  
}

/**
 * Saves the user data in the server. The times are sent as written (clock time) with their timeFormat,
 * so every caller sends the data as the app uses it and none has to convert it.
 */
export async function saveUserInfo(saveData: {configInfo: ConfigInfo, employers: EmployerProps[], lenguage: string, shifts: ShiftProps[]}) {
  const token = await AsyncStorage.getItem("userToken")
  const dataToSend = {
    ...saveData,
    timeFormat: CURRENT_TIME_FORMAT,
    configInfo: configForSaving(saveData.configInfo),
    shifts: shiftsForSaving(saveData.shifts)
  }
  try {
    const {data} = await api.put("/usersInfo/updateUserInfo", dataToSend, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    return data
  } catch (error) {
    if(isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error)
    }
  }  
}