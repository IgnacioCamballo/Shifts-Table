import React, { useEffect, useRef } from 'react'
import { View, Text, Alert, ImageBackground, StyleSheet, TouchableOpacity, Linking, ActivityIndicator } from 'react-native'
import { useIAP, ErrorCode, finishTransaction } from 'expo-iap'
import Icon from 'react-native-vector-icons/Ionicons'
import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'

import useCalendar from '@/hooks/useCalendar'
import { RootStackParamList } from '@/types'
import { translate } from '@/utils'
import theme from '@/theme/theme'
import { IosPaymentConfirmation } from '@/api/PaymentsAPI'
import { IOS_PREMIUM_SKU } from '@/hooks/useRecoverPurchases'

const PRIVACY_POLICY_URL = 'https://kanatzu.dev/shifts-table/politicas-de-privacidad'
//Apple gives no way to cancel a purchase, so after this time we only stop waiting; it may still complete later
const PURCHASE_TIMEOUT_MS = 60000
const EULA_URL = 'https://www.apple.com/legal/internet-services/itunes/dev/stdeula/'

export default function PremiumPurchase() {
  const { userInfo, setUserInfo, lenguage, isPurchasing, isPurchasingRef, setIsPurchasing, showPurchaseInProgress } = useCalendar()
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>()

  const purchaseTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const releasePurchase = () => {
    if (purchaseTimeoutRef.current) clearTimeout(purchaseTimeoutRef.current)
    purchaseTimeoutRef.current = null
    setIsPurchasing(false)
  }

  useEffect(() => {
    return () => {
      if (purchaseTimeoutRef.current) clearTimeout(purchaseTimeoutRef.current)
    }
  }, [])

  //covers the system back button and the iOS swipe back; the footer is guarded in its own buttons
  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (event) => {
      if (!isPurchasingRef.current) return
      event.preventDefault()
      showPurchaseInProgress()
    })
    return unsubscribe
  }, [navigation])

  useEffect(() => {
    navigation.setOptions({ gestureEnabled: !isPurchasing })
  }, [navigation, isPurchasing])

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
        //released before navigating, otherwise beforeRemove would block the replace
        releasePurchase()
        savePaymentSuccess()
      } catch (error) {
        console.log(error)
        Alert.alert("Error", `${translateFn("errorStartingPayment")}`)
      } finally {
        releasePurchase()
      }
    },
    onPurchaseError: (error) => {
      if (error.code === ErrorCode.UserCancelled) {
        releasePurchase()
        return
      }
      console.log(error)
      releasePurchase()
      Alert.alert("Error", `${translateFn("errorStartingPayment")}`)
    }
  })

  const handlePurchase = async () => {
    if (isPurchasingRef.current) return
    setIsPurchasing(true)
    purchaseTimeoutRef.current = setTimeout(() => {
      releasePurchase()
      Alert.alert("", translateFn("purchaseNotConfirmed"))
    }, PURCHASE_TIMEOUT_MS)
    try {
      await requestPurchase({
        request: { apple: { sku: IOS_PREMIUM_SKU } },
        type: 'subs'
      })
    } catch (error) {
      console.log(error)
      releasePurchase()
    }
  }

  return (
    <ImageBackground
      source={require("@/../assets/purchaseBg.jpg")}
      style={styles.background}
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
          {isPurchasing
            ? <ActivityIndicator color="white" />
            : <Text style={styles.buttonText}>€ 2,99/año</Text>}
        </TouchableOpacity>
        <View style={styles.linksCont}>
          <Text style={styles.linkText} onPress={() => Linking.openURL(PRIVACY_POLICY_URL)}>{translateFn("privacyPolicies")}</Text>
          <Text style={styles.linkText} onPress={() => Linking.openURL(EULA_URL)}>{translateFn("termsOfUse")}</Text>
        </View>
      </ImageBackground>
  )
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    padding: 52,
    //footer is absolute, so the margin makes the image end where the footer starts
    marginBottom: theme.heigth.footer,
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
  },
  linksCont: {
    marginTop: 16,
    alignItems: "center",
    gap: 4
  },
  linkText: {
    fontSize: 12,
    color: theme.colors.negro,
    opacity: 0.6,
    textDecorationLine: "underline"
  }
})

