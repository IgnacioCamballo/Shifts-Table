import { isAxiosError } from "axios"
import api from "@/lib/axios"

export async function getUserInfo() {
  //const token = sessionStorage.getItem("AUTH_TOKEN")
  const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3Nzk3YzJkYzFkOWJkYWM1ZGVlNzk5MiIsImlhdCI6MTczNjAxNjEyMCwiZXhwIjoxNzY3NTczNzIwfQ.evd-iRn-qSEZeCe-fqBgEepdN4_jf_-2267kjm2pCgA"

  try {
    const {data, headers} = await api("/usersInfo/getUserInfo", {
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