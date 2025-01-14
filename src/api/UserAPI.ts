import { isAxiosError } from "axios"
import api from "@/lib/axios"
import useCalendar from "@/hooks/useCalendar"
import AsyncStorage from "@react-native-async-storage/async-storage"

export async function createUser(formData: {mail: string, password: string, userName: string}) {
  try {
    const {data} = await api.post("/users", formData)
    AsyncStorage.setItem("userToken", data)
  } catch (error) {
    if(isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error)
    }
  }
}

export async function logIn(formData: {mail: string, password: string}) {
  try {
    const {data} = await api.post("/users/login", formData)
    AsyncStorage.setItem("userToken", data.token)
    return data
  } catch (error) {
    if(isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error)
    }
  }
}

export async function getAllUsers() {
  try {
    const {data} = await api("/users")
    return data
  } catch (error) {
    if(isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error)
    }
  }  
}

export async function getUser() {
  const {userInfo} = useCalendar()
  const token = sessionStorage.getItem("userToken")

  try {
    const {data} = await api("/users/getUser", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
  } catch (error) {
    if(isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error)
    }
  }  
}