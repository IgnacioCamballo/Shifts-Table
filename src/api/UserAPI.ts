import { isAxiosError } from "axios"
import api from "@/lib/axios"
import useCalendar from "@/hooks/useCalendar"
import AsyncStorage from "@react-native-async-storage/async-storage"

export async function createValidationToken(formData: {mail: string, lenguage: string}) {
  try {
    const {data} = await api.post("/users/send-verification-code", formData)
    return data
  } catch (error) {
    if(isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error)
    }
  }
}

export async function createUser(formData: {mail: string, password: string, userName: string, tokenId: string}) {
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

export async function createPassRecoveryToken(formData: {mail: string, lenguage: string}) {
  try {
    const {data} = await api.post("/users/send-pass-recovery-code", formData)
    return data
  } catch (error) {
    if(isAxiosError(error) && error.response) {
      throw new Error(error.response.status.toString())
    }
  }
}

export async function changePassword(formData: {mail: string, code: string, tokenId: string, newPass: string}) {
  try {
    const {data} = await api.put("/users/change-password", formData)
    return data
  } catch (error) {
    if(isAxiosError(error) && error.response) {
      throw new Error(error.response.status.toString())
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