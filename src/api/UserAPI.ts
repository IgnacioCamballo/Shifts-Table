import { isAxiosError } from "axios"
import api from "../lib/axios"
import useCalendar from "../hooks/useCalendar"

export async function getAllUsers() {
  try {
    const {data} = await api("/users")
    console.log(data)
    return data
  } catch (error: any) {
    console.log("error de axios", error)
    if(isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error)
    }
  }  
}

export async function getUser() {
  const {userInfo} = useCalendar()
  //const token = sessionStorage.getItem("AUTH_TOKEN")
  const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3Nzk3YzJkYzFkOWJkYWM1ZGVlNzk5MiIsImlhdCI6MTczNjAxNjEyMCwiZXhwIjoxNzY3NTczNzIwfQ.evd-iRn-qSEZeCe-fqBgEepdN4_jf_-2267kjm2pCgA"

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