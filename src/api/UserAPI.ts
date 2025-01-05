import { isAxiosError } from "axios"
import api from "../lib/axios"


export async function getUser() {
  //const token = sessionStorage.getItem("AUTH_TOKEN")

  try {
    const {data, headers } = await api("/users/getUser", {
      headers: {
        Authorization: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3Nzk3YzJkYzFkOWJkYWM1ZGVlNzk5MiIsImlhdCI6MTczNjAxNjEyMCwiZXhwIjoxNzY3NTczNzIwfQ.evd-iRn-qSEZeCe-fqBgEepdN4_jf_-2267kjm2pCgA"
      }
    })

    console.log(data, headers)
  } catch (error) {
    if(isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error)
    }
  }  
}