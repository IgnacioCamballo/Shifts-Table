import { isAxiosError } from "axios"
import api from "@/lib/axios"
import AsyncStorage from "@react-native-async-storage/async-storage"

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
  }  
}