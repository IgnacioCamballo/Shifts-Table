import React from 'react'
import { View, Text, Button, Alert } from 'react-native'
import {StripeProvider, useStripe} from '@stripe/stripe-react-native'
import { useMutation } from '@tanstack/react-query'
import { createPaymentIntent } from '@/api/PaymentsAPI'
import { useNavigate } from 'react-router-native'
import { TouchableOpacity } from 'react-native-gesture-handler'
import useCalendar from '@/hooks/useCalendar'

export default function PremiumPurchase() {
  const {userInfo, setUserInfo} = useCalendar()
  const navigate = useNavigate()
  const {initPaymentSheet, presentPaymentSheet} = useStripe()
  const STRIPE_KEY = 'pk_test_51Qn5P2FtUznWbAOcu33hIJABd6qgSRMrPk9v1xvtupZEh7UUtX36W7AAt1UuvznbHdQMnAYU1FKO6AJlYPLGf3PP00fgLe5LmN'

  const {mutate, isPending} = useMutation({
    mutationFn: createPaymentIntent,
    onError: (error) => {
      console.log(error)
      Alert.alert("Error", "Hubo un problema al iniciar el proceso de pago")
    },
    onSuccess: (data) => {
      initializePayment(data)
    }
  })

  const initializePayment = async (data: any) => {
    const initPayment = await initPaymentSheet({
      merchantDisplayName: "Shifts-Table",
      paymentIntentClientSecret: data.paymentIntent,
    })

    if (initPayment.error) {
      console.log(initPayment.error)
      Alert.alert("Error", "Hubo un problema al iniciar el proceso de pago")
      return
    }
    
    const paymentResponse = await presentPaymentSheet()
    
    if (paymentResponse.error) {
      console.log(paymentResponse.error)
      Alert.alert(`Error code: ${paymentResponse.error.code}`, paymentResponse.error.message)
      return
    }
    savePaymentSuccess()
  }

  const savePaymentSuccess = () => {
    setUserInfo({...userInfo, premium: true})
    navigate("/premium-purchase/success")    
  }

  return (
    <StripeProvider publishableKey={STRIPE_KEY}>
      <View>
        <Text>Buy premium</Text>
        <TouchableOpacity activeOpacity={0.9} onPress={() => mutate(299)} style={{backgroundColor: "blue", padding: 10, borderRadius: 5}}>
          <Text>Buy</Text>
        </TouchableOpacity>
      </View>
    </StripeProvider>
  )
}

