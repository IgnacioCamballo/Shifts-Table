import api from "@/lib/axios"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { isAxiosError } from "axios"

export async function createPaymentIntent(amount: number) {
  const token = await AsyncStorage.getItem("userToken")

  try {
    const {data} = await api.post("/payments/payment-intent", {amount}, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    return data
  } catch (error) {
    if(isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error)
    }

    // Network or unexpected errors should also fail the mutation.
    throw error
  }
}