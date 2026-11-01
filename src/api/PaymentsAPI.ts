import api from "@/lib/axios"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { isAxiosError } from "axios"

type IosPaymentConfirmationPayload = {
  productId: string
  transactionId: string
  purchaseToken: string
}

//Apple has no payment webhook like Stripe, so the app must confirm the purchase with the backend after StoreKit reports it
export async function IosPaymentConfirmation(payload: IosPaymentConfirmationPayload) {
  const token = await AsyncStorage.getItem("userToken")

  try {
    const { data } = await api.post("/payments/ios/confirm", payload, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    return data
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error)
    }

    // Network or unexpected errors should also fail the mutation.
    throw error
  }
}

//nothing is charged until the payment sheet is confirmed, so giving up on this request is safe
const PAYMENT_INTENT_TIMEOUT_MS = 30000

export async function createPaymentIntent(amount: number) {
  const token = await AsyncStorage.getItem("userToken")

  try {
    const {data} = await api.post("/payments/payment-intent", {amount}, {
      timeout: PAYMENT_INTENT_TIMEOUT_MS,
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