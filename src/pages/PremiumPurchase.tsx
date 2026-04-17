import React from 'react'
import { View, Text, Alert, ImageBackground, StyleSheet } from 'react-native'
import { StripeProvider, useStripe } from '@stripe/stripe-react-native'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-native'
import Icon from 'react-native-vector-icons/Ionicons'

import { createPaymentIntent } from '@/api/PaymentsAPI'
import useCalendar from '@/hooks/useCalendar'
import { translate } from '@/utils'
import theme from '@/theme/theme'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

export default function PremiumPurchase() {
  const { userInfo, setUserInfo, lenguage } = useCalendar()
  const navigate = useNavigate()

  //gets variable heigth for the screen without statusbar
  const insets = useSafeAreaInsets()
  const noFooterNoHeaderHeight = theme.heigth.screenHeight - insets.top - Math.max(insets.bottom, theme.heigth.bottomSystemBar) - theme.heigth.noFooterNoHeader

  const { initPaymentSheet, presentPaymentSheet } = useStripe()
  //test STRIPE_KEY
  //const STRIPE_KEY = 'pk_test_51Qn5P2FtUznWbAOcu33hIJABd6qgSRMrPk9v1xvtupZEh7UUtX36W7AAt1UuvznbHdQMnAYU1FKO6AJlYPLGf3PP00fgLe5LmN'
  //real STRIPE_KEY
  const STRIPE_KEY = 'pk_live_51Qn5OoCHSb7q7vgIzYp4xY0edmu7VEebzT64HKGe1AvSv6J6qDnpU7Cjrj2IHoL5Ew8OJ5M43EMGjTG4hMtDVLES00EeZt0v8T'

  //this way avoid of calling useCalendar in utils and translate can be used inside if functions
  function translateFn(text: string) {
    return translate({ text, lenguage })
  }

  const { mutate, isPending } = useMutation({
    mutationFn: createPaymentIntent,
    onError: (error) => {
      console.log(error)
      Alert.alert("Error", `${translateFn("errorStartingPayment")}`)
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
      Alert.alert("Error", `${translateFn("errorStartingPayment")}`)
      return
    }

    const paymentResponse = await presentPaymentSheet()

    if (paymentResponse.error) {
      Alert.alert(`Error code: ${paymentResponse.error.code}`, paymentResponse.error.message)
      return
    }
    savePaymentSuccess()
  }

  const savePaymentSuccess = () => {
    setUserInfo({ ...userInfo, premium: true })
    navigate("/premium-purchase/success")
  }

  return (
    <StripeProvider publishableKey={STRIPE_KEY}>
        <ImageBackground
          source={require("@/../assets/purchaseBg.jpg")}
          style={[styles.background, {height: noFooterNoHeaderHeight}]}
        >
            <Text style={styles.preTitle}>Mejora tu cuenta a</Text>

            <View style={styles.titleCont}>
              <Text style={styles.title}>Premium  </Text>
              <Icon name="diamond-outline" size={36} color={theme.colors.verdeBase} style={{marginBottom: -6}}/>
            </View>

            <View style={styles.benefits}> 
              <View style={styles.benefitCont}>
                <Icon name="ban-sharp" size={20}/>
                <Text style={styles.benefitText}>Sin publicidad</Text>
              </View> 
              <View style={styles.benefitCont}>
                <Icon name="color-palette-outline" size={20}/>
                <Text style={styles.benefitText}>Personaliza colores</Text>
              </View> 
              <View style={styles.benefitCont}>
                <Icon name="cloud-upload-outline" size={20}/>
                <Text style={styles.benefitText}>Guardado automatico en la nube</Text>
              </View> 
              <View style={styles.benefitCont}>
                <Icon name="document-text-outline" size={20}/>
                <Text style={styles.benefitText}>Comparte el resumen mensual</Text>
              </View> 
              <View style={styles.benefitCont}>
                <Icon name="image-outline" size={20}/>
                <Text style={styles.benefitText}>como PDF o imagen</Text>
              </View> 
            </View>
            <TouchableOpacity activeOpacity={0.9} onPress={() => mutate(299)} style={styles.button}>
              <Text style={styles.buttonText}>€ 2,99/año</Text>
            </TouchableOpacity>
        </ImageBackground>
    </StripeProvider>
  )
}

const styles = StyleSheet.create({
  background: {
    padding: 52,
    justifyContent: "center"
  },
  preTitle: {
    fontSize: 20,
    fontWeight: "600", 
    marginTop: -60
  },
  title: {
    fontSize: 32, 
    fontWeight: "700",
    borderBottomWidth: 1
  },
  titleCont: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 32,
  },
  benefits: {
    padding: 12
  },
  benefitCont: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4
  },
  benefitText: {
    fontSize: 18,
    lineHeight: 30
  },
  button: {
    backgroundColor: theme.colors.verdeBase, 
    padding: 10, 
    borderRadius: 5, 
    marginTop: 32,
    alignItems: "center"
  },
  buttonText: {
    color: "white",
    fontSize: 20,
    fontWeight: "700"
  }
})

