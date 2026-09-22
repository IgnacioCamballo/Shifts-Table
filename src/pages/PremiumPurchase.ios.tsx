import React, { useState } from 'react'
import { View, Text, Alert, ImageBackground, StyleSheet, TouchableOpacity } from 'react-native'
import { useIAP, ErrorCode, finishTransaction } from 'expo-iap'
import Icon from 'react-native-vector-icons/Ionicons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'

import useCalendar from '@/hooks/useCalendar'
import { RootStackParamList } from '@/types'
import { translate } from '@/utils'
import theme from '@/theme/theme'
import { IosPaymentConfirmation } from '@/api/PaymentsAPI'

const IOS_PREMIUM_SKU = 'com.kanatzu.shiftstable.premium.yearly'

export default function PremiumPurchase() {
  const { userInfo, setUserInfo, lenguage } = useCalendar()
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>()
  const [isPurchasing, setIsPurchasing] = useState(false)

  //gets variable heigth for the screen without statusbar
  const insets = useSafeAreaInsets()
  const noFooterNoHeaderHeight = theme.heigth.screenHeight - insets.top - Math.max(insets.bottom, theme.heigth.bottomSystemBar) - theme.heigth.noFooterNoHeader

  //this way avoid of calling useCalendar in utils and translate can be used inside if functions
  function translateFn(text: string) {
    return translate({ text, lenguage })
  }

  const savePaymentSuccess = () => {
    setUserInfo({ ...userInfo, premium: true })
    navigation.replace("PremiumPurchaseSuccess")
  }

  //useIAP manages the StoreKit connection lifecycle for this screen and forwards purchase results here
  const { requestPurchase } = useIAP({
    onPurchaseSuccess: async (purchase) => {
      try {
        //Apple has no payment webhook like Stripe, so the client must confirm the purchase with our backend
        await IosPaymentConfirmation({
         productId: purchase.productId,
          transactionId: purchase.transactionId ?? '',
          purchaseToken: purchase.purchaseToken ?? ''
        })

        await finishTransaction({ purchase, isConsumable: false })
        savePaymentSuccess()
      } catch (error) {
        console.log(error)
        Alert.alert("Error", `${translateFn("errorStartingPayment")}`)
      } finally {
        setIsPurchasing(false)
      }
    },
    onPurchaseError: (error) => {
      if (error.code === ErrorCode.UserCancelled) {
        setIsPurchasing(false)
        return
      }
      console.log(error)
      setIsPurchasing(false)
      Alert.alert("Error", `${translateFn("errorStartingPayment")}`)
    }
  })

  const handlePurchase = async () => {
    setIsPurchasing(true)
    try {
      await requestPurchase({
        request: { apple: { sku: IOS_PREMIUM_SKU } },
        type: 'subs'
      })
    } catch (error) {
      console.log(error)
      setIsPurchasing(false)
    }
  }

  return (
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
        <TouchableOpacity activeOpacity={0.9} onPress={handlePurchase} disabled={isPurchasing} style={styles.button}>
          <Text style={styles.buttonText}>€ 2,99/año</Text>
        </TouchableOpacity>
      </ImageBackground>
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

