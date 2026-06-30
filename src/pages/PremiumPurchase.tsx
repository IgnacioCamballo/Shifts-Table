import React from 'react'
import { View, Text, Alert, ImageBackground, StyleSheet, TouchableOpacity } from 'react-native'
import { LinkDisplay, StripeProvider, useStripe } from '@stripe/stripe-react-native'
import { useMutation } from '@tanstack/react-query'
import Icon from 'react-native-vector-icons/Ionicons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'

import useCalendar from '@/hooks/useCalendar'
import { RootStackParamList } from '@/types'
import { translate } from '@/utils'
import theme from '@/theme/theme'
import { createPaymentIntent } from '@/api/PaymentsAPI'

export default function PremiumPurchase() {
  const { userInfo, setUserInfo, lenguage } = useCalendar()
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>()

  //gets variable heigth for the screen without statusbar
  const insets = useSafeAreaInsets()
  const noFooterNoHeaderHeight = theme.heigth.screenHeight - insets.top - Math.max(insets.bottom, theme.heigth.bottomSystemBar) - theme.heigth.noFooterNoHeader

  const { initPaymentSheet, presentPaymentSheet } = useStripe()
  //test STRIPE_KEY
  //const STRIPE_KEY = 'pk_test_51TjiDIL1y7meArd43FvHqgL6wm4ArQRmXrMfZamOezFxOMDt6LgMwjyDjhI1peijPBJwRxwrPLCiKx2kGRR3nhpU00xLcicXIc'
  //real STRIPE_KEY
  const STRIPE_KEY = 'pk_live_51TjiD8Q4E2xS70qvYUYbiQ7b5gu1VF6LNSNGxlvAB2ztG57RyBQWCPDT9wpVRlnwjVnFP3QMWSMPNYByYGXeuZES00s5Z7o9qi'

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
      applePay: {
        merchantCountryCode: "ES",
      },
      googlePay: {
        merchantCountryCode: "ES",
        currencyCode: "EUR",
        testEnv: true,
      },
      link: {
        display: LinkDisplay.NEVER
      },
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
    navigation.replace("PremiumPurchaseSuccess")
  }

  return (
    <StripeProvider publishableKey={STRIPE_KEY}>
      <ImageBackground
        source={require("@/../assets/purchaseBg.jpg")}
        style={[styles.background, { height: noFooterNoHeaderHeight }]}
      >
        <Text style={styles.preTitle}>Mejora tu cuenta a</Text>

        <View style={styles.titleCont}>
          <Text style={styles.title}>Premium  </Text>
          <Icon name="diamond-outline" size={36} color={theme.colors.verdeBase} style={{ marginBottom: -6 }} />
        </View>

        <View style={styles.benefits}>
          <View style={styles.benefitCont}>
            <Icon name="ban-sharp" size={20} />
            <Text style={styles.benefitText}>Sin publicidad</Text>
          </View>
          <View style={styles.benefitCont}>
            <Icon name="color-palette-outline" size={20} />
            <Text style={styles.benefitText}>Personaliza colores</Text>
          </View>
          <View style={styles.benefitCont}>
            <Icon name="cloud-upload-outline" size={20} />
            <Text style={styles.benefitText}>Guardado automatico en la nube</Text>
          </View>
          <View style={styles.benefitCont}>
            <Icon name="document-text-outline" size={20} />
            <Text style={styles.benefitText}>Comparte el resumen mensual</Text>
          </View>
          <View style={styles.benefitCont}>
            <Icon name="image-outline" size={20} />
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
    marginTop: -60,
    color: theme.colors.negro
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    borderBottomWidth: 1,
    color: theme.colors.negro
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
    lineHeight: 30,
    color: theme.colors.negro
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

