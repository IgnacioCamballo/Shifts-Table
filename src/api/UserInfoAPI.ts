import { isAxiosError } from "axios"
import api from "@/lib/axios"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { ConfigInfo, EmployerProps, ShiftProps } from "@/types"

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

export async function saveUserInfo(saveData: {configInfo: ConfigInfo, employers: EmployerProps[], lenguage: string, shifts: ShiftProps[]}) {
  const token = await AsyncStorage.getItem("userToken")
  try {
    const {data} = await api.put("/usersInfo/updateUserInfo", saveData, {
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